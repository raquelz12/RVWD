'use client';

import { useState } from 'react';
import './Toggle.css';

interface ToggleProps {
    /** Si se pasa, el interruptor es controlado desde fuera */
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    /** Texto para lectores de pantalla (el interruptor no lleva texto visible) */
    label?: string;
    disabled?: boolean;
}

export default function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
    const [internal, setInternal] = useState(false);
    const isOn = checked ?? internal;

    const handleClick = () => {
        if (disabled) return;
        if (checked === undefined) setInternal(!isOn);
        onChange?.(!isOn);
    };

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isOn}
            aria-label={label}
            disabled={disabled}
            className={`toggle-wrapper ${isOn ? 'active' : ''}`}
            onClick={handleClick}
        >
            <span className="toggle-handle"></span>
        </button>
    );
}
