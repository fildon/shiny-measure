import * as React from "react";
import { createPortal } from "react-dom";

const ModalContext = React.createContext<
  { modalRef: React.MutableRefObject<HTMLDivElement | null> } | undefined
>(undefined);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const modalRef = React.useRef<HTMLDivElement | null>(null);
  return (
    <ModalContext.Provider value={{ modalRef }}>
      {children}
      <div id="modal-root" ref={modalRef} />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = React.useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }

  const Modal = ({
    children,
    isOpen,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
  }) =>
    isOpen && context.modalRef.current
      ? createPortal(
          <div className="dialog-backdrop">
            <div className="dialog-container">{children}</div>
          </div>,
          context.modalRef.current
        )
      : null;

  return {
    Modal,
  };
};
