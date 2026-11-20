'use client';

import { useState } from 'react';
import Link from 'next/link';
import './rules.css';

export default function NormasPage() {
    const [openRule, setOpenRule] = useState<number | null>(null);

    const rules = [
        {
            id: 1,
            title: 'Trata a los demás con respeto',
            text: 'Puedes no estar de acuerdo con alguien, pero sin insultar, humillar ni acosar. Una buena conversación discute ideas, no personas.'
        },
        {
            id: 2,
            title: 'Sin odio ni discriminación',
            text: 'No permitimos contenido que ataque a personas por su origen, color de piel, religión, género, orientación sexual, discapacidad o cualquier otra característica.'
        },
        {
            id: 3,
            title: 'Nada de violencia ni contenido ilegal',
            text: 'No publiques amenazas, contenido que incite a la violencia ni nada que infrinja la ley.'
        },
        {
            id: 4,
            title: 'Contenido adecuado para todos',
            text: 'Aquí hay personas de distintas edades y sensibilidades. No se permite contenido sexual explícito.'
        },
        {
            id: 5,
            title: 'Sin spam ni publicidad no autorizada',
            text: 'No usamos esta comunidad como un tablón de anuncios. Evita los mensajes repetidos, los enlaces masivos y las cuentas creadas solo para promocionar algo o estafar.'
        },
        {
            id: 6,
            title: 'Protege tu privacidad y la de los demás',
            text: 'No publiques datos personales de otras personas.'
        },
        {
            id: 7,
            title: 'Sé quien eres',
            text: 'Usa un perfil real y no te hagas pasar por otra persona, marca o entidad.'
        },
        {
            id: 8,
            title: 'Publica solo lo que sea tuyo',
            text: 'Comparte contenido propio o que tengas permiso para usar, y cita siempre al autor cuando corresponda.'
        }
    ];

    const toggleRule = (id: number) => {
        setOpenRule(openRule === id ? null : id);
    };

    return (
        <div className="rules-container">
            <div className="rules-header-section">
                <h1 className="rules-main-title">Normas de la comunidad</h1>
                <p className="rules-main-intro">
                    En <span className="RVWS">ЯVWD</span> queremos que cualquiera pueda compartir, comentar y conocer gente sin sentirse incómodo. Estas normas explican qué esperamos de ti y qué puedes esperar de nosotros. Son pocas y sencillas: si las sigues, no tendrás ningún problema.
                </p>
            </div>
            <div className="rules-columns-layout">
                {/* Normas */}
                <div className="rules-column left-column">
                    <h2 className="rules-col-title">¿Cuáles son las normas?</h2>
                    <div className="accordion-list">
                        {rules.map((rule) => (
                            <div 
                                key={rule.id} 
                                className={`accordion-item ${openRule === rule.id ? 'is-open' : ''}`}
                            >
                                <button 
                                    className="accordion-header" 
                                    onClick={() => toggleRule(rule.id)}
                                    aria-expanded={openRule === rule.id}
                                >
                                    <span className="accordion-title-wrapper">
                                        {rule.title}
                                    </span>
                                    <span className="accordion-chevron">▼</span>
                                </button>
                                <div className="accordion-content-wrapper">
                                    <div className="accordion-content">
                                        <p>{rule.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Sanciones */}
                <div className="rules-column right-column">
                    <h2 className="rules-col-title">¿Qué pasa si alguien no cumple las normas?</h2>
                    <p className="sanciones-intro">
                        Revisamos cada denuncia y actuamos de forma proporcional. Usamos un sistema de tres sanciones:
                    </p>
                    <div className="sanciones-list">
                        <div className="sancion-card">
                            <div className="sancion-badge badge-aviso">Sanción 1: aviso</div>
                            <p>Te comunicamos qué norma se ha incumplido y qué contenido está afectado.</p>
                        </div>
                        <div className="sancion-card">
                            <div className="sancion-badge badge-mute">Sanción 2: suspensión temporal</div>
                            <p>No podrás publicar ni comentar durante <strong>7 días</strong>.</p>
                        </div>
                        <div className="sancion-card">
                            <div className="sancion-badge badge-ban">Sanción 3: baneo</div>
                            <p>Cerramos tu cuenta de forma permanente.</p>
                        </div>
                    </div>
                    <div className="info-alert">
                        <p>Cada sanción caduca a los <strong>90 días</strong> si no hay nuevas infracciones.</p>
                    </div>
                    <div className="extra-info-blocks">
                        <div className="extra-block">
                            <h3>Casos graves</h3>
                            <p>Algunas conductas, como las amenazas, la estafa o cualquier contenido que ponga en riesgo a menores, son tan serias que podemos suspender o eliminar la cuenta sin pasar por los tres pasos.</p>
                        </div>
                        <div className="extra-block">
                            <h3>Cómo denunciar</h3>
                            <p>Si ves algo que incumple estas normas, pulsa Denunciar en la publicación, el comentario o el perfil. Elige el motivo y, si quieres, cuéntanos más. Nuestro equipo lo revisará con la mayor brevedad posible. La persona denunciada no sabrá quién ha presentado la denuncia.</p>
                        </div>
                        <div className="extra-block">
                            <h3>Cómo reclamar una sanción</h3>
                            <p>Si crees que nos hemos equivocado, puedes pedirnos que lo revisemos desde la <Link href="/contacto" className="inline-link">página de contacto</Link>, eligiendo el asunto Problema con mi cuenta e indicando tu usuario y por qué no estás de acuerdo. Se volverá a revisar el caso y se te informará de la decisión final.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}