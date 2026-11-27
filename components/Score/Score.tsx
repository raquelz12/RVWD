'use client';

import React from 'react';
import './Score.css';

export interface ScoreProps {
    className?: string;
    score: number | string;
    onChange?: (value: string) => void;
    input: boolean;
    variant?: 'red' | 'white';
    /** id del input (solo con input), para asociarle un <label htmlFor> */
    id?: string;
}

export default function Score({ className, score, onChange, input, variant, id }: ScoreProps) {
    const [currentScore, setCurrentScore] = React.useState(score);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // El teclado decimal en español escribe coma: se guarda con punto
        const val = e.target.value.replace(',', '.');

        if (val === '') {
            setCurrentScore('');
            if (onChange) onChange('');
            return;
        }

        // De 0 a 10 con un decimal como mucho ("7", "7.", "7.5", "10"); lo demás no se escribe
        if (!/^\d{1,2}(\.\d?)?$/.test(val) || parseFloat(val) > 10) return;

        setCurrentScore(val);
        if (onChange) onChange(val);
    };

    return (
        <div className={`score-circle-input-wrapper ${variant === 'red' ? 'score-red' : 'score-white'} ${className || ''}`}>
            {input && (
                <input
                    id={id}
                    // text + inputMode y no type="number": con este, la coma del teclado
                    // en español deja el valor vacío en algunos navegadores
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={currentScore}
                    onChange={handleChange}
                    placeholder="0.0"
                    className={`score-circle-real-input ${className || ''}`}
                />
            ) || (
                // Solo lectura: enseña siempre la nota que recibe, aunque cambie después
                <div className={`score-circle ${className || ''}`}>
                    {score}
                </div>
            )}
        </div>
    );
}