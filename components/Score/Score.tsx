'use client';

import React from 'react';
import './Score.css';

export interface ScoreProps {
    className?: string;
    score: number | string;
    onChange?: (value: string) => void;
    input: boolean;
    variant?: 'red' | 'white';
}

export default function Score({ className, score, onChange, input, variant }: ScoreProps) {
    const [currentScore, setCurrentScore] = React.useState(score);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (val === '') {
            setCurrentScore('');
            if (onChange) onChange('');
            return;
        }

        const num = parseFloat(val);

        if (!isNaN(num) && num >= 0 && num <= 10) {
            if (val.includes('.')) {
                const parts = val.split('.');
                if (parts[1] && parts[1].length > 1) return;
            }
            
            setCurrentScore(val);
            if (onChange) onChange(val);
        }
    };

    return (
        <div className={`score-circle-input-wrapper ${variant === 'red' ? 'score-red' : 'score-white'} ${className || ''}`}>
            {input && (
                <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="10" 
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