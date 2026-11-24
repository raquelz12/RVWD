'use client';

import { useState } from 'react';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import TextArea from '../../../components/TextArea/TextArea';
import Select from '../../../components/Select/Select';
import Rvw from '../../../components/Rvw/Rvw';
import '@/styles/text-page.css';
import '@/styles/forms.css';
import './suggestions.css';

const CATEGORIAS = [
    { value: 'mejora', label: 'Mejora' },
    { value: 'nueva-funcionalidad', label: 'Nueva funcionalidad' },
    { value: 'error', label: 'Error' },
    { value: 'otra', label: 'Otra' },
];

export default function SugerenciasPage() {
    const [sugerencia, setSugerencia] = useState('');
    const [email, setEmail] = useState('');
    const [categoria, setCategoria] = useState('');
    // El aviso de enviado se queda hasta que se vuelve a escribir
    const [sent, setSent] = useState(false);

    const canSubmit = Boolean(email.trim() && categoria && sugerencia.trim());

    // Cualquier cambio en un campo quita el aviso de enviado
    const edit = <T,>(setter: (value: T) => void) => (value: T) => {
        setter(value);
        setSent(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        // TODO: enviar la sugerencia cuando haya backend

        setSugerencia('');
        setEmail('');
        setCategoria('');
        setSent(true);
    };

    return (
        <div className="text-page">
            <div className="text-page-header">
                <h1 className="page-title">Ayúdanos a mejorar</h1>
                <p className="text-page-intro">
                    <Rvw>RVWD</Rvw> se construye contigo. Cuéntanos qué te gustaría mejorar,
                    qué echas en falta o qué idea tienes. Leemos todas las sugerencias.
                </p>
            </div>
            <div className="form-page-columns">
                <div className="form-page-column">
                    <form onSubmit={handleSubmit} className="form-page-form">
                        <div className="form-group">
                            <label htmlFor="suggestion-email" className="form-label">Email*</label>
                            <Input
                                id="suggestion-email"
                                type="email"
                                autoComplete="email"
                                aria-required="true"
                                placeholder="email@email.com"
                                value={email}
                                onChange={(e) => edit(setEmail)(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <span id="suggestion-category-label" className="form-label">Categoría*</span>
                            <Select
                                labelledBy="suggestion-category-label"
                                options={CATEGORIAS}
                                value={categoria}
                                onChange={edit(setCategoria)}
                                placeholder="Selecciona una categoría"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="suggestion-text" className="form-label">Escribe tu sugerencia*</label>
                            <TextArea
                                id="suggestion-text"
                                aria-required="true"
                                placeholder="Cuéntanos de qué trata tu sugerencia de forma breve..."
                                value={sugerencia}
                                onChange={(e) => edit(setSugerencia)(e.target.value)}
                            />
                        </div>
                        <p className="terms-conditions">
                            Al enviar esta sugerencia, aceptas las <a href="/legal" target="_blank" rel="noopener noreferrer" className="inline-link">condiciones de uso</a> y la <a href="/privacy" target="_blank" rel="noopener noreferrer" className="inline-link">política de privacidad</a>.
                        </p>
                        <p className="required-fields-note">* Campos obligatorios</p>
                        <Button type="submit" className="form-page-submit" disabled={!canSubmit}>Enviar sugerencia</Button>
                        {/* Siempre en el DOM: los lectores de pantalla solo anuncian cambios en una región que ya existía */}
                        <div role="status">
                            {sent && (
                                <p className="success-message">
                                    ¡Gracias por tu sugerencia! Las revisamos cada semana y te avisaremos cuando cambie de estado.
                                </p>
                            )}
                        </div>
                    </form>
                </div>
                <section className="form-page-column" aria-labelledby="suggestions-done-title">
                    <h2 id="suggestions-done-title" className="section-title">Lo último que hemos hecho gracias a vosotros</h2>
                    {/* TODO: contenido de ejemplo; cuando venga del backend, añadir la fecha con formatDate */}
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
                </section>
            </div>
        </div>
    );
}
