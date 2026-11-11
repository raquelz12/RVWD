'use client';

import { useState } from 'react';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import TextArea from '../../../components/TextArea/TextArea';
import Select from '../../../components/Select/Select';
import './contact.css';

export default function ContactPage() {
    const [mensaje, setMensaje] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [motivo, setMotivo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        setMensaje('');
        setEmail('');
        setName('');
        setMotivo('');

        setTimeout(() => {
            setIsSubmitting(false);
        }, 5000);

        // Aquí en el futuro enviarás esto a tu backend
    };

    return (
        <div className="contact-container">
            <div className="contact-header">
                <span className="contact-title">Contacto</span>
                <p className="contact-description">
                    ¿Tienes alguna duda, problema con tu cuenta o simplemente quieres comentarnos algo? Escríbenos e intentaremos responderte lo antes posible.
                </p>
            </div>
            <div className="contact-column-wrapper">
                <div className="contact-column">
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Nombre*</label>
                            <Input
                                type="text"
                                placeholder="María García"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email*</label>
                            <Input
                                type="email"
                                placeholder="email@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="motive" className="form-label">Motivo*</label>
                            <Select
                                options={[
                                    { value: 'duda', label: 'Duda' },
                                    { value: 'problema', label: 'Problema con mi cuenta' },
                                    { value: 'colaboracion', label: 'Colaboración' },
                                    { value: 'queja', label: 'Queja' },
                                    { value: 'otra', label: 'Otra' },
                                ]}
                                value={motivo}
                                onChange={(value) => setMotivo(value)}
                                placeholder="Selecciona un motivo"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="message" className="form-label">Escribe tu mensaje*</label>
                            <TextArea
                                placeholder="Cuéntanos de qué trata tu mensaje de forma breve..."
                                value={mensaje}
                                onChange={(e) => setMensaje(e.target.value)}
                                className="form-textarea"
                            />
                        </div>
                        <div className="terms-conditions">
                            <label htmlFor="terms">Al enviar este mensaje, aceptas los <a href="/terms" target="_blank">Términos y Condiciones</a> y la <a href="/privacy" target="_blank">Política de Privacidad</a></label>.
                        </div>
                        <p className="required-fields-note">* Campos obligatorios</p>
                        <Button type="submit" className="submit-button">Enviar mensaje</Button>
                        {isSubmitting && (
                            <span className="success-message">
                                ¡Gracias por tu mensaje! Te contestaremos lo antes posible.
                            </span>
                        )}
                    </form>
                </div>
                <div className="contact-column">
                    <p className="contact-column-title">Si lo prefieres puedes contactarnos mandando un email a:</p>
                    <p className="contact-column-email">email@email.com</p>
                    <p className="contact-column-text">Si quieres denunciar contenido o a otro usuario, usa la opción de “Denunciar” de la publicación o el perfil. Así lo revisamos antes.</p>
                    <p className="contact-column-text">Y si tienes cualquier sugerencia que pueda ser útil te animamos a hacerlo desde el <a href="/suggestions" >buzón de sugerencias</a>.</p>
                </div>
            </div>
        </div>
    );
}