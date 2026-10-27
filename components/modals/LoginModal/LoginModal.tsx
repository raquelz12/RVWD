"use client";

import { useState } from 'react';
import Modal from '../../Modal/Modal';
import Button from '../../Button/Button';
import Input from '../../Input/Input';
import { useModal } from '@/context/ModalContext';
import './LoginModal.css';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { openModal } = useModal();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Pra cuando haya back
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h2>Inicia sesión en ЯVWD</h2>
        <p>Accede a tu cuenta para empezar a reseñar</p>
      </div>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label>Nombre de usuario o Email</label>
          <Input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            placeholder="tu nombre de usuario o email" 
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
          <Button variant="text" onClick={() => { onClose();}}>
            ¿Olvidaste tu contraseña?
          </Button>
        </div>
        <div className="button-group">
            <Button variant="primary" type="submit">
            Iniciar sesión
            </Button>
            <Button variant="secondary">
            Google
            </Button>
        </div>
      </form>
      <div className="modal-footer">
        <p>
          ¿No tienes cuenta todavía?
          <Button variant="text" onClick={() => { onClose(); openModal('register'); }}>
            Regístrate
          </Button>
        </p>
      </div>
      <div className="error-message">
        {/* Aquí puedes mostrar mensajes de error si es necesario */}
      </div>
    </Modal>
  );
}