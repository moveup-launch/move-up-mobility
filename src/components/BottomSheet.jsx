import { useApp } from '../context/AppContext';

export default function BottomSheet() {
  const { sheet, closeSheet } = useApp();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeSheet();
  };

  return (
    <div className={`sheet-overlay ${sheet.isOpen ? 'open' : ''}`} onClick={handleOverlayClick}>
      <div className="bottom-sheet">
        {sheet.content}
      </div>
    </div>
  );
}
