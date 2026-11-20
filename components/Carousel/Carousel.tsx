'use client';

import { useState, useRef, ReactNode } from 'react';
import './Carousel.css';

interface MobileCarouselProps {
    children: ReactNode[];
}

export default function MobileCarousel({ children }: MobileCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement | null>(null);
    const paginationLetters = ['Я', 'V', 'W', 'D'];

    const handleScroll = () => {
        if (carouselRef.current) {
            const scrollLeft = carouselRef.current.scrollLeft;
            const width = carouselRef.current.offsetWidth;
            const index = Math.round(scrollLeft / width);
            setActiveIndex(index);
        }
    };

    const scrollToCard = (index: number) => {
        if (carouselRef.current) {
            const width = carouselRef.current.offsetWidth;
            carouselRef.current.scrollTo({
                left: width * index,
                behavior: 'smooth',
            });
            setActiveIndex(index);
        }
    };

    const visibleLetters = paginationLetters.slice(0, children.length);

    return (
        <div className="mobile-carousel-module">
            <div className="carousel-wrapper">
                <div className="cards-scroll-container" ref={carouselRef} onScroll={handleScroll}>
                    {children.map((child, index) => (
                        <div key={index} className="carousel-slot-container">
                            {child}
                        </div>
                    ))}
                </div>
            </div>
            <div className="carousel-pagination">
                {visibleLetters.map((letter, index) => (
                    <span 
                        key={index} 
                        onClick={() => scrollToCard(index)}
                        className={`pagination-letter ${activeIndex === index ? 'active' : ''}`}
                    >
                        {letter}
                    </span>
                ))}
            </div>
        </div>
    );
}