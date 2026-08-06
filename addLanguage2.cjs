const fs = require('fs');
let code = fs.readFileSync('D:\\EduSphere\\src\\App.tsx', 'utf8');

const matchStart = code.indexOf("activeView === 'settings'");
if (matchStart !== -1) {
  const insertPos = code.indexOf("<div className=\"card\"", matchStart);
  
  if (insertPos !== -1) {
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
    code = code.slice(0, insertPos) + langUI + code.slice(insertPos);
    fs.writeFileSync('D:\\EduSphere\\src\\App.tsx', code);
    console.log("Language UI added");
  }
}
