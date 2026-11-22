import Link from 'next/link';
import '@/styles/legal-text.css';
import './legal.css';
import Rvw from '../../../components/Rvw/Rvw';

export default function LegalPage() {
    return (
        <div className="legal-page-container">
            
            <div className="legal-header-section">
                <h1 className="page-title">Aviso legal y condiciones de uso</h1>
                <p className="legal-main-intro">
                    <Rvw>RVWD</Rvw> es un proyecto personal sin ánimo de lucro y sin actividad comercial. No incluye publicidad, ventas ni ningún tipo de ingreso.
                </p>
            </div>

            <div className="legal-content">
                
                <div className="text-block">
                    <h3>Titular del sitio web</h3>
                    <p>Titular: Raquel</p>
                    <p>Email de contacto: rvwd@gmail.com</p>
                </div>

                <div className="text-block">
                    <h3>Objetivo y aceptación</h3>
                    <p>
                        <Rvw>RVWD</Rvw> es una red social en la que puedes crear un perfil, publicar contenido e interactuar con otras personas. Al acceder al sitio, crear una cuenta o usarlo, aceptas este documento, las <Link href="/rules" className="inline-link">Normas de la comunidad</Link> y la <Link href="/privacy" className="inline-link">Política de privacidad y cookies</Link>.
                    </p>
                </div>

                <div className="text-block">
                    <h3>Tu cuenta</h3>
                    <ul className="legal-list">
                        <li>Debes tener al menos 14 años.</li>
                        <li>La información que nos des debe ser veraz y estar actualizada.</li>
                        <li>Eres responsable de tu contraseña y de lo que ocurra desde tu cuenta. Si crees que alguien accede sin permiso, avísanos cuanto antes.</li>
                        <li>Solo puedes tener una cuenta.</li>
                    </ul>
                </div>

                <div className="text-block">
                    <h3>Tu contenido</h3>
                    <p>Lo que publicas es tuyo. Al publicarlo, nos das permiso para mostrarlo en la plataforma, de forma no exclusiva y mientras permanezca publicado. Eres responsable de tener derecho a compartirlo y de que no vulnere derechos de terceros.</p>
                </div>

                <div className="text-block">
                    <h3>Lo que no puedes hacer</h3>
                    <p>No puedes incumplir las normas de la comunidad, acceder a cuentas ajenas, suplantar a otras personas, usar bots o sistemas automáticos sin permiso, intentar vulnerar la seguridad del sitio ni interferir en su funcionamiento.</p>
                </div>

                <div className="text-block">
                    <h3>Moderación y sanciones</h3>
                    <p>Podemos ocultar o eliminar contenido y aplicar avisos, suspensiones o baneos según el sistema de tres sanciones descrito en las normas de la comunidad. Si ves contenido ilegal o que incumple las normas, ve a la página de <Link href="/rules" className="inline-link">Normas de la comunidad</Link> y consulta cómo continuar.</p>
                </div>

                <div className="text-block">
                    <h3>Propiedad intelectual</h3>
                    <p>Los diseños, textos, logotipos, código y demás elementos del sitio son de <Rvw>RVWD</Rvw> o se usan con licencia, y no pueden reproducirse ni distribuirse sin permiso. El contenido de los usuarios sigue siendo de quien lo publica, según el apartado de Tu contenido.</p>
                </div>

                <div className="text-block">
                    <h3>Disponibilidad y responsabilidad</h3>
                    <p>Nos esforzamos para que la información sea correcta y el servicio funcione, pero puede haber interrupciones por mantenimiento, errores o causas ajenas. <Rvw>RVWD</Rvw> no se hace responsable del contenido publicado por los usuarios, aunque actuará cuando se le informe de un incumplimiento. Esto no limita los derechos que la ley te reconoce como consumidor.</p>
                </div>

                <div className="text-block">
                    <h3>Enlaces a terceros</h3>
                    <p>Si el sitio enlaza a otras webs, no controlamos su contenido ni somos responsables de él.</p>
                </div>

                <div className="text-block">
                    <h3>Eliminar tu cuenta</h3>
                    <p>Puedes eliminarla cuando quieras desde <strong>Ajustes de tu perfil</strong>. Nosotros podemos suspenderla o cerrarla si se incumple este documento o las normas de la comunidad.</p>
                </div>

                <div className="text-block">
                    <h3>Cambios</h3>
                    <p>Podemos actualizar este documento. Si el cambio es importante, te avisaremos antes de que se aplique. Seguir usando el sitio después implica aceptarlo.</p>
                </div>

                <div className="text-block">
                    <h3>Ley aplicable</h3>
                    <p>Este documento se rige por la legislación española.</p>
                </div>

            </div>
        </div>
    );
}