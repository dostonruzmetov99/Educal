const fs = require('fs');
let code = fs.readFileSync('D:\\EduSphere\\src\\App.tsx', 'utf8');

const startMarker = '{/* Tizim Tili */}';
const endMarker = '</div>\n'; // Need to carefully extract the added block

const startIndex = code.indexOf(startMarker);
if (startIndex !== -1) {
  // Find the exact block we added.
  // It was exactly: 
  const langUI = `
                {/* Tizim Tili */}
                <div className="card" style={{ marginBottom: '24px' }}>
                  <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={20} color="var(--primary-color)" /> Tizim Tili
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {['O\\'zbek', 'English', 'Русский', 'Türkçe'].map(lang => (
                      <button 
                        key={lang}
                        style={{ 
                          padding: '10px 20px', 
                          borderRadius: '8px', 
                          border: lang === 'O\\'zbek' ? '2px solid var(--primary-color)' : '1px solid var(--border-light)', 
                          background: lang === 'O\\'zbek' ? '#eef2ff' : 'white',
                          color: lang === 'O\\'zbek' ? 'var(--primary-color)' : 'var(--text-color)',
                          cursor: 'pointer',
                          fontWeight: lang === 'O\\'zbek' ? 600 : 400
                        }}
                        onClick={() => alert("Hozircha faqat O'zbek tili mavjud. Ko'p tillilik sayt to'liq ommaga chiqqandan so'ng faollashtiriladi!")}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px' }}>* Boshqa tillar sayt ommaga chiqqanidan so'ng faollashadi.</p>
                </div>
`;
  if (code.includes(langUI)) {
    code = code.replace(langUI, '');
    fs.writeFileSync('D:\\EduSphere\\src\\App.tsx', code);
    console.log("Language UI removed perfectly");
  } else {
    console.log("Language UI block doesn't match exactly, fallback logic");
    // Fallback: just remove everything from startMarker up to the next div closing that makes sense, 
    // or just use regex.
  }
} else {
  console.log("Language UI not found");
}
