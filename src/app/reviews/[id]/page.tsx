'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, Suspense } from 'react';
import ReviewBigCard from '../../../../components/ReviewBigCard/ReviewBigCard';
import Button from '../../../../components/Button/Button';
import TextArea from '../../../../components/TextArea/TextArea';
import Score from '../../../../components/Score/Score';
import Input from '../../../../components/Input/Input';
import FavButton from '../../../../components/FavButton/FavButton';
import BottomSheet from '../../../../components/BottomSheet/BottomSheet';
import MoreMenu, { type MoreMenuItem } from '../../../../components/MoreMenu/MoreMenu';
import Rvw from '../../../../components/Rvw/Rvw';
import { useModal } from '@/context/ModalContext';
import { formatRelativeDate } from '@/app/lib/adminFilters';
import { useNowMinute } from '@/app/lib/useNowMinute';
import '@/styles/media-detail.css';
import './review.css';

const COMMENT_MAX = 500;

// TODO: datos de prueba hasta que haya backend. Las dos vistas (escritorio y móvil) leen de aquí
const REVIEW = {
    author: '@raquelz.12204',
    authorImage: '/placeholder.png',
    own: true,
    type: 'Álbum' as const,
    title: 'No pasa nada hombre',
    artist: 'Clarent',
    mediaHref: '/album/123',
    artistHref: '/artist/123',
    imageUrl: '/placeholderCards.png',
    score: 8.5,
    pageScore: 9.8,
    titleReview: 'Una obra maestra',
    reviewText:
        'Curabitur quis turpis quis sapien luctus iaculis. Aenean venenatis eros suscipit urna tristique congue ac non metus. Proin euismod ipsum augue, finibus egestas nisi pretium vehicula. Maecenas ornare venenatis sollicitudin. Suspendisse non laoreet dui, at dignissim eros. Integer venenatis maximus turpis. Nulla sit amet purus elit. Ut tincidunt massa quis cursus iaculis. Vestibulum tristique lectus ac tortor luctus hendrerit. Duis commodo neque a lectus pretium facilisis. Praesent vel quam porttitor, dignissim velit eget, pretium ipsum. Praesent tempus faucibus laoreet. Nunc eu dui at mauris pulvinar sodales quis auctor lorem. Nulla turpis ligula, dapibus at sapien sed, eleifend ultrices nisl.',
    reviewDate: '2023-10-15',
    commentsCount: 12,
    favoritesCount: 34,
};

// Usuario con la sesión iniciada (el que comenta)
const ME = { name: '@raquelz.12204', image: '/placeholder.png' };

interface ReviewComment {
    id: number;
    author: string;
    avatar: string;
    date: string;
    text: string;
    favs: number;
    replies: number;
    own: boolean;
}

const COMMENTS: ReviewComment[] = [
    {
        id: 1,
        author: '@clarent',
        avatar: '/placeholder.png',
        date: '2026-11-22T09:30:00',
        text: 'Curabitur quis turpis quis sapien luctus iaculis. Aenean venenatis eros suscipit urna tristique congue ac non metus.',
        favs: 15,
        replies: 0,
        own: false,
    },
];

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;


function CommentDate({ iso, nowMinute, className }: { iso: string; nowMinute: number | null; className?: string }) {
    return (
        <time dateTime={iso} className={className}>
            {nowMinute === null ? '' : formatRelativeDate(iso, nowMinute * 60_000)}
        </time>
    );
}

