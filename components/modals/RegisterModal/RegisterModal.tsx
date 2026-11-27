"use client";

import { useEffect, useRef, useState } from 'react';
import Modal from '../../Modal/Modal';
import Button from '../../Button/Button';
import Input from '../../Input/Input';
import { useModal } from '@/context/ModalContext';
import { VERIFY_LINK_DURATION } from '@/app/lib/emailVerification';
import '@/styles/forms.css';
import './RegisterModal.css';
import Rvw from '../../Rvw/Rvw';

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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  // Al registrarse se ve el aviso de «Revisa tu correo» en vez del formulario (el enlace del correo lleva a /verify-email)
  const [sentTo, setSentTo] = useState<string | null>(null);
  // Cuántas veces se ha reenviado: cambia el texto del aviso y vuelve a llevar el foco a él
  const [resendCount, setResendCount] = useState(0);
  const sentRef = useRef<HTMLParagraphElement>(null);

  // Al enviar desaparece el botón que tenía el foco: se lleva al aviso (y el lector lo lee). Al reenviar, se vuelve a leer
  useEffect(() => {
    if (sentTo !== null) sentRef.current?.focus({ preventScroll: true });
  }, [sentTo, resendCount]);

  // Siempre está montado (GlobalModals): al cerrar se vacía para no dejar la contraseña escrita
  const reset = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setPasswordRepeat('');
    setAcceptedTerms(false);
    setSentTo(null);
    setResendCount(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: validar y crear la cuenta cuando haya backend (el backend manda el correo con el enlace a /verify-email)
    setPassword('');
    setPasswordRepeat('');
    setSentTo(email.trim());
  };

  const resend = () => {
    // TODO: pedir al backend que reenvíe el correo de confirmación (y mostrar su error si falla)
    setResendCount((n) => n + 1);
  };

  if (sentTo !== null) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} labelledBy="register-title">
        <div className="modal-header">
          <h2 id="register-title" className="section-title">Revisa tu correo</h2>
        </div>
        <div className="modal-form">
          <p ref={sentRef} className="success-message register-sent" tabIndex={-1}>
            <span>
              {resendCount > 0 ? 'Te hemos enviado otro enlace' : 'Te hemos enviado un enlace'} a{' '}
              {/* Sin validación todavía puede llegar vacío */}
              {sentTo ? <strong className="register-email">{sentTo}</strong> : 'tu correo'} para confirmar tu cuenta.
              Caduca en {VERIFY_LINK_DURATION}. Si no lo ves, mira también en la carpeta de spam.
            </span>
          </p>
          <div className="button-group">
            <Button type="button" variant="primary" onClick={handleClose}>
              Entendido
            </Button>
            <Button type="button" variant="text" onClick={resend}>
              Reenviar correo
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} labelledBy="register-title">
      <div className="modal-header">
        <h2 id="register-title" className="section-title">Únete a <Rvw>RVWD</Rvw></h2>
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
