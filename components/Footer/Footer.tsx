import './Footer.css';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-links">
                <Link href="/about" className="footer-link">Sobre nosotros</Link>
                <Link href="/privacy" className="footer-link">Política de privacidad y cookies</Link>
                <Link href="/legal" className="footer-link">Aviso legal y términos</Link>
                <Link href="/rules" className="footer-link">Normas de la comunidad</Link>
                <Link href="/contact" className="footer-link">Contacto</Link>
                <Link href="/suggestions" className="footer-link">Sugerencias</Link>
            </div>
            <span className="footer-copy">© 2026 RVWD. Made by Raquel.</span>
        </footer>
    );
}