function ReviewContent({ reviewId }: { reviewId: string }) {
    const router = useRouter();
    const { openReport } = useModal();
    const nowMinute = useNowMinute();

    const [commentText, setCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    // TODO: seguir de verdad cuando haya backend (en escritorio lo lleva la propia ReviewBigCard)
    const [isFollowed, setIsFollowed] = useState(false);

    const closeComments = useCallback(() => setIsCommentsOpen(false), []);

    // Si se llega sin historial (enlace copiado, pestaña nueva), "Volver" lleva al feed
    const goBack = () => {
        if (window.history.length > 1) router.back();
        else router.push('/feed');
    };

    const toggleReplyBox = (commentId: number) => {
        setReplyText('');
        setActiveReplyId((current) => (current === commentId ? null : commentId));
    };

    const closeReply = () => {
        setActiveReplyId(null);
        setReplyText('');
    };

    // Escape cierra la caja de respuesta (y no llega al cajón de comentarios)
    const handleReplyKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            closeReply();
        }
    };

    // TODO: enviar el comentario / la respuesta cuando haya backend
    const submitComment = (e: React.FormEvent) => e.preventDefault();
    const submitReply = (e: React.FormEvent) => e.preventDefault();

    // Enlace a un comentario (#comentario-N): en escritorio se baja hasta él; en móvil se abre el cajón en él
    useEffect(() => {
        const match = window.location.hash.match(/^#comentario-(\d+)$/);
        if (!match) return;
        if (!window.matchMedia('(max-width: 768px)').matches) {
            document.getElementById(`comentario-${match[1]}`)?.scrollIntoView();
            return;
        }
        // En el siguiente frame: se abre el cajón y se baja la lista hasta el comentario
        const frame = requestAnimationFrame(() => {
            setIsCommentsOpen(true);
            const item = document.querySelector<HTMLElement>(`[data-comment-id="${match[1]}"]`);
            const list = item?.closest<HTMLElement>('.bottom-sheet-body');
            if (item && list) list.scrollTop = item.offsetTop - list.offsetTop;
        });
        return () => cancelAnimationFrame(frame);
    }, []);

    // Opciones del menú ⋮ de un comentario: las de uno propio o las de uno de otra persona
    // TODO: editar / eliminar cuando haya backend
    const commentMenuItems = (comment: ReviewComment): MoreMenuItem[] =>
        comment.own
            ? [{ label: 'Editar' }, 'divider', { label: 'Eliminar', danger: true }]
            : [
                  { label: 'Copiar enlace', copyPath: `/reviews/${reviewId}#comentario-${comment.id}` },
                  'divider',
                  {
                      label: 'Denunciar',
                      danger: true,
                      onClick: () => openReport({ type: 'Comentario', id: String(comment.id), author: comment.author }),
                  },
              ];

    // Menú ⋮ de la RVW en móvil: las mismas opciones que el de ReviewBigCard en escritorio
    const reviewMenuItems: MoreMenuItem[] = [
        { label: 'Ir al álbum', href: REVIEW.mediaHref },
        ...(REVIEW.own
            ? []
            : [
                  {
                      label: isFollowed ? `Dejar de seguir a ${REVIEW.author}` : `Seguir a ${REVIEW.author}`,
                      onClick: () => setIsFollowed((f) => !f),
                  },
                  'divider' as const,
                  {
                      label: 'Denunciar',
                      danger: true,
                      onClick: () => openReport({ type: 'RVW', id: reviewId, author: REVIEW.author }),
                  },
              ]),
    ];

    const commentsTitle = plural(REVIEW.commentsCount, 'comentario', 'comentarios');
    const canComment = commentText.trim().length > 0;
    const canReply = replyText.trim().length > 0;

    return (
        <div className="single-review-page-container">
            {/* =========================================
                VISTA DE ESCRITORIO Y TABLET (se oculta en móvil)
                ========================================= */}
            <div className="desktop-review-view">
                <div className="single-review-header">
                    <Button className="single-review-back-button" variant="text" type="button" onClick={goBack}>
                        ‹ Volver
                    </Button>
                </div>
                <div className="single-review-column">
                    <h1 className="page-title">
                        {REVIEW.own ? (
                            <>Tu <Rvw>RVW</Rvw></>
                        ) : (
                            <>La <Rvw>RVW</Rvw> de {REVIEW.author}</>
                        )}
                    </h1>
                    <ReviewBigCard
                        username={REVIEW.author}
                        userImageUrl={REVIEW.authorImage}
                        followed={false}
                        ownReview={REVIEW.own}
                        reviewId={reviewId}
                        mediaHref={REVIEW.mediaHref}
                        type={REVIEW.type}
                        title={REVIEW.title}
                        artist={REVIEW.artist}
                        imageUrl={REVIEW.imageUrl}
                        score={REVIEW.score}
                        pageScore={REVIEW.pageScore}
                        titleReview={REVIEW.titleReview}
                        reviewText={REVIEW.reviewText}
                        reviewDate={REVIEW.reviewDate}
                        commentsCount={REVIEW.commentsCount}
                        favoritesCount={REVIEW.favoritesCount}
                        profile
                        fullText
                        commentsHref="#comentarios"
                    />

                    <form className="single-review-leave-comment" onSubmit={submitComment}>
                        <div className="single-review-user">
                            <img className="single-review-user-avatar" src={ME.image} alt="" />
                            <span className="single-review-user-name">{ME.name}</span>
                        </div>
                        <TextArea
                            aria-label="Escribe un comentario"
                            placeholder="Deja un comentario..."
                            maxLength={COMMENT_MAX}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <div className="single-review-comment-footer">
                            <span className="single-review-comment-length">
                                {commentText.length}/{COMMENT_MAX}
                            </span>
                            <Button variant="primary" type="submit" disabled={!canComment}>
                                Comentar
                            </Button>
                        </div>
                    </form>

                    <section id="comentarios" className="single-review-comments" aria-labelledby="single-review-comments-title">
                        <h2 id="single-review-comments-title" className="section-title">{commentsTitle}</h2>
                        <ul className="single-review-comments-list">
                            {COMMENTS.map((comment) => {
                                const isReplying = activeReplyId === comment.id;
                                return (
                                    <li key={comment.id} id={`comentario-${comment.id}`} className="single-review-comment">
                                        <div className="single-review-comment-head">
                                            <div className="single-review-user">
                                                <img className="single-review-user-avatar" src={comment.avatar} alt="" />
                                                <span className="single-review-user-name">{comment.author}</span>
                                                <div className="single-review-comment-info">
                                                    <CommentDate iso={comment.date} nowMinute={nowMinute} />
                                                    <span>{plural(comment.replies, 'respuesta', 'respuestas')}</span>
                                                </div>
                                            </div>
                                            <div className="single-review-comment-actions">
                                                <FavButton count={comment.favs} itemLabel="este comentario" className="single-review-like-button" />
                                                <MoreMenu items={commentMenuItems(comment)} label="Opciones del comentario" />
                                            </div>
                                        </div>
                                        <p className="single-review-comment-text">{comment.text}</p>
                                        <Button
                                            variant="text"
                                            type="button"
                                            className="single-review-comment-reply-button"
                                            aria-expanded={isReplying}
                                            onClick={() => toggleReplyBox(comment.id)}
                                        >
                                            Responder
                                        </Button>
                                        {isReplying && (
                                            <form className="single-review-leave-reply" onSubmit={submitReply} onKeyDown={handleReplyKeyDown}>
                                                <TextArea
                                                    aria-label={`Responder a ${comment.author}`}
                                                    placeholder="Escribe tu respuesta..."
                                                    maxLength={COMMENT_MAX}
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    autoFocus
                                                />
                                                <div className="single-review-comment-footer">
                                                    <Button variant="text" type="button" onClick={closeReply}>Cancelar</Button>
                                                    <Button variant="primary" type="submit" disabled={!canReply}>Enviar</Button>
                                                </div>
                                            </form>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                </div>
            </div>

            {/* =========================================
                VISTA MÓVIL INMERSIVA (se oculta en escritorio y tablet)
                ========================================= */}
            <div className="mobile-review-view">
                <div className="mobile-hero-section">
                    <img src={REVIEW.imageUrl} alt="" className="mobile-hero-bg" />
                    <div className="mobile-hero-gradient"></div>

                    <div className="mobile-hero-top-bar">
                        <div className="mobile-hero-user-badge">
                            <img src={REVIEW.authorImage} alt="" />
                            <span>{REVIEW.author}</span>
                        </div>
                        <button type="button" className="single-review-back-btn" onClick={goBack} aria-label="Volver">‹</button>
                    </div>

                    <div className="mobile-hero-info">
                        <div className="mobile-hero-title-group">
                            <h1><Link href={REVIEW.mediaHref} className="mobile-hero-link">{REVIEW.title}</Link></h1>
                            <p><Link href={REVIEW.artistHref} className="mobile-hero-link">{REVIEW.artist}</Link></p>
                        </div>
                    </div>
                </div>

                <div className="mobile-scores-section">
                    <div className="mobile-score-item">
                        <Score score={REVIEW.pageScore} variant="white" input={false} />
                        <span><Rvw>RVWD</Rvw> score</span>
                    </div>
                    <div className="mobile-score-item">
                        <Score score={REVIEW.score} variant="red" input={false} />
                        <span>{REVIEW.own ? 'Tu nota' : 'Su nota'}</span>
                    </div>
                </div>

                <div className="mobile-review-body">
                    <div className="mobile-review-body-head">
                        <h2 className="section-title">{REVIEW.titleReview}</h2>
                        <div className="mobile-review-actions">
                            <FavButton count={REVIEW.favoritesCount} itemLabel="esta RVW" className="single-review-like-button" />
                            <MoreMenu items={reviewMenuItems} label="Opciones de la RVW" />
                        </div>
                    </div>
                    <p className="mobile-review-text">{REVIEW.reviewText}</p>
                </div>

                <button
                    type="button"
                    className="mobile-open-comments-btn"
                    aria-haspopup="dialog"
                    onClick={() => setIsCommentsOpen(true)}
                >
                    Comentarios ({REVIEW.commentsCount})
                    <img src="/comments-solid-full.svg" alt="" />
                </button>
            </div>

            <BottomSheet
                open={isCommentsOpen}
                onClose={closeComments}
                title={commentsTitle}
                className="review-comments-sheet"
                closeAboveWidth={768}
                footer={
                    <form className="sheet-comment-form" onSubmit={submitComment}>
                        <img src={ME.image} alt="" />
                        <div className="sheet-input-pill">
                            <Input
                                type="text"
                                aria-label="Escribe un comentario"
                                placeholder="Deja un comentario..."
                                maxLength={COMMENT_MAX}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <button type="submit" className="sheet-send-btn" aria-label="Enviar comentario" disabled={!canComment}>
                                <img src="/paper-plane-regular-full.svg" alt="" />
                            </button>
                        </div>
                    </form>
                }
            >
                <ul className="sheet-comments-list">
                    {COMMENTS.map((comment) => {
                        const isReplying = activeReplyId === comment.id;
                        return (
                            <li key={comment.id} data-comment-id={comment.id} className="sheet-comment">
                                <div className="sheet-comment-user">
                                    <img src={comment.avatar} alt="" />
                                    <span className="sheet-comment-author">{comment.author}</span>
                                    <CommentDate iso={comment.date} nowMinute={nowMinute} className="sheet-comment-date" />
                                    <div className="sheet-comment-actions">
                                        <FavButton count={comment.favs} itemLabel="este comentario" className="single-review-like-button" />
                                        <MoreMenu items={commentMenuItems(comment)} label="Opciones del comentario" />
                                    </div>
                                </div>
                                <p className="sheet-comment-text">{comment.text}</p>
                                <button
                                    type="button"
                                    className="sheet-comment-action"
                                    aria-expanded={isReplying}
                                    onClick={() => toggleReplyBox(comment.id)}
                                >
                                    Responder
                                </button>
                                {isReplying && (
                                    <form className="sheet-input-pill reply" onSubmit={submitReply} onKeyDown={handleReplyKeyDown}>
                                        <Input
                                            type="text"
                                            aria-label={`Responder a ${comment.author}`}
                                            placeholder="Escribe tu respuesta..."
                                            maxLength={COMMENT_MAX}
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            autoFocus
                                        />
                                        <button type="submit" className="sheet-send-btn" aria-label="Enviar respuesta" disabled={!canReply}>
                                            <img src="/paper-plane-regular-full.svg" alt="" />
                                        </button>
                                    </form>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </BottomSheet>
        </div>
    );
}

// Lee el id de la URL; el key reinicia el estado (respuesta abierta, texto escrito) al pasar a otra RVW
function ReviewRoute() {
    const { id } = useParams<{ id: string }>();
    return <ReviewContent key={id} reviewId={id} />;
}

export default function SingleReviewPage() {
    // Con cacheComponents, useParams necesita un Suspense alrededor
    return (
        <Suspense
            fallback={
                <div className="helper-wrapper">
                    <span className="helper-text">Cargando reseña...</span>
                </div>
            }
        >
            <ReviewRoute />
        </Suspense>
    );
}
