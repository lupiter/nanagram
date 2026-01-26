import "./UploadZone.css";

interface UploadZoneProps {
  children: React.ReactNode;
  message?: string;
}

export default function UploadZone({ children, message }: UploadZoneProps) {
  return (
    <div className="upload-zone">
      {message && <p className="upload-zone-message">{message}</p>}
      {children}
    </div>
  );
}
