import { createContext, useContext, useState, useRef, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toastState, setToastState] = useState({ show: false, message: "", isErr: false });
  const timerRef = useRef(null);

  const toast = useCallback((message, isErr = false) => {
    setToastState({ show: true, message, isErr });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setToastState((s) => ({ ...s, show: false }));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={"toast" + (toastState.show ? " show" : "") + (toastState.isErr ? " err" : "")}>
        {toastState.message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
