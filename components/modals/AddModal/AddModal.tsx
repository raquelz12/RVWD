"use client";

import { useState, useRef, useEffect } from 'react';
import Modal from '../../Modal/Modal';
import Button from '../../Button/Button';
import Input from '../../Input/Input';
import Textarea from '../../TextArea/TextArea';
import Score from '../../Score/Score';
import './AddModal.css';

export interface AddModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SelectedItem {
    title: string;
    subtitle: string;
    imageUrl: string;
    typeLabel: string;
}

export default function AddModal({ isOpen, onClose }: AddModalProps) {
    const [type, setType] = useState('');
    const [searchText, setSearchText] = useState('');
    const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
    const [score, setScore] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const scoreRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);
    const descRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedItem && scoreRef.current) {
            scoreRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [selectedItem]);

    useEffect(() => {
        if (score && titleRef.current) {
            titleRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [score]);

    useEffect(() => {
        if (title && descRef.current) {
            descRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [title]);

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        //Logica del back
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="modal-header">
                <h2>Crea tu <span className="logo-text">ЯVW</span></h2>
                <p>Comparte tu opinión con la comunidad de ЯVWD</p>
            </div>

            <form onSubmit={handleAddSubmit} className="modal-form">
                <div className="form-group">
                    <label>¿De qué quieres hacer una RVW?</label>
                    <div className="options">
                        <button 
                            type="button" 
                            className={type === 'álbum' ? 'active' : ''} 
                            onClick={() => { setType('álbum'); setSelectedItem(null); }}
                        >
                            <img src="/compact-disc-solid-full.svg" alt="Álbum" /> Álbum
                        </button>
                        <button 
                            type="button" 
                            className={type === 'canción' ? 'active' : ''} 
                            onClick={() => { setType('canción'); setSelectedItem(null); }}
                        >
                            <img src="/music-solid-full.svg" alt="Canción" /> Canción
                        </button>
                        <button 
                            type="button" 
                            className={type === 'artista' ? 'active' : ''} 
                            onClick={() => { setType('artista'); setSelectedItem(null); }}
                        >
                            <img src="/user-regular-full.svg" alt="Artista" /> Artista
                        </button>
                    </div>
                </div>

                {type && (
                    <div className="form-group fade-in-section">
                        <label>Elige {type === 'album' ? 'el álbum' : type === 'cancion' ? 'la canción' : 'el artista'}</label>
                        
                        {!selectedItem ? (
                            <div className="search-container-wrapper">
                                <Input 
                                    type="text" 
                                    value={searchText} 
                                    onChange={(e) => setSearchText(e.target.value)} 
                                    placeholder="Busca..." 
                                />
                                
                                {searchText.trim() && (
                                    <div className="search-dropdown-results">
                                        <div 
                                            className="search-result-item"
                                            onClick={() => {
                                                setSelectedItem({
                                                    title: 'Jukiar',
                                                    subtitle: 'Clarent',
                                                    imageUrl: '/placeholder.jpg',
                                                    typeLabel: type === 'album' ? 'Álbum' : type === 'cancion' ? 'Canción' : 'Artista'
                                                });
                                                setSearchText('');
                                            }}
                                        >
                                            <img src="/placeholderCards.png" alt="cover" />
                                            <div>
                                                <p className="result-title">Jukiar</p>
                                                <p className="result-sub">Clarent</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="selected-item-card">
                                <div className="selected-item-info">
                                    <img src="/placeholderCards.png" alt={selectedItem.title} className="selected-item-img" />
                                    <div className="selected-item-text">
                                        <span className="selected-item-type">
                                            { type === 'album' && <img src="/compact-disc-solid-full.svg" alt="type" /> }
                                            { type === 'cancion' && <img src="/music-solid-full.svg" alt="type" /> }
                                            { type === 'artista' && <img src="/user-regular-full.svg" alt="type" /> }
                                            {selectedItem.typeLabel}
                                        </span>
                                        <span className="selected-item-title">{selectedItem.title}</span>
                                        <span className="selected-item-subtitle">{selectedItem.subtitle}</span>
                                    </div>
                                </div>
                                <button type="button" className="remove-selection-btn" onClick={() => setSelectedItem(null)}>
                                    &times;
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {type && selectedItem && (
                    <div className="form-group fade-in-section" ref={scoreRef}>
                        <label>Dale una nota</label>
                        <div className="score-card-preview">
                            <Score 
                                score={score} 
                                onChange={(val) => setScore(val)}
                            />
                            <div className="score-label-container">
                                <span className="score-brand">Tu <span className="logo-text">RVW</span> score</span>
                            </div>
                        </div>
                    </div>
                )}

                {type && selectedItem && score && (
                    <div className="form-group fade-in-section" ref={titleRef}>
                        <label>Escribe un título a tu RVW</label>
                        <Input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="Define tu RVW en una frase..." 
                        />
                    </div>
                )}

                {type && selectedItem && score && title && (
                    <div className="form-group fade-in-section" ref={descRef}>
                        <label>Escribe tu RVW</label>
                        <Textarea
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="Escribe tu reseña detallada..." 
                            rows={3}
                        />
                    </div>
                )}

                {type && selectedItem && score && title && description && (
                    <div className="button-group fade-in-section">
                        <Button variant="primary" type="submit">
                            Publicar <span className="logo-text">RVW</span>
                        </Button>
                    </div>
                )}
            </form>
        </Modal>
    );
}