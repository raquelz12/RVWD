"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import type { ReportTarget } from '@/app/lib/reports';

type ModalType = 'register' | 'login' | 'add' | 'report' | null;

interface ModalContextType {
  activeModal: ModalType;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  /** Qué se está denunciando (solo con el modal de denuncia abierto) */
  reportTarget: ReportTarget | null;
  /** Abre el modal de denuncia para una RVW, un comentario o un perfil */
  openReport: (target: ReportTarget) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

  const openModal = (modal: ModalType) => setActiveModal(modal);
  const closeModal = () => {
    setActiveModal(null);
    setReportTarget(null);
  };
  const openReport = (target: ReportTarget) => {
    setReportTarget(target);
    setActiveModal('report');
  };

  return (
    <ModalContext.Provider value={{ activeModal, openModal, closeModal, reportTarget, openReport }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal debe usarse dentro de un ModalProvider');
  }
  return context;
}
