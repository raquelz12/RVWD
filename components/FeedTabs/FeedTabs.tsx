import Tabs from '../Tabs/Tabs';

export type FeedTab = 'para-ti' | 'descubrir';

const TABS = [
    { id: 'para-ti', label: 'Para ti', href: '/feed' },
    { id: 'descubrir', label: 'Descubrir', href: '/feed?tab=descubrir' },
];

export default function FeedTabs({ currentTab }: { currentTab: FeedTab }) {
    return <Tabs tabs={TABS} currentTab={currentTab} label="Pestañas del feed" />;
}
