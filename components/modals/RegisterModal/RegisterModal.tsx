"use client";

import { useState } from 'react';
import Modal from '../../Modal/Modal';
import Button from '../../Button/Button';
import Input from '../../Input/Input';
import { useModal } from '@/context/ModalContext';
import { useRouter } from 'next/navigation';
import './RegisterModal.css';

export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
    const { openModal } = useModal();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const router = useRouter();
    const { closeModal } = useModal();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Para cuando haya back
        closeModal();
        router.push('/onboarding');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
        <div className="modal-header">
            <h2>Únete a ЯVWD</h2>
            <p>Crea tu cuenta para empezar a reseñar</p>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
            <label>Nombre de usuario</label>
            <Input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="tu nombre de usuario" 
            />
            </div>
            <div className="form-group">
            <label>Correo electrónico</label>
            <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="tu@correo.com" 
            />
            </div>
            <div className="form-group">
            <label>Contraseña</label>
            <Input
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
            />
            </div>
            <div className="form-group">
            <label>Confirmar contraseña</label>
            <Input
                type="password" 
                value={passwordRepeat} 
                onChange={(e) => setPasswordRepeat(e.target.value)} 
                placeholder="••••••••" 
            />
            </div>
            <div className="checkbox-group">
                <input type="checkbox" id="terms" />
                <label htmlFor="terms">He leído y acepto los <a href="/legal" target="_blank">Términos y Condiciones</a> y la <a href="/privacy" target="_blank">Política de Privacidad</a></label>
            </div>
            <div className="button-group">
                <Button variant="primary" type="submit">
                Registrarse
                </Button>
                <Button variant="secondary">
                Google
                </Button>
            </div>
        </form>
        <div className="modal-footer">
            <p>
            ¿Ya tienes cuenta?
            <Button variant="text" onClick={() => { onClose(); openModal('login'); }}>
                Inicia sesión
            </Button>
            </p>
        </div>
        <div className="error-message">
            {/* Aquí puedes mostrar mensajes de error si es necesario */}
        </div>
        </Modal>
    );
}