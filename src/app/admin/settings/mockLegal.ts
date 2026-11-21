// Textos legales editables desde Ajustes. De momento las páginas públicas
// (/legal, /privacy, /rules) siguen teniendo su texto en el código; con backend,
// leerán estos documentos. En el texto, las líneas que empiezan por "- " son listas.

export interface LegalSection {
    id: string;
    title: string;
    body: string;
}

export interface LegalDoc {
    id: 'legal' | 'privacy' | 'rules';
    title: string;
    href: string;
    updatedAt: string; // YYYY-MM-DD
    intro: string;
    sections: LegalSection[];
}

const s = (id: string, title: string, body: string): LegalSection => ({ id, title, body });

export const LEGAL_DOCS: LegalDoc[] = [
    {
        id: 'legal',
        title: 'Aviso legal y condiciones de uso',
        href: '/legal',
        updatedAt: '2026-09-15',
        intro: 'ЯVWD es un proyecto personal sin ánimo de lucro y sin actividad comercial. No incluye publicidad, ventas ni ningún tipo de ingreso.',
        sections: [
            s('l1', 'Titular del sitio web', 'Titular: Raquel\nEmail de contacto: rvwd@gmail.com'),
            s('l2', 'Objetivo y aceptación', 'ЯVWD es una red social en la que puedes crear un perfil, publicar contenido e interactuar con otras personas. Al acceder al sitio, crear una cuenta o usarlo, aceptas este documento, las Normas de la comunidad y la Política de privacidad y cookies.'),
            s('l3', 'Tu cuenta', '- Debes tener al menos 14 años.\n- La información que nos des debe ser veraz y estar actualizada.\n- Eres responsable de tu contraseña y de lo que ocurra desde tu cuenta. Si crees que alguien accede sin permiso, avísanos cuanto antes.\n- Solo puedes tener una cuenta.'),
            s('l4', 'Tu contenido', 'Lo que publicas es tuyo. Al publicarlo, nos das permiso para mostrarlo en la plataforma, de forma no exclusiva y mientras permanezca publicado. Eres responsable de tener derecho a compartirlo y de que no vulnere derechos de terceros.'),
            s('l5', 'Lo que no puedes hacer', 'No puedes incumplir las normas de la comunidad, acceder a cuentas ajenas, suplantar a otras personas, usar bots o sistemas automáticos sin permiso, intentar vulnerar la seguridad del sitio ni interferir en su funcionamiento.'),
            s('l6', 'Moderación y sanciones', 'Podemos ocultar o eliminar contenido y aplicar avisos, suspensiones o baneos según el sistema de tres sanciones descrito en las normas de la comunidad. Si ves contenido ilegal o que incumple las normas, ve a la página de Normas de la comunidad y consulta cómo continuar.'),
            s('l7', 'Propiedad intelectual', 'Los diseños, textos, logotipos, código y demás elementos del sitio son de ЯVWD o se usan con licencia, y no pueden reproducirse ni distribuirse sin permiso. El contenido de los usuarios sigue siendo de quien lo publica, según el apartado de Tu contenido.'),
            s('l8', 'Disponibilidad y responsabilidad', 'Nos esforzamos para que la información sea correcta y el servicio funcione, pero puede haber interrupciones por mantenimiento, errores o causas ajenas. ЯVWD no se hace responsable del contenido publicado por los usuarios, aunque actuará cuando se le informe de un incumplimiento. Esto no limita los derechos que la ley te reconoce como consumidor.'),
            s('l9', 'Enlaces a terceros', 'Si el sitio enlaza a otras webs, no controlamos su contenido ni somos responsables de él.'),
            s('l10', 'Eliminar tu cuenta', 'Puedes eliminarla cuando quieras desde Ajustes de tu perfil. Nosotros podemos suspenderla o cerrarla si se incumple este documento o las normas de la comunidad.'),
            s('l11', 'Cambios', 'Podemos actualizar este documento. Si el cambio es importante, te avisaremos antes de que se aplique. Seguir usando el sitio después implica aceptarlo.'),
            s('l12', 'Ley aplicable', 'Este documento se rige por la legislación española.'),
        ],
    },
    {
        id: 'privacy',
        title: 'Política de privacidad y cookies',
        href: '/privacy',
        updatedAt: '2026-09-15',
        intro: 'Guardamos solo los datos necesarios para que tu cuenta funcione y para moderar la comunidad. No los vendemos. Puedes pedirnos que los borremos cuando quieras. Usamos pocas cookies y solo tú decides cuáles aceptar.',
        sections: [
            s('p1', 'Responsable de tus datos', 'Raquel. rvwd@gmail.com'),
            s('p2', 'Qué datos recogemos', '- Al registrarte: nombre de usuario, correo electrónico y contraseña (guardada de forma cifrada).\n- Al usar la red social: tu perfil, publicaciones, comentarios e interacciones.\n- Al escribirnos: lo que indiques en los formularios de contacto y sugerencias (nombre, correo y mensaje).\n- Datos técnicos: dirección IP, tipo de dispositivo y navegador, para la seguridad y el funcionamiento.'),
            s('p3', 'Para qué los usamos y con qué base legal', '- Crear y gestionar tu cuenta: ejecución del servicio que solicitas.\n- Responder a mensajes y sugerencias: tu consentimiento.\n- Moderar contenido y aplicar las normas: mantener una comunidad segura.\n- Seguridad y prevención de fraude: interés legítimo.\n- Estadísticas de uso y preferencias: tu consentimiento (cookies).'),
            s('p4', 'Cuánto tiempo guardamos tus datos', 'Mientras tengas cuenta. Si decides eliminarla, borramos tus datos, salvo los que debamos conservar por obligación legal. Los mensajes de contacto y las sugerencias se conservan 12 meses.'),
            s('p5', 'Con quién compartimos tus datos', 'No vendemos tus datos a nadie. Solo los compartimos con proveedores necesarios para el servicio, que actúan bajo contrato, o con autoridades cuando la ley lo exija.'),
            s('p6', 'Tus derechos', 'Puedes pedir acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a rvwd@gmail.com. Si crees que no hemos tratado bien tus datos, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).'),
            s('p7', 'Menores', 'Para usar ЯVWD debes tener al menos 14 años. Si descubrimos una cuenta de una persona menor de esa edad, la cerraremos.'),
            s('p8', 'Cookies: qué son', 'Son pequeños archivos que se guardan en tu dispositivo para que la web funcione, recuerde tus preferencias o mida cómo se usa.'),
            s('p9', 'Qué cookies usamos', '- Necesarias: iniciar sesión y mantener la seguridad. Duración: sesión. No piden consentimiento.\n- Preferencias: recordar idioma o tema. Duración: 1 año. Piden consentimiento.\n- Analíticas: entender cómo se usa la web. Duración: 1 año. Piden consentimiento.\n\nNo usamos cookies de publicidad.'),
            s('p10', 'Cómo gestionarlas', 'Al entrar por primera vez puedes aceptarlas, rechazarlas o configurarlas. Puedes cambiar tu decisión cuando quieras o borrarlas desde los ajustes de tu navegador. No usamos cookies de terceros.'),
            s('p11', 'Cambios', 'Si cambiamos esta política de forma importante, por ejemplo al añadir nuevas cookies o proveedores, te lo diremos y volveremos a pedir tu consentimiento cuando sea necesario.'),
        ],
    },
    {
        id: 'rules',
        title: 'Normas de la comunidad',
        href: '/rules',
        updatedAt: '2026-10-02',
        intro: 'En ЯVWD queremos que cualquiera pueda compartir, comentar y conocer gente sin sentirse incómodo. Estas normas explican qué esperamos de ti y qué puedes esperar de nosotros. Son pocas y sencillas: si las sigues, no tendrás ningún problema.',
        sections: [
            s('r1', 'Trata a los demás con respeto', 'Puedes no estar de acuerdo con alguien, pero sin insultar, humillar ni acosar. Una buena conversación discute ideas, no personas.'),
            s('r2', 'Sin odio ni discriminación', 'No permitimos contenido que ataque a personas por su origen, color de piel, religión, género, orientación sexual, discapacidad o cualquier otra característica.'),
            s('r3', 'Nada de violencia ni contenido ilegal', 'No publiques amenazas, contenido que incite a la violencia ni nada que infrinja la ley.'),
            s('r4', 'Contenido adecuado para todos', 'Aquí hay personas de distintas edades y sensibilidades. No se permite contenido sexual explícito.'),
            s('r5', 'Sin spam ni publicidad no autorizada', 'No usamos esta comunidad como un tablón de anuncios. Evita los mensajes repetidos, los enlaces masivos y las cuentas creadas solo para promocionar algo o estafar.'),
            s('r6', 'Protege tu privacidad y la de los demás', 'No publiques datos personales de otras personas.'),
            s('r7', 'Sé quien eres', 'Usa un perfil real y no te hagas pasar por otra persona, marca o entidad.'),
            s('r8', 'Publica solo lo que sea tuyo', 'Comparte contenido propio o que tengas permiso para usar, y cita siempre al autor cuando corresponda.'),
            s('r9', '¿Qué pasa si alguien no cumple las normas?', 'Revisamos cada denuncia y actuamos de forma proporcional. Usamos un sistema de tres sanciones:\n- 1.ª sanción: te comunicamos qué norma se ha incumplido y qué contenido está afectado.\n- 2.ª sanción: no podrás publicar ni comentar durante 7 días.\n- 3.ª sanción: cerramos tu cuenta de forma permanente.\n\nCada sanción caduca a los 90 días si no hay nuevas infracciones.'),
            s('r10', 'Casos graves', 'Algunas conductas, como las amenazas, la estafa o cualquier contenido que ponga en riesgo a menores, son tan serias que podemos suspender o eliminar la cuenta sin pasar por los tres pasos.'),
            s('r11', 'Cómo denunciar', 'Si ves algo que incumple estas normas, pulsa Denunciar en la publicación, el comentario o el perfil. Elige el motivo y, si quieres, cuéntanos más. Nuestro equipo lo revisará con la mayor brevedad posible. La persona denunciada no sabrá quién ha presentado la denuncia.'),
            s('r12', 'Cómo reclamar una sanción', 'Si crees que nos hemos equivocado, puedes pedirnos que lo revisemos desde la página de contacto, eligiendo el asunto Problema con mi cuenta e indicando tu usuario y por qué no estás de acuerdo. Se volverá a revisar el caso y se te informará de la decisión final.'),
        ],
    },
];
