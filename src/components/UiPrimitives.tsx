import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { formatFormLabel } from "../utils/formLabels";

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="pageHeader">
      <div className="pageHeaderText">
        {eyebrow ? <p>{eyebrow}</p> : null}
        <h1>{title}</h1>
      </div>
      {children ? <div className="pageHeaderActions">{children}</div> : null}
    </header>
  );
}

export function AppCard({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  if (onClick) {
    return (
      <button className={`appCard tappable ${className}`} type="button" onClick={onClick}>
        {children}
      </button>
    );
  }
  return <section className={`appCard ${className}`}>{children}</section>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <section className="emptyState">
      <span className="stateIcon" aria-hidden="true">RCDS</span>
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </section>
  );
}

export function LoadingState({ label = "Loading RC Drift Sync..." }: { label?: string }) {
  return (
    <div className="loadingState">
      <Loader2 size={24} />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ title = "Something needs attention", body, action }: { title?: string; body: string; action?: ReactNode }) {
  return (
    <section className="errorState" role="alert">
      <AlertTriangle size={24} />
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </section>
  );
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  busy = false,
  onCancel,
  onConfirm
}: {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <div className="modalShade" role="presentation">
      <section className="confirmModal" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <h2 id="confirm-dialog-title">{title}</h2>
        <p>{body}</p>
        <div className="buttonRow">
          <button className="smallPill" type="button" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button className={`primaryAction ${destructive ? "destructive" : ""}`} type="button" onClick={onConfirm} disabled={busy}>
            {busy ? <Loader2 size={17} /> : null}
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export function StickyActionBar({ children }: { children: ReactNode }) {
  return <div className="stickyActionBar">{children}</div>;
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <header className="sectionHeader">
      <div>
        {eyebrow ? <p>{eyebrow}</p> : null}
        <h2>{title}</h2>
      </div>
      {action}
    </header>
  );
}

export function SaveToast({ show, label = "Saved" }: { show: boolean; label?: string }) {
  return (
    <div className={`saveToast ${show ? "show" : ""}`} role="status" aria-live="polite">
      <CheckCircle2 size={18} />
      {label}
    </div>
  );
}

export function TextField(props: InputHTMLAttributes<HTMLInputElement> & { label: string; helper?: string }) {
  const { label, helper, ...inputProps } = props;
  return (
    <label className="formField">
      <span>{formatFormLabel(label)}</span>
      <input {...inputProps} />
      {helper ? <small>{helper}</small> : null}
    </label>
  );
}

export function SelectField(props: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  const { label, children, ...selectProps } = props;
  return (
    <label className="formField">
      <span>{formatFormLabel(label)}</span>
      <select {...selectProps}>{children}</select>
    </label>
  );
}

export function TextAreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const { label, ...textareaProps } = props;
  return (
    <label className="formField">
      <span>{formatFormLabel(label)}</span>
      <textarea {...textareaProps} />
    </label>
  );
}
