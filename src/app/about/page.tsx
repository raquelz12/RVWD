'use client';

import './about.css';
import Button from '../../../components/Button/Button';
import { useModal } from '@/context/ModalContext';


export default function About() {
    const { openModal } = useModal();

    return (
        <div className="about-container">
            <div className="about-header">
                <h1 className="page-title">Sobre nosotros</h1>
                <p className="about-text">
                <span className="RVWS">RVWD</span> es una red social pensada para conectar y compartir tus gustos musicales con personas que disfrutan de la música igual que tú.
                </p>
            </div>
            <div className="about-section">
                <h2 className="block-title">¿Por qué existimos?</h2>
                <p className="about-section-text">
                    <span className="RVWS">RVWD</span> nació de una idea sencilla: la gente tiene espacios claros para compartir sus gustos de películas, series, videojuegos, pero más allá de las redes sociales tradicionales, no tenemos un espacio para que los amantes de la música podamos compartir nuestras opiniones de forma fácil y en las que crear comunidad.
                </p>
                <h2 className="block-title">Equipo</h2>
                <p className="about-section-text">
                    <span className="RVWS">RVWD</span> fue creada por una sola persona a la que simplemente le apasiona todo el mundo de la música así como crear una página en la que la gente pueda disfrutar como lo hace ella.
                </p>
                <h2 className="block-title">¿Te vienes?</h2>
                <p className="about-section-text">
                    ¡Únete a nosotros y comparte tu pasión por la música!
                </p>
                <Button className="about-button" variant="primary" onClick={() => openModal('register') }>
                    Crea tu cuenta
                </Button>
            </div>
        </div>
    );
}