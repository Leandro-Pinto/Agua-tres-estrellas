const { Op, fn, col, literal, QueryTypes } = require('sequelize');
const { sequelize, Cliente, Pedido } = require('../models');
const { calcularPrediccionCliente } = require('../services/prediccionConsumo');

// Umbrales de RF-16 (en días), configurables vía query string si se necesita ajustar.
const UMBRAL_DEFAULT = { Semanal: 10, Quincenal: 20, Mensual: 45, Ocasional: 90 };

// RF-15: reporte de clientes por tipo.
async function clientesPorTipo(req, res, next) {
  try {
    const filas = await Cliente.findAll({
      attributes: ['tipo', [fn('COUNT', col('id_cliente')), 'total']],
      where: { activo: true },
      group: ['tipo'],
    });
    res.json(filas);
  } catch (err) {
    next(err);
  }
}

// RF-16: clientes inactivos según su frecuencia habitual (ver ERS 4.3, RF-16).
async function clientesInactivos(req, res, next) {
  try {
    const umbral = { ...UMBRAL_DEFAULT };
    ['Semanal', 'Quincenal', 'Mensual', 'Ocasional'].forEach((f) => {
      if (req.query[f]) umbral[f] = Number(req.query[f]);
    });

    const clientes = await Cliente.findAll({
      where: { activo: true, frecuencia_habitual: { [Op.ne]: null } },
      include: [{ model: Pedido, as: 'pedidos' }],
    });

    const hoy = new Date();
    const inactivos = clientes
      .map((cliente) => {
        const entregados = cliente.pedidos.filter((p) => p.fecha_entrega_real);
        if (entregados.length === 0) return null;

        const ultimaEntrega = entregados.reduce((max, p) =>
          new Date(p.fecha_entrega_real) > new Date(max.fecha_entrega_real) ? p : max
        ).fecha_entrega_real;

        const diasSinPedido = Math.floor((hoy - new Date(ultimaEntrega)) / (1000 * 60 * 60 * 24));
        const limite = umbral[cliente.frecuencia_habitual];

        if (diasSinPedido > limite) {
          return {
            id_cliente: cliente.id_cliente,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            frecuencia_habitual: cliente.frecuencia_habitual,
            ultima_entrega: ultimaEntrega,
            dias_sin_pedido: diasSinPedido,
            umbral_dias: limite,
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.dias_sin_pedido - a.dias_sin_pedido);

    res.json({ umbral_dias: umbral, clientes: inactivos });
  } catch (err) {
    next(err);
  }
}

// Predicción de clasificación binaria para distinguir si el cliente consume agua o no.
async function prediccionConsumo(req, res, next) {
  try {
    const umbral = { ...UMBRAL_DEFAULT };
    ['Semanal', 'Quincenal', 'Mensual', 'Ocasional'].forEach((f) => {
      if (req.query[f]) umbral[f] = Number(req.query[f]);
    });

    const clientes = await Cliente.findAll({
      where: { activo: true, frecuencia_habitual: { [Op.ne]: null } },
      include: [{ model: Pedido, as: 'pedidos' }],
    });

    const hoy = new Date();

    const prediccion = clientes
      .map((cliente) => {
        const entregados = cliente.pedidos.filter((p) => p.fecha_entrega_real);
        let ultimaEntrega = null;
        let diasSinPedido = null;
        let volumenPromedio = 0;
        let estabilidad = null;
        let historialPedidos = 0;

        if (entregados.length > 0) {
          const ordenadas = [...entregados].sort((a, b) => new Date(a.fecha_entrega_real) - new Date(b.fecha_entrega_real));
          ultimaEntrega = ordenadas[ordenadas.length - 1].fecha_entrega_real;
          diasSinPedido = Math.floor((hoy - new Date(ultimaEntrega)) / (1000 * 60 * 60 * 24));
          volumenPromedio = ordenadas.reduce((sum, p) => sum + Number(p.cantidad_botellones || 0), 0) / ordenadas.length;
          historialPedidos = ordenadas.length;

          const intervalos = [];
          for (let i = 1; i < ordenadas.length; i += 1) {
            const anterior = new Date(ordenadas[i - 1].fecha_entrega_real);
            const actual = new Date(ordenadas[i].fecha_entrega_real);
            intervalos.push(Math.abs((actual - anterior) / (1000 * 60 * 60 * 24)));
          }

          if (intervalos.length > 0) {
            const promedio = intervalos.reduce((sum, gap) => sum + gap, 0) / intervalos.length;
            const desviacion = intervalos.reduce((sum, gap) => sum + Math.abs(gap - promedio), 0) / intervalos.length;
            estabilidad = Math.max(0.2, Math.min(1, 1 - desviacion / 30));
          } else {
            estabilidad = 0.7;
          }
        }

        const resultado = calcularPrediccionCliente({
          frecuencia_habitual: cliente.frecuencia_habitual,
          tipo: cliente.tipo,
          dias_sin_pedido: diasSinPedido,
          volumen_promedio: volumenPromedio,
          historial_pedidos: historialPedidos,
          estabilidad,
        });

        return {
          id_cliente: cliente.id_cliente,
          nombre: cliente.nombre,
          tipo: cliente.tipo,
          frecuencia_habitual: cliente.frecuencia_habitual,
          ultima_entrega: ultimaEntrega,
          dias_sin_pedido: diasSinPedido,
          umbral_dias: umbral[cliente.frecuencia_habitual],
          probabilidad_consumo: resultado.probabilidad_consumo,
          estado: resultado.clase_prediccion,
        };
      })
      .sort((a, b) => (b.probabilidad_consumo ?? 0) - (a.probabilidad_consumo ?? 0));

    res.json({ umbral_dias: umbral, clientes: prediccion });
  } catch (err) {
    next(err);
  }
}

// RF-17: clientes con mayor cantidad de bidones pedidos en el mes actual (o el indicado por ?mes=YYYY-MM).
async function topClientesPorBidones(req, res, next) {
  try {
    const mes = req.query.mes || new Date().toISOString().slice(0, 7);
    const inicio = new Date(`${mes}-01T00:00:00`);
    const fin = new Date(inicio);
    fin.setMonth(fin.getMonth() + 1);

    const filas = await sequelize.query(
      `
      SELECT
        p.id_cliente,
        c.nombre,
        c.tipo,
        c.telefono,
        SUM(p.cantidad_botellones) AS total_botellones
      FROM pedidos p
      INNER JOIN clientes c ON c.id_cliente = p.id_cliente
      WHERE p.fecha_solicitud >= :inicio AND p.fecha_solicitud < :fin
      GROUP BY p.id_cliente
      ORDER BY total_botellones DESC
      LIMIT 20
      `,
      {
        replacements: { inicio: inicio.toISOString(), fin: fin.toISOString() },
        type: QueryTypes.SELECT,
      }
    );

    const ranking = filas.map((row) => ({
      id_cliente: row.id_cliente,
      total_botellones: Number(row.total_botellones),
      cliente: {
        nombre: row.nombre,
        tipo: row.tipo,
        telefono: row.telefono,
      },
    }));

    res.json({ mes, ranking });
  } catch (err) {
    next(err);
  }
}

module.exports = { clientesPorTipo, clientesInactivos, prediccionConsumo, topClientesPorBidones };
