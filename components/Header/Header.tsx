"use client";

import { useState } from 'react';
import './Header.css';
import SearchBar from '../SearchBar/SearchBar';

export default function Header() {

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isAdmin = false;

    return (
        <header className="header">
            <div className="logo">ЯVWD</div>
            <button 
                className="hamburger-btn" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Abrir menú"
            >
                <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            </button>
            <div className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
                { isAdmin ? (
                    <>
                        <a href="#" className="nav-link">Dashboard</a>
                        <a href="#" className="nav-link">Usuarios</a>
                        <a href="#" className="nav-link">Denuncias</a>
                        <a href="#" className="nav-link">Contenido</a>
                        <a href="#" className="nav-link">Contacto</a>
                        <a href="#" className="nav-link">Sugerencias</a>
                        <a href="#" className="nav-link">Estadísticas</a>
                        <a href="#" className="nav-link">Ajustes</a>
                    </>
                ) : (
                    <>
                        <a href="#" className="nav-link">Feed</a>
                        <a href="#" className="nav-link">Explorar</a>
                        <a href="#" className="nav-link">Artistas</a>
                        <a href="#" className="nav-link">Álbumes</a>
                        <a href="#" className="nav-link">Canciones</a>
                    </>
                )}
                
                <SearchBar placeholder="Busca canciones, usuarios, ..." />
                
                <div className="user-profile">
                    <button className="nav-button" aria-label="Notificaciones">
                        <span className="icon-bell"></span>
                    </button>
                    <button className="nav-button" aria-label="Perfil">
                        <span className="icon-user"></span>
                    </button>
                </div>
            </div>
        </header>
    );
}