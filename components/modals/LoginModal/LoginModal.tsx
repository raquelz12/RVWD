"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../../Modal/Modal';
import Button from '../../Button/Button';
import Input from '../../Input/Input';
import { useModal } from '@/context/ModalContext';
import '@/styles/forms.css';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { openModal } = useModal();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Siempre está montado (GlobalModals): al cerrar se vacía para no dejar la contraseña escrita
  const reset = () => {
    setUsername('');
    setPassword('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: validar e iniciar sesión cuando haya backend
    handleClose();
    router.push('/feed');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} labelledBy="login-title">
      <div className="modal-header">
        <h2 id="login-title" className="section-title">Inicia sesión en <span className="RVWS">ЯVWD</span></h2>
        <p>Accede a tu cuenta para empezar a reseñar</p>
      </div>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label htmlFor="login-user" className="form-label">Nombre de usuario o email*</label>
          <Input
            id="login-user"
            type="text"
            autoComplete="username"
            aria-required="true"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="tu nombre de usuario o email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="login-password" className="form-label">Contraseña*</label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            aria-required="true"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {/* TODO: recuperar contraseña cuando haya backend */}
          <Button type="button" variant="text">
            ¿Olvidaste tu contraseña?
          </Button>
        </div>
        <p className="required-fields-note">* Campos obligatorios</p>
        <div className="button-group">
          <Button variant="primary" type="submit">
            Iniciar sesión
          </Button>
          {/* TODO: OAuth cuando haya backend */}
          <Button type="button" variant="secondary">
            Continuar con Google
          </Button>
        </div>
      </form>
      <div className="modal-footer">
        <p>
          ¿No tienes cuenta todavía?{' '}
          <Button type="button" variant="text" onClick={() => { reset(); openModal('register'); }}>
            Regístrate
          </Button>
        </p>
      </div>
    </Modal>
  );
}
