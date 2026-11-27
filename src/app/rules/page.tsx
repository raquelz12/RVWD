'use client';

import { useState } from 'react';
import Link from 'next/link';
import '@/styles/text-page.css';
import './rules.css';
import Rvw from '../../../components/Rvw/Rvw';

const RULES = [
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

export default function NormasPage() {
    const [openRule, setOpenRule] = useState<number | null>(null);

    const toggleRule = (id: number) => {
        setOpenRule((current) => (current === id ? null : id));
    };

    return (
        <div className="text-page">
            <div className="text-page-header">
                <h1 className="page-title">Normas de la comunidad</h1>
                <p className="text-page-intro">
                    En <Rvw>RVWD</Rvw> queremos que cualquiera pueda compartir, comentar y conocer gente sin sentirse incómodo. Estas normas explican qué esperamos de ti y qué puedes esperar de nosotros. Son pocas y sencillas: si las sigues, no tendrás ningún problema.
                </p>
            </div>
            <div className="rules-columns-layout">
                {/* Normas */}
                <section>
                    <h2 className="section-title rules-col-title">¿Cuáles son las normas?</h2>
                    <ol className="accordion-list">
                        {RULES.map((rule) => {
                            const isOpen = openRule === rule.id;
                            const contentId = `rule-content-${rule.id}`;

                            return (
                                <li key={rule.id} className={`accordion-item ${isOpen ? 'is-open' : ''}`}>
                                    <button
                                        type="button"
                                        className="accordion-header"
                                        onClick={() => toggleRule(rule.id)}
                                        aria-expanded={isOpen}
                                        aria-controls={contentId}
                                    >
                                        {rule.title}
                                        <span className="accordion-chevron" aria-hidden="true">▼</span>
                                    </button>
                                    {/* inert: cerrada, el texto no se lee ni recibe foco aunque siga en el DOM para la animación */}
                                    <div id={contentId} className="accordion-content-wrapper" inert={!isOpen}>
                                        <div className="accordion-content">
                                            <p>{rule.text}</p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </section>
                {/* Sanciones */}
                <section>
                    <h2 className="section-title rules-col-title">¿Qué pasa si alguien no cumple las normas?</h2>
                    <p className="sanciones-intro">
                        Revisamos cada denuncia y actuamos de forma proporcional. Usamos un sistema de tres sanciones:
                    </p>
                    <ol className="sanciones-list">
                        <li className="sancion-card sancion-aviso">
                            <span className="sancion-badge">Sanción 1: aviso</span>
                            <p>Te comunicamos qué norma se ha incumplido y qué contenido está afectado.</p>
                        </li>
                        <li className="sancion-card sancion-mute">
                            <span className="sancion-badge">Sanción 2: suspensión temporal</span>
                            <p>No podrás publicar ni comentar durante <strong>7 días</strong>.</p>
                        </li>
                        <li className="sancion-card sancion-ban">
                            <span className="sancion-badge">Sanción 3: baneo</span>
                            <p>Cerramos tu cuenta de forma permanente.</p>
                        </li>
                    </ol>
                    <p className="sanciones-note">
                        Cada sanción caduca a los <strong>90 días</strong> si no hay nuevas infracciones.
                    </p>
                    <div className="extra-info-blocks">
                        <div className="text-block">
                            <h3 className="block-title">Casos graves</h3>
                            <p>Algunas conductas, como las amenazas, la estafa o cualquier contenido que ponga en riesgo a menores, son tan serias que podemos suspender o eliminar la cuenta sin pasar por los tres pasos.</p>
                        </div>
                        <div className="text-block">
                            <h3 className="block-title">Cómo denunciar</h3>
                            <p>Si ves algo que incumple estas normas, pulsa Denunciar en la publicación, el comentario o el perfil. Elige el motivo y, si quieres, cuéntanos más. Nuestro equipo lo revisará con la mayor brevedad posible. La persona denunciada no sabrá quién ha presentado la denuncia.</p>
                        </div>
                        <div className="text-block">
                            <h3 className="block-title">Cómo reclamar una sanción</h3>
                            <p>Si crees que nos hemos equivocado, puedes pedirnos que lo revisemos desde la <Link href="/contact" className="inline-link">página de contacto</Link>, eligiendo el asunto Problema con mi cuenta e indicando tu usuario y por qué no estás de acuerdo. Se volverá a revisar el caso y se te informará de la decisión final.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
