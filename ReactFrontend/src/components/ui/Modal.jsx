import { X } from "lucide-react";
export default function Modal({ title, children, onClose }) { return <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-label={title}><header><h3>{title}</h3><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></header>{children}</section></div>; }
