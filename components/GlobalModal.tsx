"use client";

import { useModal } from '@/context/ModalContext';
import RegisterModal from '../components/modals/RegisterModal/RegisterModal';
// import LoginModal from '../components/modals/LoginModal/LoginModal'; // Cuando lo crees

export default function GlobalModals() {
  const { activeModal, closeModal } = useModal();

  return (
    <>
      <RegisterModal 
        isOpen={activeModal === 'register'} 
        onClose={closeModal} 
      />
      
      {/* <LoginModal 
        isOpen={activeModal === 'login'} 
        onClose={closeModal} 
      /> */}
    </>
  );
}