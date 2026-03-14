import { ReactNode } from "react";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  width?: number;
}

export const Modal = ({ title, children, onClose, width = 480 }: ModalProps) => (
  <>
    <div onClick={onClose} className="fixed inset-0 bg-void/85 z-[800] backdrop-blur-sm animate-fade-in" />
    <div
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-raised to-surface border border-border-bright rounded-2xl max-h-[88vh] overflow-auto z-[801] animate-scale-in shadow-2xl"
      style={{ width: `min(94vw, ${width}px)` }}
    >
      <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-gradient-to-r from-primary-glow to-transparent">
        <div className="font-body font-bold text-[15px] tracking-wide">{title}</div>
        <button
          onClick={onClose}
          className="w-[30px] h-[30px] rounded-md bg-surface border border-border text-text-secondary hover:border-destructive/30 hover:text-destructive flex items-center justify-center text-sm transition-all"
        >✕</button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </>
);
