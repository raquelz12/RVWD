"use client";

import { useState, useRef, useEffect } from 'react';
import Modal from '../../Modal/Modal';
import { revealInModal } from '../../Modal/revealInModal';
import Button from '../../Button/Button';
import Input from '../../Input/Input';
import TextArea from '../../TextArea/TextArea';
import Score from '../../Score/Score';
import SearchResults from '../../SearchResults/SearchResults';
import Rvw from '../../Rvw/Rvw';
import { mockAlbums, mockArtists, mockSongs } from '@/app/lib/mockData';
import type { Review } from '@/types/music';
import '@/styles/forms.css';
import './AddModal.css';

export interface AddModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ReviewType = Review['type'];

interface SelectedItem {
    key: string;
    title: string;
    subtitle: string;
    imageUrl: string;
}

const TYPE_INFO: Record<ReviewType, { label: string; icon: string; choose: string }> = {
    album: { label: 'Álbum', icon: '/compact-disc-solid-full.svg', choose: 'el álbum' },
    cancion: { label: 'Canción', icon: '/music-solid-full.svg', choose: 'la canción' },
    artista: { label: 'Artista', icon: '/user-regular-full.svg', choose: 'el artista' },
};

const TYPE_ORDER: ReviewType[] = ['album', 'cancion', 'artista'];

// TODO: la búsqueda vendrá del backend; mientras, se filtran los datos de prueba
const SEARCH_SOURCE: Record<ReviewType, SelectedItem[]> = {
    album: mockAlbums.map((a) => ({ key: `album-${a.id}`, title: a.name, subtitle: a.artist.name, imageUrl: a.coverUrl })),
    cancion: mockSongs.map((s) => ({ key: `cancion-${s.id}`, title: s.name, subtitle: s.artist.name, imageUrl: s.coverUrl })),
    artista: mockArtists.map((a) => ({ key: `artista-${a.id}`, title: a.name, subtitle: 'Artista', imageUrl: a.pictureUrl })),
};

