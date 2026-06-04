import { useApp } from '../context/AppContext';

export default function Modal() {
  const { modal } = useApp();

  return (
    <div className={`modal-overlay ${modal.isOpen ? 'open' : ''}`}>
      <div className="modal">
        {modal.content}
      </div>
    </div>
  );
}
