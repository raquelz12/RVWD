'use client';

import './BottomNav.css';

import { useModal } from '@/context/ModalContext';

export default function BottomNav() {
  const { openModal } = useModal();
  const isAdmin = false; 

  return (
    <nav className="bottom-nav">
      <a href="/feed" className="bottom-item">
        <span className="icon-home"></span>
      </a>
      
      <a href="/buscar" className="bottom-item">
        <span className="icon-search"></span>
      </a>

      {!isAdmin && (
        <button className="bottom-item primary-action" onClick={(e) => {
          openModal('add');
        }}>
            <img src="/Logo.svg" alt="Crear" className="icon-logo-img" />
        </button>
      )}

      <a href="/perfil" className="bottom-item active">
        <span className="icon-user"></span>
      </a>

      <a href="/notificaciones" className="bottom-item">
        <span className="icon-bell"></span>
      </a>
    </nav>
  );
}