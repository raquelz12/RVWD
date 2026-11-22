"use client";

import { useModal } from '@/context/ModalContext';
import RegisterModal from '../components/modals/RegisterModal/RegisterModal';
import LoginModal from '../components/modals/LoginModal/LoginModal';
import AddModal from './modals/AddModal/AddModal';
import ReportModal from './modals/ReportModal/ReportModal';

export default function GlobalModals() {
  const { activeModal, closeModal, reportTarget } = useModal();

  return (
    <>
      <RegisterModal
        isOpen={activeModal === 'register'}
        onClose={closeModal}
      />

      <LoginModal
        isOpen={activeModal === 'login'}
        onClose={closeModal}
      />

      <AddModal
        isOpen={activeModal === 'add'}
        onClose={closeModal}
      />

      <ReportModal
        isOpen={activeModal === 'report'}
        onClose={closeModal}
        target={reportTarget}
      />
    </>
  );
}