const searchItems = (type: ReviewType, query: string) => {
    const q = query.trim().toLowerCase();
    return SEARCH_SOURCE[type].filter(
        (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    );
};

/* Hasta dónde se ha mostrado el formulario. Los campos aparecen de uno en uno,
   pero uno que ya ha salido no se vuelve a ocultar aunque se borre el anterior */
const REVEAL_TITLE = 1;
const REVEAL_TEXT = 2;
const REVEAL_SUBMIT = 3;

const SEARCH_ID = 'add-search';

export default function AddModal({ isOpen, onClose }: AddModalProps) {
    const [type, setType] = useState<ReviewType | null>(null);
    const [searchText, setSearchText] = useState('');
    const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
    const [score, setScore] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [revealed, setRevealed] = useState(0);

    const scoreRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    // Al quitar la selección, el foco vuelve al buscador (el botón ✕ desaparece)
    const focusSearchAfterRemove = useRef(false);

    // Al elegir algo se baja hasta la nota; al quitarlo, foco al buscador
    useEffect(() => {
        if (selectedItem) {
            if (scoreRef.current) revealInModal(scoreRef.current, { smooth: true });
        } else if (focusSearchAfterRemove.current) {
            focusSearchAfterRemove.current = false;
            const search = document.getElementById(SEARCH_ID);
            search?.focus({ preventScroll: true });
            if (search) revealInModal(search);
        }
    }, [selectedItem]);

    // Al entrar en un campo o escribir en él, se enseña también el bloque siguiente
    // (nota → título → reseña → botón), para que se sepa que hay más. Vale aunque el borrador
    // ya tuviera todos los campos a la vista. Si el siguiente ya se ve, no se mueve nada.
    // keepFocused: el campo en el que se escribe sigue a la vista (si no, Safari deshace el desplazamiento)
    const revealNextBlock = (e: React.SyntheticEvent) => {
        const field = e.target;
        if (!(field instanceof HTMLElement) || !field.matches('input, textarea')) return;
        const block = field.closest('.form-group');
        if (!block) return;
        // En el siguiente fotograma: el bloque nuevo (si acaba de aparecer) ya está en la página
        requestAnimationFrame(() => {
            const next = block.nextElementSibling;
            if (next instanceof HTMLElement) revealInModal(next, { smooth: true, keepFocused: true });
        });
    };

    // Al aparecer los resultados, el buscador sube arriba de la zona visible: así entran todos los que quepan
    const hasResults = searchText.trim() !== '';
    useEffect(() => {
        if (hasResults && searchRef.current) revealInModal(searchRef.current, { smooth: true, align: 'start' });
    }, [hasResults]);

    const reveal = (level: number) => setRevealed((prev) => Math.max(prev, level));

    const handleTypeChange = (newType: ReviewType) => {
        if (newType === type) return;
        setType(newType);
        setSelectedItem(null);
        setSearchText('');
    };

    const handleRemoveSelection = () => {
        focusSearchAfterRemove.current = true;
        setSelectedItem(null);
    };

    // El borrador se conserva al cerrar (un clic fuera no debe borrar la reseña); solo se vacía la búsqueda
    const handleClose = () => {
        setSearchText('');
        onClose();
    };

    const reset = () => {
        setType(null);
        setSearchText('');
        setSelectedItem(null);
        setScore('');
        setTitle('');
        setDescription('');
        setRevealed(0);
    };

    const canPublish = Boolean(type && selectedItem && score !== '' && title.trim() && description.trim());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canPublish) return;
        // TODO: enviar { type, id, score, title, description } cuando haya backend
        reset();
        onClose();
    };

    const info = type ? TYPE_INFO[type] : null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} labelledBy="add-title">
            <div className="modal-header add-modal-header">
                <h2 id="add-title" className="section-title">Crea tu <Rvw>RVW</Rvw></h2>
                <p>Comparte tu opinión con la comunidad de <Rvw>RVWD</Rvw></p>
            </div>

            <form
                onSubmit={handleSubmit}
                onFocus={revealNextBlock}
                onInput={revealNextBlock}
                className="modal-form add-modal-form"
            >
                <fieldset className="add-modal-fieldset">
                    <legend className="form-label">¿De qué quieres hacer una RVW?</legend>
                    <div className="add-modal-types">
                        {TYPE_ORDER.map((t) => (
                            <button
                                key={t}
                                type="button"
                                className="add-modal-type"
                                aria-pressed={type === t}
                                onClick={() => handleTypeChange(t)}
                            >
                                <img src={TYPE_INFO[t].icon} alt="" /> {TYPE_INFO[t].label}
                            </button>
                        ))}
                    </div>
                </fieldset>

                {type && info && (
                    <div className="form-group fade-in-section">
                        {!selectedItem ? (
                            <>
                                <label htmlFor={SEARCH_ID} className="form-label">Elige {info.choose}</label>
                                <div
                                    ref={searchRef}
                                    className="add-modal-search"
                                    // Con resultados abiertos, Escape solo los cierra (no el modal)
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape' && searchText.trim()) {
                                            e.stopPropagation();
                                            setSearchText('');
                                        }
                                    }}
                                >
                                    <Input
                                        id={SEARCH_ID}
                                        type="text"
                                        autoComplete="off"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        placeholder={`Busca ${info.choose}...`}
                                    />
                                    {searchText.trim() && (
                                        <SearchResults
                                            notFound={`No se encontró "${searchText.trim()}"`}
                                            items={searchItems(type, searchText).map((item) => ({
                                                key: item.key,
                                                title: item.title,
                                                sub: item.subtitle,
                                                imageUrl: item.imageUrl,
                                                onSelect: () => {
                                                    setSelectedItem(item);
                                                    setSearchText('');
                                                },
                                            }))}
                                        />
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="form-label add-modal-selected-label">Elige {info.choose}</span>
                                <div className="add-modal-selected">
                                    <img src={selectedItem.imageUrl} alt="" className="add-modal-selected-img" />
                                    <div className="add-modal-selected-text">
                                        <span className="add-modal-selected-type">
                                            <img src={info.icon} alt="" />
                                            {info.label}
                                        </span>
                                        <span className="add-modal-selected-title">{selectedItem.title}</span>
                                        <span>{selectedItem.subtitle}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="add-modal-remove"
                                        onClick={handleRemoveSelection}
                                        aria-label={`Quitar ${selectedItem.title}`}
                                    >
                                        &times;
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {selectedItem && (
                    <div className="form-group fade-in-section" ref={scoreRef}>
                        <label htmlFor="add-score" className="form-label">Dale una nota</label>
                        <div className="add-modal-score">
                            <Score
                                id="add-score"
                                input={true}
                                variant="red"
                                score={score}
                                onChange={(val) => {
                                    setScore(val);
                                    if (val !== '') reveal(REVEAL_TITLE);
                                }}
                            />
                            <span>Tu <Rvw>RVW</Rvw> score</span>
                        </div>
                    </div>
                )}

                {selectedItem && revealed >= REVEAL_TITLE && (
                    <div className="form-group fade-in-section">
                        <label htmlFor="add-review-title" className="form-label">Ponle un título a tu RVW</label>
                        <Input
                            id="add-review-title"
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (e.target.value.trim()) reveal(REVEAL_TEXT);
                            }}
                            placeholder="Escribe un título breve..."
                        />
                    </div>
                )}

                {selectedItem && revealed >= REVEAL_TEXT && (
                    <div className="form-group fade-in-section">
                        <label htmlFor="add-review-text" className="form-label">Escribe tu RVW</label>
                        <TextArea
                            id="add-review-text"
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                if (e.target.value.trim()) reveal(REVEAL_SUBMIT);
                            }}
                            placeholder="Escribe lo que piensas..."
                            rows={3}
                        />
                    </div>
                )}

                {selectedItem && revealed >= REVEAL_SUBMIT && (
                    <div className="button-group fade-in-section">
                        <Button variant="primary" type="submit" disabled={!canPublish}>
                            Publicar <Rvw>RVW</Rvw>
                        </Button>
                    </div>
                )}
            </form>
        </Modal>
    );
}
