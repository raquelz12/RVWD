'use client';

import './reviews.css';
import { useState } from 'react';
import Select from '../../../../components/Select/Select';
import ReviewBigCard from '../../../../components/ReviewBigCard/ReviewBigCard';

export default function ReviewsPage() {

    const [page, setPage] = useState(1);
    const [filtro, setFiltro] = useState('');

    const opcionesOrden = [
        { value: 'recientes', label: 'Más recientes' },
        { value: 'antiguas', label: 'Más antiguas' },
        { value: 'alta_nota', label: 'Mayor puntuación' },
        { value: 'baja_nota', label: 'Menor puntuación' }
    ]

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    }

    return (
        <div className="reviews-page-container">
            <span className="reviews-page-title">Tus <span className="RVWS">RVWS</span></span>
            <Select 
                options={opcionesOrden} 
                value={filtro} 
                onChange={(valorSeleccionado) => setFiltro(valorSeleccionado)} 
                placeholder="Ordenar por..."
            />
            <div className="reviews-list">
                <ReviewBigCard 
                    type = "Álbum"
                    title = "No pasa nada hombre"
                    artist = "Clarent"
                    imageUrl = "/placeholderCards.png"
                    score = {8.5}
                    titleReview = "Una obra maestra"
                    reviewText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                    reviewDate = "2023-10-15"   
                    commentsCount = {12}
                    favoritesCount = {34}
                    profile = {true}
                    onClick={() => (window.location.href = '/review/1')}
                />
            </div>
            <div className="pagination">
                <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                >
                    Anterior
                </button>
                <span className="pagination-info">
                    Página {page} de 5
                </span>
                <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === 5}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}