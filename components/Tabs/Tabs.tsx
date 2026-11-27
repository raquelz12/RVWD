import Link from 'next/link';
import type { ReactNode } from 'react';
import './Tabs.css';

export interface TabItem {
    id: string;
    label: ReactNode;
    href: string;
}

interface TabsProps {
    tabs: TabItem[];
    currentTab: string;
    /** Nombre de la navegación para lectores de pantalla */
    label: string;
}

/* Pestañas que son enlaces (cada una tiene su URL), con la activa subrayada en rojo.
   La página ya sabe qué pestaña está activa: se la pasa y así no hace falta leer la URL aquí */
export default function Tabs({ tabs, currentTab, label }: TabsProps) {
    return (
        <nav className="tab-nav" aria-label={label}>
            {tabs.map((tab) => (
                <Link
                    key={tab.id}
                    href={tab.href}
                    className={currentTab === tab.id ? 'tab-nav-link active' : 'tab-nav-link'}
                    aria-current={currentTab === tab.id ? 'page' : undefined}
                >
                    {tab.label}
                </Link>
            ))}
        </nav>
    );
}
