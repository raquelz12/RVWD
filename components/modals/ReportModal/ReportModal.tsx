"use client";

import { useState } from 'react';
import Modal from '../../Modal/Modal';
import Button from '../../Button/Button';
import Select from '../../Select/Select';
import TextArea from '../../TextArea/TextArea';
import { REPORT_REASONS, REPORT_DETAILS_MAX, type ReportReason, type ReportTarget } from '@/app/lib/reports';
import './ReportModal.css';

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: ReportTarget | null;
}

const TITLE: Record<ReportTarget['type'], string> = {
  RVW: 'Denunciar RVW',
  Comentario: 'Denunciar comentario',
  Perfil: 'Denunciar perfil',
};

const CONTEXT: Record<ReportTarget['type'], string> = {
  RVW: 'RVW de',
  Comentario: 'Comentario de',
  Perfil: 'Perfil de',
};

export default function ReportModal({ isOpen, onClose, target }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [sent, setSent] = useState(false);

  // Al cerrar se vacía, para que la próxima denuncia empiece de cero
  const handleClose = () => {
    setReason('');
    setDetails('');
    setSent(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !target) return;
    // TODO: enviar { type, id, reason, details } cuando haya backend
    // (comprobar sesión iniciada y que no la haya denunciado ya)
    setSent(true);
  };

  if (!target) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {sent ? (
        <div className="report-modal report-modal-sent" role="status">
          <h2 className="report-modal-title">Gracias por avisarnos</h2>
          <p className="report-modal-text">
            Nuestro equipo revisará la denuncia lo antes posible. {target.author} no sabrá quién la ha hecho.
          </p>
          <Button variant="primary" onClick={handleClose}>Cerrar</Button>
        </div>
      ) : (
        <form className="report-modal" onSubmit={handleSubmit}>
          <div className="report-modal-header">
            <h2 className="report-modal-title">{TITLE[target.type]}</h2>
            <p className="report-modal-context">{CONTEXT[target.type]} {target.author}</p>
          </div>

          <div className="report-modal-field">
            <span className="report-modal-label">Motivo</span>
            <Select
              options={REPORT_REASONS}
              value={reason}
              onChange={(value) => setReason(value as ReportReason)}
              placeholder="Elige un motivo"
            />
          </div>

          <div className="report-modal-field">
            <label className="report-modal-label" htmlFor="report-details">
              Cuéntanos más <span className="report-modal-optional">(opcional)</span>
            </label>
            <TextArea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, REPORT_DETAILS_MAX))}
              placeholder="¿Qué ha pasado?"
            />
            <span className="report-modal-counter">{details.length}/{REPORT_DETAILS_MAX}</span>
          </div>

          <p className="report-modal-note">La persona denunciada no sabrá quién la ha denunciado.</p>

          <div className="report-modal-actions">
            <Button type="button" variant="text" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="danger" disabled={!reason}>Enviar denuncia</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
