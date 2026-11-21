'use client';

import { useState } from 'react';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import TextArea from '../../../components/TextArea/TextArea';
import Select from '../../../components/Select/Select';
import '@/styles/forms.css';
import './suggestions.css';

export default function SugerenciasPage() {
    const [sugerencia, setSugerencia] = useState('');
    const [email, setEmail] = useState('');
    const [categoria, setCategoria] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        setSugerencia('');
        setEmail('');
        setCategoria('');

        setTimeout(() => {
            setIsSubmitting(false);
        }, 5000);

        // Aquí en el futuro enviarás esto a tu backend
    };

    return (
        <div className="suggestions-container">
            <div className="suggestions-header">
                <h1 className="page-title">Ayúdanos a mejorar</h1>
                <p className="suggestions-description">
                    <span className="RVWS">RVWD</span> se construye contigo. Cuéntanos qué te gustaría mejorar, 
                    qué echas en falta o qué idea tienes. Leemos todas las sugerencias.
                </p>
            </div>
            <div className="suggestions-column-wrapper">
                <div className="suggestions-column">
                    <form onSubmit={handleSubmit} className="suggestions-form">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email*</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <span className="form-label">Categoría*</span>
                            <Select
                                options={[
                                    { value: 'mejora', label: 'Mejora' },
                                    { value: 'nueva-funcionalidad', label: 'Nueva funcionalidad' },
                                    { value: 'error', label: 'Error' },
                                    { value: 'otra', label: 'Otra' },
                                ]}
                                value={categoria}
                                onChange={(value) => setCategoria(value)}
                                placeholder="Selecciona una categoría"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="sugerencia" className="form-label">Escribe tu sugerencia*</label>
                            <TextArea
                                id="sugerencia"
                                placeholder="Cuéntanos de qué trata tu sugerencia de forma breve..."
                                value={sugerencia}
                                onChange={(e) => setSugerencia(e.target.value)}
                                className="form-textarea"
                            />
                        </div>
                        <p className="terms-conditions">
                            Al enviar esta sugerencia, aceptas las <a href="/legal" target="_blank" rel="noopener noreferrer" className="inline-link">condiciones de uso</a> y la <a href="/privacy" target="_blank" rel="noopener noreferrer" className="inline-link">política de privacidad</a>.
                        </p>
                        <p className="required-fields-note">* Campos obligatorios</p>
                        <Button type="submit" className="submit-button">Enviar sugerencia</Button>
                        {isSubmitting && (
                            <span className="success-message" role="status">
                                ¡Gracias por tu sugerencia! Las revisamos cada semana y te avisaremos cuando cambie de estado.
                            </span>
                        )}
                    </form>
                </div>
                <div className="suggestions-column">
                    <h2 className="block-title">Lo último que hemos hecho gracias a vosotros</h2>
                    <ul className="suggestions-list">
                        <li className="suggestions-list-item">
                            <h3 className="block-title">Solicitudes de seguimiento</h3>
                            <p className="suggestions-list-item-description">
                                Ahora puedes aceptar o rechazar quién te sigue desde tus notificaciones.
                            </p>
                        </li>
                        <li className="suggestions-list-item">
                            <h3 className="block-title">Mejoras en la búsqueda</h3>
                            <p className="suggestions-list-item-description">
                                Hemos optimizado el algoritmo de búsqueda para ofrecer resultados más precisos y relevantes.
                            </p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}