'use client';

import { type ReactNode } from 'react';
import BottomSheet from '../BottomSheet/BottomSheet';
import Button from '../Button/Button';
import './FilterSheet.css';

interface FilterSheetProps {
    open: boolean;
    onClose: () => void;
    onClear: () => void;
    resultCount: number;
    title?: string;
    children: ReactNode;
}

/**
 * Filtros en un BottomSheet en móvil. En escritorio el panel es transparente
 * (display: contents) y los filtros se pintan en línea como siempre.
 */
export default function FilterSheet({
    open,
    onClose,
    onClear,
    resultCount,
    title = 'Filtros',
    children,
}: FilterSheetProps) {
    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={title}
            className="filter-sheet"
            closeAboveWidth={850}
            footer={
                <>
                    <Button variant="text" onClick={onClear}>
                        Limpiar
                    </Button>
                    <Button variant="primary" onClick={onClose}>
                        Ver {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
                    </Button>
                </>
            }
        >
            {children}
        </BottomSheet>
    );
}
