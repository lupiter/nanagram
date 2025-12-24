import { useState } from "react";
import Button from "./Button";
import Modal from "./Modal";
import "./DesignerInfo.css";

export default function DesignerInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="designer-info">
      <Button onClick={() => { setIsOpen(true); }} aria-label="Show help information">
        ℹ︎ Help
      </Button>
      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); }} title="Help">
        <div className="info-content">
          <p>Click cells to toggle filled/unfilled. The hints update automatically.</p>
          <p>A valid puzzle must have exactly one unique solution.</p>
        </div>
      </Modal>
    </div>
  );
}

