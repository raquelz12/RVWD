import '@/styles/legal-text.css';
import './privacy.css';
import Rvw from '../../../components/Rvw/Rvw';

export default function PrivacyPage() {
    return (
        <div className="privacy-page-container">
            
            <div className="privacy-header-section">
                <h1 className="page-title">Política de privacidad y cookies</h1>
                <p className="privacy-main-intro">
                    Guardamos solo los datos necesarios para que tu cuenta funcione y para moderar la comunidad. No los vendemos. Puedes pedirnos que los borremos cuando quieras. Usamos pocas cookies y solo tú decides cuáles aceptar.
                </p>
            </div>
            <div className="privacy-content">
                <section className="privacy-section">
                    <h2 className="section-title">Privacidad</h2>
                    <div className="text-block">
                        <h3>Responsable de tus datos</h3>
                        <p>Raquel. rvwd@gmail.com</p>
                    </div>
                    <div className="text-block">
                        <h3>Qué datos recogemos</h3>
                        <ul className="privacy-list">
                            <li><strong>Al registrarte:</strong> nombre de usuario, correo electrónico y contraseña (guardada de forma cifrada).</li>
                            <li><strong>Al usar la red social:</strong> tu perfil, publicaciones, comentarios e interacciones.</li>
                            <li><strong>Al escribirnos:</strong> lo que indiques en los formularios de contacto y sugerencias (nombre, correo y mensaje).</li>
                            <li><strong>Datos técnicos:</strong> dirección IP, tipo de dispositivo y navegador, para la seguridad y el funcionamiento.</li>
                        </ul>
                    </div>
                    <div className="text-block">
                        <h3>Para qué los usamos y con qué base legal</h3>
                        <div className="table-responsive">
                            <table className="privacy-table">
                                <thead>
                                    <tr>
                                        <th>Finalidad</th>
                                        <th>Base legal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Crear y gestionar tu cuenta</td>
                                        <td>Ejecución del servicio que solicitas</td>
                                    </tr>
                                    <tr>
                                        <td>Responder a mensajes y sugerencias</td>
                                        <td>Tu consentimiento</td>
                                    </tr>
                                    <tr>
                                        <td>Moderar contenido y aplicar las normas</td>
                                        <td>Mantener una comunidad segura</td>
                                    </tr>
                                    <tr>
                                        <td>Seguridad y prevención de fraude</td>
                                        <td>Interés legítimo</td>
                                    </tr>
                                    <tr>
                                        <td>Estadísticas de uso y preferencias</td>
                                        <td>Tu consentimiento (cookies)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="text-block">
                        <h3>Cuánto tiempo guardamos tus datos</h3>
                        <p>Mientras tengas cuenta. Si decides eliminarla, borramos tus datos, salvo los que debamos conservar por obligación legal. Los mensajes de contacto y las sugerencias se conservan 12 meses.</p>
                    </div>
                    <div className="text-block">
                        <h3>Con quién compartimos tus datos</h3>
                        <p>No vendemos tus datos a nadie. Solo los compartimos con proveedores necesarios para el servicio, que actúan bajo contrato, o con autoridades cuando la ley lo exija.</p>
                    </div>
                    <div className="text-block">
                        <h3>Tus derechos</h3>
                        <p>Puedes pedir acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a rvwd@gmail.com. Si crees que no hemos tratado bien tus datos, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>
                    </div>
                    <div className="text-block">
                        <h3>Menores</h3>
                        <p>Para usar <Rvw>RVWD</Rvw> debes tener al menos 14 años. Si descubrimos una cuenta de una persona menor de esa edad, la cerraremos.</p>
                    </div>
                </section>
                <section className="privacy-section">
                    <h2 className="section-title">Cookies</h2>
                    <div className="text-block">
                        <h3>Qué son</h3>
                        <p>Son pequeños archivos que se guardan en tu dispositivo para que la web funcione, recuerde tus preferencias o mida cómo se usa.</p>
                    </div>
                    <div className="text-block">
                        <h3>Qué cookies usamos</h3>
                        <div className="table-responsive">
                            <table className="privacy-table">
                                <thead>
                                    <tr>
                                        <th>Tipo</th>
                                        <th>Para qué</th>
                                        <th>Duración</th>
                                        <th>¿Pide consentimiento?</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Necesarias</td>
                                        <td>Iniciar sesión y mantener la seguridad</td>
                                        <td>Sesión</td>
                                        <td>No</td>
                                    </tr>
                                    <tr>
                                        <td>Preferencias</td>
                                        <td>Recordar idioma o tema</td>
                                        <td>1 año</td>
                                        <td>Sí</td>
                                    </tr>
                                    <tr>
                                        <td>Analíticas</td>
                                        <td>Entender cómo se usa la web</td>
                                        <td>1 año</td>
                                        <td>Sí</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="table-note">No usamos cookies de publicidad.</p>
                    </div>
                    <div className="text-block">
                        <h3>Cómo gestionarlas</h3>
                        <p>Al entrar por primera vez puedes aceptarlas, rechazarlas o configurarlas. Puedes cambiar tu decisión cuando quieras o borrarlas desde los ajustes de tu navegador. No usamos cookies de terceros.</p>
                    </div>
                    <div className="text-block">
                        <h3>Cambios</h3>
                        <p>Si cambiamos esta política de forma importante, por ejemplo al añadir nuevas cookies o proveedores, te lo diremos y volveremos a pedir tu consentimiento cuando sea necesario.</p>
                    </div>
                </section>

            </div>
        </div>
    );
}