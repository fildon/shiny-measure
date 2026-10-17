import * as React from "react";

const DISMISS_AFTER_MS = 5000;

export interface ToastMessage {
  /** Unique per toast, so a repeated message restarts the timer */
  id: number;
  text: string;
  undo?: () => void;
}

export const Toast = ({
  toast,
  onDismiss,
}: {
  toast: ToastMessage | undefined;
  onDismiss: () => void;
}) => {
  React.useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(onDismiss, DISMISS_AFTER_MS);
    return () => clearTimeout(timeout);
  }, [toast, onDismiss]);

  return (
    <div role="status" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.id}>
          <span>{toast.text}</span>
          {toast.undo && (
            <button type="button" onClick={toast.undo}>
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
};
