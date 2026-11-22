"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../../Modal/Modal';
import Button from '../../Button/Button';
import Input from '../../Input/Input';
import { useModal } from '@/context/ModalContext';
import '@/styles/forms.css';
import './RegisterModal.css';

export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const { openModal } = useModal();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Siempre está montado (GlobalModals): al cerrar se vacía para no dejar la contraseña escrita
  const reset = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setPasswordRepeat('');
    setAcceptedTerms(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: validar y crear la cuenta cuando haya backend
    handleClose();
    router.push('/onboarding');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} labelledBy="register-title">
      <div className="modal-header">
        <h2 id="register-title" className="section-title">Únete a <span className="RVWS">ЯVWD</span></h2>
        <p>Crea tu cuenta para empezar a reseñar</p>
      </div>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label htmlFor="register-user" className="form-label">Nombre de usuario*</label>
          <Input
            id="register-user"
            type="text"
            autoComplete="username"
            aria-required="true"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="tu nombre de usuario"
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-email" className="form-label">Correo electrónico*</label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            aria-required="true"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-password" className="form-label">Contraseña*</label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            aria-required="true"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-password-repeat" className="form-label">Confirmar contraseña*</label>
          <Input
            id="register-password-repeat"
            type="password"
            autoComplete="new-password"
            aria-required="true"
            value={passwordRepeat}
            onChange={(e) => setPasswordRepeat(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="register-terms">
          <input
            type="checkbox"
            id="register-terms"
            aria-required="true"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
          <label htmlFor="register-terms">
            He leído y acepto los <a href="/legal" target="_blank" rel="noopener noreferrer" className="inline-link">Términos y Condiciones</a> y la <a href="/privacy" target="_blank" rel="noopener noreferrer" className="inline-link">Política de Privacidad</a>*
          </label>
        </div>
        <p className="required-fields-note">* Campos obligatorios</p>
        <div className="button-group">
          <Button variant="primary" type="submit">
            Registrarse
          </Button>
          {/* TODO: OAuth cuando haya backend */}
          <Button type="button" variant="secondary">
            Continuar con Google
          </Button>
        </div>
      </form>
      <div className="modal-footer">
        <p>
          ¿Ya tienes cuenta?{' '}
          <Button type="button" variant="text" onClick={() => { reset(); openModal('login'); }}>
            Inicia sesión
          </Button>
        </p>
      </div>
    </Modal>
  );
}
