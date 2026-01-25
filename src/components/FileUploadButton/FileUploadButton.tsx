import { useRef, useCallback } from "react";
import Button from "../Button/Button";

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  variant?: "primary" | "danger";
}

export default function FileUploadButton({
  onFileSelect,
  accept = ".json",
  disabled = false,
  title,
  children,
  variant,
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
      // Reset so the same file can be selected again
      e.target.value = "";
    },
    [onFileSelect]
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: "none" }}
      />
      <Button
        onClick={handleClick}
        disabled={disabled}
        title={title}
        variant={variant}
      >
        {children}
      </Button>
    </>
  );
}
