// Modal.js
import React from "react";
import "./Modal.css";

const Modal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h3>{message}</h3>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
