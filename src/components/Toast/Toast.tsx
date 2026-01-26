import "./Toast.css";

interface ToastProps {
  message: string;
  visible: boolean;
}

export default function Toast({ message, visible }: ToastProps) {
  if (!visible || !message) {
    return null;
  }

  return <div className="toast">{message}</div>;
}
