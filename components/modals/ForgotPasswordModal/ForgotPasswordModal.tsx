"use client";

import { useEffect, useRef, useState } from 'react';
import Modal from '../../Modal/Modal';
import Button from '../../Button/Button';
import Input from '../../Input/Input';
import { useModal } from '@/context/ModalContext';
import { isValidEmail, RESET_LINK_DURATION } from '@/app/lib/passwordReset';
import '@/styles/forms.css';
import './ForgotPasswordModal.css';

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Pide el correo para mandar el enlace de /reset-password. Se abre desde el login y desde esa página */
export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const { openModal } = useModal();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  // Correo al que se mandó el enlace; con él puesto se ve el aviso en vez del formulario
  const [sentTo, setSentTo] = useState('');
  const sentRef = useRef<HTMLParagraphElement>(null);
  // Al cambiar de vista desaparece el botón que tenía el foco: se lleva al aviso (y el lector lo lee)
  // o, con «Usar otro correo», al campo. hasSent evita mover el foco al abrir el modal
  const hasSent = useRef(false);

  useEffect(() => {
    if (sentTo) {
      hasSent.current = true;
      sentRef.current?.focus({ preventScroll: true });
    } else if (hasSent.current) {
      hasSent.current = false;
      document.getElementById('forgot-email')?.focus({ preventScroll: true });
    }
  }, [sentTo]);

  // Siempre está montado (GlobalModals): al cerrar se vacía
  const reset = () => {
    setEmail('');
    setError('');
    setSentTo('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const backToLogin = () => {
    reset();
    openModal('login');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Escribe un email válido.');
      return;
    }
    // TODO: pedir al backend que mande el correo (y mostrar su error si falla)
    setSentTo(email.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} labelledBy="forgot-title">
      <div className="modal-header">
        <h2 id="forgot-title" className="section-title">
          {sentTo ? 'Revisa tu correo' : 'Recupera tu contraseña'}
        </h2>
        {!sentTo && <p>Te enviaremos un enlace para crear una contraseña nueva</p>}
      </div>

      {sentTo ? (
        <div className="modal-form">
          {/* Mismo texto haya cuenta o no: así no se puede averiguar qué correos están registrados */}
          <p ref={sentRef} className="success-message forgot-sent" tabIndex={-1}>
            <span>
              Si hay una cuenta con <strong className="forgot-email">{sentTo}</strong>, te hemos enviado un enlace.
              Caduca en {RESET_LINK_DURATION}. Si no lo ves, mira también en la carpeta de spam.
            </span>
          </p>
          <div className="button-group">
            <Button type="button" variant="primary" onClick={backToLogin}>
              Volver a iniciar sesión
            </Button>
            <Button type="button" variant="text" onClick={() => setSentTo('')}>
              Usar otro correo
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          <div className="form-group">
            <label htmlFor="forgot-email" className="form-label">Correo electrónico*</label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              aria-required="true"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'forgot-error' : undefined}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="tu@correo.com"
            />
          </div>
          {error && (
            <p id="forgot-error" className="form-error" role="alert">
              {error}
            </p>
          )}
          <p className="required-fields-note">* Campos obligatorios</p>
          <div className="button-group">
            <Button variant="primary" type="submit">
              Enviar enlace
            </Button>
          </div>
        </form>
      )}

      {!sentTo && (
        <div className="modal-footer">
          <p>
            ¿Te has acordado?{' '}
            <Button type="button" variant="text" onClick={backToLogin}>
              Inicia sesión
            </Button>
          </p>
        </div>
      )}
    </Modal>
  );
}
