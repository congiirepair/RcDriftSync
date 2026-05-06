import { CheckCircle2, Loader2 } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="pageHeader">
      {eyebrow ? <p>{eyebrow}</p> : null}
      <h1>{title}</h1>
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

export function SaveToast({ show, label = "Saved" }: { show: boolean; label?: string }) {
  return (
    <div className={`saveToast ${show ? "show" : ""}`} role="status" aria-live="polite">
      <CheckCircle2 size={18} />
      {label}
    </div>
  );
}

export function TextField(props: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <label className="formField">
      <span>{label}</span>
      <input {...inputProps} />
    </label>
  );
}

export function SelectField(props: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  const { label, children, ...selectProps } = props;
  return (
    <label className="formField">
      <span>{label}</span>
      <select {...selectProps}>{children}</select>
    </label>
  );
}

export function TextAreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const { label, ...textareaProps } = props;
  return (
    <label className="formField">
      <span>{label}</span>
      <textarea {...textareaProps} />
    </label>
  );
}
