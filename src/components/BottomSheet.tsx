import type { ReactNode } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function BottomSheet({ title, children, onClose }: BottomSheetProps) {
  return (
    <div className="sheetShade" role="presentation" onClick={onClose}>
      <section className="bottomSheet" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="sheetHandle" />
        <header className="bottomSheetHeader">
          <h2>{title}</h2>
          <button className="iconButton" type="button" onClick={onClose} aria-label="Close editor">
            <X size={22} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
