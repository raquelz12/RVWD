"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import type { ReportTarget } from '@/app/lib/reports';
import type { Review } from '@/types/music';

type ModalType = 'register' | 'login' | 'add' | 'report' | null;

/** Qué se va a reseñar al abrir el modal de crear RVW desde una ficha */
export interface AddTarget {
  type: Review['type'];
  id: number;
}

interface ModalContextType {
  activeModal: ModalType;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  /** Qué se está denunciando (solo con el modal de denuncia abierto) */
  reportTarget: ReportTarget | null;
  /** Abre el modal de denuncia para una RVW, un comentario o un perfil */
  openReport: (target: ReportTarget) => void;
  /** Qué se va a reseñar (solo si el modal de crear RVW se abrió desde una ficha) */
  addTarget: AddTarget | null;
  /** Abre el modal de crear RVW; con target, ya elegido lo que se reseña */
  openAdd: (target?: AddTarget) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [addTarget, setAddTarget] = useState<AddTarget | null>(null);

  const openModal = (modal: ModalType) => setActiveModal(modal);
  const closeModal = () => {
    setActiveModal(null);
    setReportTarget(null);
    setAddTarget(null);
  };
  const openReport = (target: ReportTarget) => {
    setReportTarget(target);
    setActiveModal('report');
  };
  const openAdd = (target?: AddTarget) => {
    setAddTarget(target ?? null);
    setActiveModal('add');
  };

  return (
    <ModalContext.Provider value={{ activeModal, openModal, closeModal, reportTarget, openReport, addTarget, openAdd }}>
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
