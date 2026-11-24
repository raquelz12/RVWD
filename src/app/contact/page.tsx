'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import TextArea from '../../../components/TextArea/TextArea';
import Select from '../../../components/Select/Select';
import '@/styles/text-page.css';
import '@/styles/forms.css';
import './contact.css';

const MOTIVOS = [
    { value: 'duda', label: 'Duda' },
    { value: 'problema', label: 'Problema con mi cuenta' },
    { value: 'colaboracion', label: 'Colaboración' },
    { value: 'queja', label: 'Queja' },
    { value: 'otra', label: 'Otra' },
];

export default function ContactPage() {
    const [mensaje, setMensaje] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [motivo, setMotivo] = useState('');
    // El aviso de enviado se queda hasta que se vuelve a escribir
    const [sent, setSent] = useState(false);

    const canSubmit = Boolean(name.trim() && email.trim() && motivo && mensaje.trim());

    // Cualquier cambio en un campo quita el aviso de enviado
    const edit = <T,>(setter: (value: T) => void) => (value: T) => {
        setter(value);
        setSent(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        // TODO: enviar el mensaje cuando haya backend

        setMensaje('');
        setEmail('');
        setName('');
        setMotivo('');
        setSent(true);
    };

    return (
        <div className="text-page">
            <div className="text-page-header">
                <h1 className="page-title">Contacto</h1>
                <p className="text-page-intro">
                    ¿Tienes alguna duda, problema con tu cuenta o simplemente quieres comentarnos algo? Escríbenos e intentaremos responderte lo antes posible.
                </p>
            </div>
            <div className="form-page-columns">
                <div className="form-page-column">
                    <form onSubmit={handleSubmit} className="form-page-form">
                        <div className="form-group">
                            <label htmlFor="contact-name" className="form-label">Nombre*</label>
                            <Input
                                id="contact-name"
                                type="text"
                                autoComplete="name"
                                aria-required="true"
                                placeholder="María García"
                                value={name}
                                onChange={(e) => edit(setName)(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="contact-email" className="form-label">Email*</label>
                            <Input
                                id="contact-email"
                                type="email"
                                autoComplete="email"
                                aria-required="true"
                                placeholder="email@email.com"
                                value={email}
                                onChange={(e) => edit(setEmail)(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <span id="contact-reason-label" className="form-label">Motivo*</span>
                            <Select
                                labelledBy="contact-reason-label"
                                options={MOTIVOS}
                                value={motivo}
                                onChange={edit(setMotivo)}
                                placeholder="Selecciona un motivo"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="contact-message" className="form-label">Escribe tu mensaje*</label>
                            <TextArea
                                id="contact-message"
                                aria-required="true"
                                placeholder="Cuéntanos de qué trata tu mensaje de forma breve..."
                                value={mensaje}
                                onChange={(e) => edit(setMensaje)(e.target.value)}
                            />
                        </div>
                        <p className="terms-conditions">
                            Al enviar este mensaje, aceptas las <a href="/legal" target="_blank" rel="noopener noreferrer" className="inline-link">condiciones de uso</a> y la <a href="/privacy" target="_blank" rel="noopener noreferrer" className="inline-link">política de privacidad</a>.
                        </p>
                        <p className="required-fields-note">* Campos obligatorios</p>
                        <Button type="submit" className="form-page-submit" disabled={!canSubmit}>Enviar mensaje</Button>
                        {/* Siempre en el DOM: los lectores de pantalla solo anuncian cambios en una región que ya existía */}
                        <div role="status">
                            {sent && (
                                <p className="success-message">
                                    ¡Gracias por tu mensaje! Te contestaremos lo antes posible.
                                </p>
                            )}
                        </div>
                    </form>
                </div>
                <section className="form-page-column" aria-labelledby="contact-email-title">
                    <h2 id="contact-email-title" className="block-title">¿Prefieres el email?</h2>
                    <p className="contact-text">Si lo prefieres, puedes contactarnos mandando un email a:</p>
                    <a href="mailto:rvwd@gmail.com" className="contact-email inline-link">rvwd@gmail.com</a>
                    <p className="contact-text">Si quieres denunciar contenido o a otro usuario, usa la opción de “Denunciar” de la publicación o el perfil. Así lo revisamos antes.</p>
                    <p className="contact-text">Y si tienes cualquier sugerencia que pueda ser útil te animamos a hacerlo desde el <Link href="/suggestions" className="inline-link">buzón de sugerencias</Link>.</p>
                </section>
            </div>
        </div>
    );
}
