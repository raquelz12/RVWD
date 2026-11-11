import './Footer.css';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-links">
                <a href="#" className="footer-link">Sobre nosotros</a>
                <a href="#" className="footer-link">Política de privacidad y cookies</a>
                <a href="#" className="footer-link">Aviso legal y términos</a>
                <a href="#" className="footer-link">Normas de la comunidad</a>
                <Link href="/contact" className="footer-link">Contacto</Link>
                <Link href="/suggestions" className="footer-link">Sugerencias</Link>
            </div>
            <div className="footer-socials">
                <a href="#" className="footer-social">Facebook</a>
                <a href="#" className="footer-social">Twitter</a>
                <a href="#" className="footer-social">Instagram</a>
            </div>
            <span className="footer-copy">© 2026 RVWD. Made by Raquel.</span>
        </footer>
    );
}