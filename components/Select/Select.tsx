'use client';

import { useState, useRef, useEffect, useId } from 'react';
import './Select.css';

export interface Option {
    value: string;
    label: string;
}

interface SelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    /** id del texto que hace de etiqueta (p. ej. el <span className="form-label">) */
    labelledBy?: string;
    /** Nombre accesible cuando no hay etiqueta visible */
    ariaLabel?: string;
}

/* Desplegable con el patrón "listbox": el botón abre la lista y el foco pasa a ella.
   Teclado: flechas, Inicio/Fin, Enter o Espacio para elegir, Escape o Tab para cerrar */
export default function Select({
    options,
    value,
    onChange,
    placeholder = 'Seleccionar...',
    className = '',
    labelledBy,
    ariaLabel,
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const selectRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const baseId = useId();
    const listId = `${baseId}-list`;
    const valueId = `${baseId}-value`;
    const optionId = (i: number) => `${baseId}-opt-${i}`;

    const selectedIndex = options.findIndex(opt => opt.value === value);
    const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Al abrir, el foco pasa a la lista para poder moverse con las flechas
    useEffect(() => {
        if (isOpen) listRef.current?.focus();
    }, [isOpen]);

    // La opción activa siempre a la vista si la lista tiene scroll
    useEffect(() => {
        if (!isOpen || activeIndex < 0) return;
        document.getElementById(`${baseId}-opt-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
    }, [isOpen, activeIndex, baseId]);

    const open = (index = selectedIndex >= 0 ? selectedIndex : 0) => {
        setActiveIndex(index);
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        triggerRef.current?.focus();
    };

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        close();
    };

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            open();
        }
    };

    const handleListKeyDown = (e: React.KeyboardEvent) => {
        const last = options.length - 1;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(i => Math.min(i + 1, last));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(i => Math.max(i - 1, 0));
                break;
            case 'Home':
                e.preventDefault();
                setActiveIndex(0);
                break;
            case 'End':
                e.preventDefault();
                setActiveIndex(last);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (activeIndex >= 0) handleSelect(options[activeIndex].value);
                break;
            case 'Escape':
                e.preventDefault();
                // Que no cierre también el modal o cajón que lo contiene
                e.stopPropagation();
                close();
                break;
            case 'Tab':
                setIsOpen(false);
                break;
        }
    };

    return (
        <div className={`custom-select-container ${className}`.trim()} ref={selectRef}>
            <button
                type="button"
                ref={triggerRef}
                className={`custom-select-trigger ${isOpen ? 'open' : ''}`.trim()}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={isOpen ? listId : undefined}
                aria-labelledby={labelledBy ? `${labelledBy} ${valueId}` : undefined}
                aria-label={!labelledBy ? ariaLabel : undefined}
                onClick={() => (isOpen ? close() : open())}
                onKeyDown={handleTriggerKeyDown}
            >
                <span id={valueId} className={selectedOption ? 'custom-select-value' : 'custom-select-placeholder'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="custom-select-chevron" aria-hidden="true">▼</span>
            </button>
            {isOpen && (
                <ul
                    id={listId}
                    ref={listRef}
                    className="custom-select-dropdown"
                    role="listbox"
                    tabIndex={-1}
                    aria-labelledby={labelledBy}
                    aria-label={!labelledBy ? ariaLabel : undefined}
                    aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
                    onKeyDown={handleListKeyDown}
                >
                    {options.map((option, i) => (
                        <li
                            key={option.value}
                            id={optionId(i)}
                            role="option"
                            aria-selected={value === option.value}
                            className={[
                                'custom-select-item',
                                value === option.value ? 'active' : '',
                                activeIndex === i ? 'focused' : '',
                            ].filter(Boolean).join(' ')}
                            onClick={() => handleSelect(option.value)}
                            onMouseEnter={() => setActiveIndex(i)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
