import './BottomNav.css';

export default function BottomNav() {
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
        <a href="/crear" className="bottom-item primary-action">
            <img src="/Logo.svg" alt="Crear" className="icon-logo-img" />
        </a>
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