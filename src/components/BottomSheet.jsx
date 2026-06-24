import { useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function BottomSheet() {
  const { sheet, closeSheet } = useApp();
  const downOnOverlay = useRef(false);

  const handlePointerDown = (e) => {
    downOnOverlay.current = e.target === e.currentTarget;
  };

  const handleClick = (e) => {
    if (e.target === e.currentTarget && downOnOverlay.current) closeSheet();
    downOnOverlay.current = false;
  };

  return (
    <div
      className={`sheet-overlay ${sheet.isOpen ? 'open' : ''}`}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <div className="bottom-sheet">
        {sheet.content}
      </div>
    </div>
  );
}
