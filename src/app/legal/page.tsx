import Link from 'next/link';
import '@/styles/text-page.css';
import './legal.css';
import Rvw from '../../../components/Rvw/Rvw';
import { CONTACT_EMAIL } from '@/app/lib/siteSettings';

export default function LegalPage() {
    return (
        <div className="text-page">
            
            <div className="text-page-header">
                <h1 className="page-title">Aviso legal y condiciones de uso</h1>
                <p className="text-page-intro">
                    <Rvw>RVWD</Rvw> es un proyecto personal sin ánimo de lucro y sin actividad comercial. No incluye publicidad, ventas ni ningún tipo de ingreso.
                </p>
            </div>

            <div className="legal-content">
                
                <section className="text-block">
                    <h2 className="block-title">Titular del sitio web</h2>
                    <p>Titular: Raquel</p>
                    <p>Email de contacto: <a href={`mailto:${CONTACT_EMAIL}`} className="inline-link">{CONTACT_EMAIL}</a></p>
                </section>

                <section className="text-block">
                    <h2 className="block-title">Objetivo y aceptación</h2>
                    <p>
                        <Rvw>RVWD</Rvw> es una red social en la que puedes crear un perfil, publicar contenido e interactuar con otras personas. Al acceder al sitio, crear una cuenta o usarlo, aceptas este documento, las <Link href="/rules" className="inline-link">Normas de la comunidad</Link> y la <Link href="/privacy" className="inline-link">Política de privacidad y cookies</Link>.
                    </p>
                </section>

                <section className="text-block">
                    <h2 className="block-title">Tu cuenta</h2>
                    <ul>
                        <li>Debes tener al menos 14 años.</li>
                        <li>La información que nos des debe ser veraz y estar actualizada.</li>
                        <li>Eres responsable de tu contraseña y de lo que ocurra desde tu cuenta. Si crees que alguien accede sin permiso, avísanos cuanto antes.</li>
                        <li>Solo puedes tener una cuenta.</li>
                    </ul>
                </section>

                <section className="text-block">
                    <h2 className="block-title">Tu contenido</h2>
                    <p>Lo que publicas es tuyo. Al publicarlo, nos das permiso para mostrarlo en la plataforma, de forma no exclusiva y mientras permanezca publicado. Eres responsable de tener derecho a compartirlo y de que no vulnere derechos de terceros.</p>
                </section>

                <section className="text-block">
                    <h2 className="block-title">Lo que no puedes hacer</h2>
                    <p>No puedes incumplir las normas de la comunidad, acceder a cuentas ajenas, suplantar a otras personas, usar bots o sistemas automáticos sin permiso, intentar vulnerar la seguridad del sitio ni interferir en su funcionamiento.</p>
                </section>

                <section className="text-block">
                    <h2 className="block-title">Moderación y sanciones</h2>
                    <p>Podemos ocultar o eliminar contenido y aplicar avisos, suspensiones o baneos según el sistema de tres sanciones descrito en las normas de la comunidad. Si ves contenido ilegal o que incumple las normas, ve a la página de <Link href="/rules" className="inline-link">Normas de la comunidad</Link> y consulta cómo continuar.</p>
                </section>

                <section className="text-block">
                    <h2 className="block-title">Propiedad intelectual</h2>
                    <p>Los diseños, textos, logotipos, código y demás elementos del sitio son de <Rvw>RVWD</Rvw> o se usan con licencia, y no pueden reproducirse ni distribuirse sin permiso. El contenido de los usuarios sigue siendo de quien lo publica, según el apartado de Tu contenido.</p>
                </section>

                <section className="text-block">
                    <h2 className="block-title">Disponibilidad y responsabilidad</h2>
                    <p>Nos esforzamos para que la información sea correcta y el servicio funcione, pero puede haber interrupciones por mantenimiento, errores o causas ajenas. <Rvw>RVWD</Rvw> no se hace responsable del contenido publicado por los usuarios, aunque actuará cuando se le informe de un incumplimiento. Esto no limita los derechos que la ley te reconoce como consumidor.</p>
                </section>

                <section className="text-block">
                    <h2 className="block-title">Enlaces a terceros</h2>
                    <p>Si el sitio enlaza a otras webs, no controlamos su contenido ni somos responsables de él.</p>
                </section>

                <section className="text-block">
                    <h2 className="block-title">Eliminar tu cuenta</h2>
                    <p>Puedes eliminarla cuando quieras desde <Link href="/settings" className="inline-link">Ajustes de tu perfil</Link>. Nosotros podemos suspenderla o cerrarla si se incumple este documento o las normas de la comunidad.</p>
                </section>

                <section className="text-block">
                    <h2 className="block-title">Cambios</h2>
                    <p>Podemos actualizar este documento. Si el cambio es importante, te avisaremos antes de que se aplique. Seguir usando el sitio después implica aceptarlo.</p>
                </section>

                <section className="text-block">
                    <h2 className="block-title">Ley aplicable</h2>
                    <p>Este documento se rige por la legislación española.</p>
                </section>

            </div>
        </div>
    );
}