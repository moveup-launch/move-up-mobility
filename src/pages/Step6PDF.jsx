import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateVisitPDF } from '../utils/pdfGenerator';

export default function Step6PDF() {
  const { t, lang, state, profile } = useApp();
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const handleGenerate = async () => {
    await generateVisitPDF(state, profile, lang);
    setPdfSuccess(true);
  };

  return (
    <>
      <button className="pdf-btn" onClick={handleGenerate}>
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
