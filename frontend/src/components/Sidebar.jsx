import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Panel' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/pedidos', label: 'Pedidos' },
  { to: '/reportes', label: 'Reportes' },
];

export default function Sidebar() {
  const { usuario, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <svg className="sidebar__drop" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2C12 2 5 11.5 5 15.5C5 19.09 8.13 22 12 22C15.87 22 19 19.09 19 15.5C19 11.5 12 2 12 2Z"
            fill="#ffffff"
            fillOpacity="0.92"
          />
        </svg>
        <div className="sidebar__brand-text">
          Agua Tres Estrellas
          <small>CRM · Panel interno</small>
        </div>
      </div>

      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          className={({ isActive }) => 'sidebar__link' + (isActive ? ' active' : '')}
        >
          {l.label}
        </NavLink>
      ))}

      <div className="sidebar__footer">
        Sesión: <strong>{usuario?.nombre}</strong>
        <button className="sidebar__logout" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
