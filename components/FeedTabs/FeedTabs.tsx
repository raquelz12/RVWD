'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function FeedTabs() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const currentTab = searchParams.get('tab') || 'para-ti';

    const handleTabChange = (newTab: string) => {
        router.push(`${pathname}?tab=${newTab}`);
    };

    return (
        <div className="feed-buttons">
            <button 
                className={currentTab === 'para-ti' ? "feed-button active" : "feed-button"} 
                onClick={() => handleTabChange('para-ti')}
            >
                Para ti
            </button>
            <button 
                className={currentTab === 'descubrir' ? "feed-button active" : "feed-button"} 
                onClick={() => handleTabChange('descubrir')}
            >
                Descubrir
            </button>
        </div>
    );
}