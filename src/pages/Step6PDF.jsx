import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateVisitPDF } from '../utils/pdfGenerator';

export default function Step6PDF({ variant }) {
  const { t, lang, state, profile } = useApp();
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const handleGenerate = async () => {
    await generateVisitPDF(state, profile, lang);
    setPdfSuccess(true);
  };

  return (
    <>
      <button
        className={variant === 'secondary' ? 'btn btn-secondary' : 'pdf-btn'}
        style={variant === 'secondary' ? { width: '100%' } : undefined}
        onClick={handleGenerate}
      >
        📄 {t('generatePDF')}
      </button>
      {pdfSuccess && (
        <div style={{ textAlign: 'center', padding: '12px', fontSize: '14px', color: 'var(--success)' }}>
          ✅ {t('pdfGenerated')}
        </div>
      )}
    </>
  );
}
