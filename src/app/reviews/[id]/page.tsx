'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import ReviewBigCard from '../../../../components/ReviewBigCard/ReviewBigCard';
import Button from '../../../../components/Button/Button';
import Textarea from '../../../../components/TextArea/TextArea';
import Score from '../../../../components/Score/Score';
import Input from '../../../../components/Input/Input';
import FavButton from '../../../../components/FavButton/FavButton';
import MoreMenu, { type MoreMenuItem } from '../../../../components/MoreMenu/MoreMenu';
import { useModal } from '@/context/ModalContext';
import '@/styles/media-detail.css';
import './review.css';

function ReviewContent() {
    const params = useParams();
    const router = useRouter();

    const yourReview = true;
    // Puntuaciones de la reseña: las mismas en escritorio y en móvil
    const rvwdScore = 9.8;
    const reviewScore = 8.5;
    const reviewId = params?.id;

    // ESTADOS
    const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false); // Controla el cajón móvil

    const toggleReplyBox = (commentId: number) => {
        if (activeReplyId === commentId) {
            setActiveReplyId(null);
        } else {
            setActiveReplyId(commentId);
        }
    };

    const { openReport } = useModal();

    // Opciones del menú ⋮ de un comentario: las de uno propio o las de uno de otra persona
    // TODO: editar / eliminar cuando haya backend
    const commentMenuItems = (commentId: number, author: string, own: boolean): MoreMenuItem[] =>
        own
            ? [
                  { label: 'Editar' },
                  'divider',
                  { label: 'Eliminar', danger: true },
              ]
            : [
                  { label: 'Copiar enlace', copyPath: `/reviews/${reviewId}#comentario-${commentId}` },
                  'divider',
                  {
                      label: 'Denunciar',
                      danger: true,
                      onClick: () => openReport({ type: 'Comentario', id: String(commentId), author }),
                  },
              ];
    // De momento el comentario de ejemplo es de otra persona
    const comment1Menu = commentMenuItems(1, '@raquelz.12204', false);

    return (
        <div className="single-review-page-container">
            
            {/* =========================================
                VISTA DE ESCRITORIO (Se oculta en móvil)
                ========================================= */}
            <div className="desktop-review-view">
                <div className="single-review-header">
                    <Button variant="text" onClick={() => router.back()}>
                        ‹ Volver
                    </Button>
                </div>
                <div className="single-review-content">
                    <div className="single-review-head">
                        <h1 className="page-title">
                            {yourReview ? 'Tu ' : 'La '} <span className="RVWS">RVW</span> {yourReview ? '' : 'de'}
                        </h1>
                    </div>      
                    <div className="single-review-user-avatar-container">
                        <img className="single-review-user-avatar" src="/placeholder.png" alt="Avatar del usuario" />
                        <span className="single-review-user-name">@raquelz.12204</span>
                    </div>
                    <ReviewBigCard 
                        type="Álbum"
                        title="No pasa nada hombre"
                        artist="Clarent"
                        imageUrl="/placeholderCards.png"
                        score={reviewScore}
                        pageScore={rvwdScore}
                        titleReview="Una obra maestra"
                        reviewText="Curabitur quis turpis quis sapien luctus iaculis. Aenean venenatis eros suscipit urna tristique congue ac non metus. Proin euismod ipsum augue, finibus egestas nisi pretium vehicula. Maecenas ornare venenatis sollicitudin. Suspendisse non laoreet dui, at dignissim eros. Integer venenatis maximus turpis. Nulla sit amet purus elit. Ut tincidunt massa quis cursus iaculis. Vestibulum tristique lectus ac tortor luctus hendrerit. Duis commodo neque a lectus pretium facilisis. Praesent vel quam porttitor, dignissim velit eget, pretium ipsum. Praesent tempus faucibus laoreet. Nunc eu dui at mauris pulvinar sodales quis auctor lorem. Nulla turpis ligula, dapibus at sapien sed, eleifend ultrices nisl."
                        reviewDate="2023-10-15"
                        commentsCount={12}
                        favoritesCount={34}
                        profile={true}
                    />
                </div>
                
                <div className="single-review-leave-comment">
                    <div className="single-review-user-avatar-container">
                        <img className="single-review-user-avatar" src="/placeholder.png" alt="Avatar del usuario" />
                        <span className="single-review-user-name">@raquelz.12204</span>
                    </div>
                    <Textarea placeholder="Deja un comentario..." className="single-review-comment-textarea" value="" onChange={() => {}} />
                    <div className="single-review-comment-footer">
                        <span className="single-review-comment-length">0/500</span>
                        <Button variant="primary" className="single-review-comment-button">
                            Comentar
                        </Button>
                    </div>
                </div>

                <div className="single-review-comments">
                    <h2 className="section-title single-review-comments-title">12 comentarios</h2>
                    <div className="single-review-comments-list">
                        
                        {/* COMENTARIO 1 ESCRITORIO */}
                        <div className="single-review-comment" id="comentario-1">
                            <div className="single-review-user">
                                <div className="single-review-user-avatar-container">
                                    <img className="single-review-user-avatar" src="/placeholder.png" alt="Avatar" />
                                    <span className="single-review-user-name">@raquelz.12204</span>
                                    <div className="single-review-comment-info">
                                        <span className="single-review-comment-date">Hace 2 horas</span>
                                        <span className="single-review-comment-replies">0 respuestas</span>
                                    </div>
                                </div>
                                <div className="single-review-comment-actions">
                                    <FavButton count={15} itemLabel="este comentario" className="review-comment-like-button" />
                                    <MoreMenu items={comment1Menu} label="Opciones del comentario" />
                                </div>
                            </div>
                            <div className="single-review-comment-text">
                                Curabitur quis turpis quis sapien luctus iaculis. Aenean venenatis eros suscipit urna tristique congue ac non metus.
                            </div>
                            <Button variant="text" className="single-review-comment-reply-button" onClick={() => toggleReplyBox(1)}>
                                Responder
                            </Button>
                            {activeReplyId === 1 && (
                                <div className="single-review-leave-reply">
                                    <Textarea placeholder="Escribe tu respuesta..." className="single-review-comment-textarea" value="" onChange={() => {}} />
                                    <div className="single-review-comment-footer">
                                        <Button variant="text" onClick={() => setActiveReplyId(null)}>Cancelar</Button>
                                        <Button variant="primary">Enviar</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================================
                VISTA MÓVIL INMERSIVA (Se oculta en PC)
                ========================================= */}
            <div className="mobile-review-view">
                <div className="mobile-hero-section">
                    <img src="/placeholderCards.png" alt="Portada" className="mobile-hero-bg" />
                    <div className="mobile-hero-gradient"></div>
                    
                    <div className="mobile-hero-top-bar">
                        <div className="mobile-hero-user-badge">
                            <img src="/placeholder.png" alt="Avatar" />
                            <span>@raquelz.12204</span>
                        </div>
                        <button className="review-back-btn" onClick={() => router.back()}>‹</button>
                    </div>

                    <div className="mobile-hero-info">
                        <div className="mobile-hero-title-group"> {/* Hacer que se vaya a ese elemento al hacer click en el título */}
                            <h1>No pasa nada hombre</h1>
                            <p>Clarent</p>
                        </div>
                    </div>
                </div>

                <div className="mobile-scores-section">
                    <div className="mobile-score-item">
                        <Score score={rvwdScore} variant="white" input={false} />
                        <span><span className="RVWS">RVWD</span> score</span>
                    </div>
                    <div className="mobile-score-item">
                        <Score score={reviewScore} variant="red" input={false} />
                        <span>Tu <span className="RVWS">RVW</span> score</span>
                    </div>
                </div>

                <div className="mobile-review-body">
                    <div className="mobile-review-body-head">
                        <h2>Una obra maestra</h2>
                        <FavButton count={15} itemLabel="esta RVW" className="review-comment-like-button" />
                    </div>
                    <p className="mobile-review-text">
                        Curabitur quis turpis quis sapien luctus iaculis. Aenean venenatis eros suscipit urna tristique congue ac non metus. Proin euismod ipsum augue, finibus egestas nisi pretium vehicula. Maecenas ornare venenatis sollicitudin. Suspendisse non laoreet dui, at dignissim eros.
                    </p>
                </div>
                <div className="mobile-open-comments-bar" onClick={() => setIsCommentsOpen(true)}>
                    <span>Comentarios <img src="/comments-solid-full.svg" alt="💬" className="icon" /></span>
                    <span className="mobile-open-extra-actions">...</span>
                </div>
            </div>
            <div className={`mobile-comments-sheet ${isCommentsOpen ? 'open' : ''}`}>
                <div className="sheet-overlay" onClick={() => setIsCommentsOpen(false)}></div>
                <div className="sheet-content">
                    <div className="sheet-header">
                        <div className="sheet-drag-handle" onClick={() => setIsCommentsOpen(false)}></div>
                        <h3 className="sheet-title">Comentarios</h3>
                    </div>
                    <div className="sheet-comments-list">
                        <div className="sheet-comment">
                            <div className="sheet-comment-user">
                                <img src="/placeholder.png" alt="Avatar" />
                                <span>@raquelz.12204 <FavButton count={15} itemLabel="este comentario" className="review-comment-like-button" /></span>
                                <MoreMenu items={comment1Menu} label="Opciones del comentario" className="sheet-comment-menu" />
                            </div>
                            <p className="sheet-comment-text">
                                Curabitur quis turpis quis sapien luctus iaculis. Aenean venenatis eros suscipit urna tristique congue ac non metus.
                            </p>
                            <span className="sheet-comment-action" onClick={() => toggleReplyBox(1)}>Responder</span>
                            {activeReplyId === 1 && (
                                <div className="sheet-input-pill reply">
                                    <Input type="text" placeholder="Deja un comentario..." />
                                    <button className="send-btn"><img src="/paper-plane-regular-full.svg" alt="Enviar" /></button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="sheet-sticky-input-wrapper">
                        <img src="/placeholder.png" alt="Tú" />
                        <div className="sheet-input-pill">
                            <Input type="text" placeholder="Deja un comentario..." />
                            <button className="send-btn"><img src="/paper-plane-regular-full.svg" alt="Enviar" /></button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default function SingleReviewPage() {
    return (
        <Suspense fallback={<div style={{ padding: '4rem', color: 'white', textAlign: 'center', fontSize: '1.6rem' }}>Cargando reseña...</div>}>
            <ReviewContent />
        </Suspense>
    );
}