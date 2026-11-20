'use client';

import { useState } from 'react';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import TextArea from '../../../components/TextArea/TextArea';
import Select from '../../../components/Select/Select';
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
                <span className="suggestions-title">Ayúdanos a mejorar</span>
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
                                type="email"
                                placeholder="email@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category" className="form-label">Categoría*</label>
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
                                placeholder="Cuéntanos de que trata tu sugerencia de forma breve..."
                                value={sugerencia}
                                onChange={(e) => setSugerencia(e.target.value)}
                                className="form-textarea"
                            />
                        </div>
                        <div className="terms-conditions">
                            <label htmlFor="terms">Al enviar esta sugerencia, aceptas los <a href="/terms" target="_blank">Términos y Condiciones</a> y la <a href="/privacy" target="_blank">Política de Privacidad</a></label>.
                        </div>
                        <p className="required-fields-note">* Campos obligatorios</p>
                        <Button type="submit" className="submit-button">Enviar sugerencia</Button>
                        {isSubmitting && (
                            <span className="success-message">
                                ¡Gracias por tu sugerencia! Las revisamos cada semana, te avisaremos cuando cambie de estado.
                            </span>
                        )}
                    </form>
                </div>
                <div className="suggestions-column">
                    <span className="suggestions-column-title">Lo último que hemos hecho gracias a vosotros</span>
                    <ul className="suggestions-list">
                        <li className="suggestions-list-item">
                            <span className="suggestions-list-item-title">Añadido modo oscuro</span>
                            <p className="suggestions-list-item-description">
                                Gracias a vuestras sugerencias, hemos implementado un modo oscuro para mejorar la experiencia de usuario.
                            </p>
                        </li>
                        <li className="suggestions-list-item">
                            <span className="suggestions-list-item-title">Mejoras en la búsqueda</span>
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