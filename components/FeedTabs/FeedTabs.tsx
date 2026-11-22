import Link from 'next/link';

export type FeedTab = 'para-ti' | 'descubrir';

const TABS: { id: FeedTab; label: string }[] = [
    { id: 'para-ti', label: 'Para ti' },
    { id: 'descubrir', label: 'Descubrir' },
];

// La página ya sabe qué pestaña está activa: se la pasa y así no hace falta leer la URL aquí
export default function FeedTabs({ currentTab }: { currentTab: FeedTab }) {
    return (
        <nav className="feed-buttons" aria-label="Pestañas del feed">
            {TABS.map((tab) => (
                <Link
                    key={tab.id}
                    href={tab.id === 'para-ti' ? '/feed' : `/feed?tab=${tab.id}`}
                    className={currentTab === tab.id ? 'feed-button active' : 'feed-button'}
                    aria-current={currentTab === tab.id ? 'page' : undefined}
                >
                    {tab.label}
                </Link>
            ))}
        </nav>
    );
}
