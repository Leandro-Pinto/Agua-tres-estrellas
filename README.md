# CRM · Agua Tres Estrellas Pura

Sistema CRM básico (versión 1) para la gestión de clientes y pedidos de bidones de agua, basado en el documento de especificación de requerimientos (ERS) del proyecto.

## Estructura del proyecto

```
project/
├── backend/     API REST en Node.js + Express + Sequelize (SQLite)
└── frontend/    Interfaz web en React + Vite
```

## Requisitos previos

- Node.js 18 o superior (recomendado 20+)
- npm

## 1. Poner en marcha el backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed     # crea la base de datos con datos de prueba (borra datos previos)
npm run dev       # inicia la API en http://localhost:4000
```

Usuario de prueba creado por el seed:
- **Usuario:** `admin`
- **Contraseña:** `admin123`

### Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Inicia sesión y devuelve un token JWT |
| GET | `/api/clientes` | Lista clientes (filtros: `q`, `tipo`, `incluirInactivos`) |
| POST | `/api/clientes` | Registra un cliente (RF-01) |
| PUT | `/api/clientes/:id` | Edita un cliente (RF-02) |
| PATCH | `/api/clientes/:id/baja` | Baja lógica (RF-03) |
| GET | `/api/clientes/:id` | Ficha del cliente + historial de pedidos (RF-06) |
| GET | `/api/pedidos` | Lista/filtra pedidos (RF-11) |
| POST | `/api/pedidos` | Registra un pedido (RF-07, RF-08) |
| GET | `/api/pedidos/tablero` | Pedidos agrupados por estado (RF-12) |
| PATCH | `/api/pedidos/:id/estado` | Cambia el estado del pedido (RF-09, RF-10) |
| GET | `/api/dashboard/resumen` | Conteo de pedidos por estado (RF-13) |
| GET | `/api/dashboard/activos` | Pedidos activos (RF-14) |
| GET | `/api/reportes/clientes-por-tipo` | RF-15 |
| GET | `/api/reportes/clientes-inactivos` | RF-16 |
| GET | `/api/reportes/top-bidones` | RF-17 |

Todas las rutas (excepto `/api/auth/login`) requieren el header `Authorization: Bearer <token>`.

## 2. Poner en marcha el frontend

En otra terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev       # abre http://localhost:5173
```

Inicia sesión con el usuario `admin` / `admin123`.

## Alcance implementado (v1, según ERS sección 8.1)

- Gestión completa de clientes (alta, edición, baja lógica, búsqueda y filtro, historial).
- Gestión completa de pedidos (alta, cambio de estado siguiendo el embudo, tablero kanban, filtros).
- Panel (dashboard) con conteo de pedidos por estado y lista de pedidos activos.
- Reportes: clientes por tipo, clientes inactivos (con umbral configurable por frecuencia), ranking de clientes por bidones en el mes.
- Autenticación simple de un solo rol (usuario y contraseña), conforme a RNF-02.

## Pendiente para v2 (fuera de este alcance)

- Rol Repartidor con vista restringida a pedidos "En reparto".
- Notificaciones automáticas por WhatsApp.
- Facturación y pasarela de pagos.

## Notas técnicas

- La base de datos usa SQLite por simplicidad de instalación (archivo `backend/data/database.sqlite`). Para producción, basta con cambiar el `dialect` en `backend/src/config/database.js` a `postgres` o `mysql` y ajustar las credenciales — el resto del código no cambia porque usa Sequelize como ORM.
- El campo `estado` del pedido solo acepta los 4 valores válidos definidos en el ERS (ver nota de la sección 4.4): "Pedido recibido", "Pedido confirmado", "En reparto", "Entregado".
- Cambiar de estado hacia adelante solo permite avanzar un paso a la vez; retroceder requiere `forzar: true` para dejar explícito que es una corrección manual.
