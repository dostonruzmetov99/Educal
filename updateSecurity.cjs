const fs = require('fs');

// --- 1. SERVER UPDATE ---
let serverContent = fs.readFileSync('D:\\EduSphere\\server\\index.ts', 'utf8');

serverContent = serverContent.replace(
  `import fs from 'fs';`,
  `import fs from 'fs';\nimport nodemailer from 'nodemailer';`
);

const newEndpoints = `
// --- XAVFSIZLIK API (OTP, Email, Parol) ---
const otpStore = new Map<number, { code: string, expires: number }>();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'test@gmail.com',
    pass: process.env.SMTP_PASS || 'test'
  }
});

app.post('/api/auth/send-otp', authMiddleware, async (req: any, res: any) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (user?.email !== email) return res.status(400).json({ error: "Kiritilgan eski email sizning joriy emailingiz emas." });
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(req.userId, { code, expires: Date.now() + 5 * 60 * 1000 }); // 5 minutes
    
    console.log("===============================");
    console.log("OTP KOD:", code); // Test qilish uchun konsolga chiqaramiz
    console.log("===============================");
    
    // Agar real pochtaga yuborish kerak bo'lsa:
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'test@gmail.com') {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'EduSphere - Email tasdiqlash kodi',
        text: \`Sizning tasdiqlash kodingiz: \${code}\`
      });
    }
    
    res.json({ success: true, message: "Kod yuborildi (Test uchun konsolga ham chiqdi)" });
  } catch (error) {
    res.status(500).json({ error: "Kod yuborishda xatolik" });
  }
});

app.post('/api/auth/change-email', authMiddleware, async (req: any, res: any) => {
  try {
    const { oldEmail, otp, newEmail } = req.body;
    const store = otpStore.get(req.userId);
    
    if (!store || store.code !== otp || Date.now() > store.expires) {
      return res.status(400).json({ error: "Kod noto'g'ri yoki eskirgan." });
    }
    
    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) return res.status(400).json({ error: "Bu yangi email band." });
    
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { email: newEmail }
    });
    
    otpStore.delete(req.userId);
    res.json(updated);
  } catch(error) {
    res.status(500).json({ error: "Email o'zgartirishda xatolik" });
  }
});

app.post('/api/auth/change-password', authMiddleware, async (req: any, res: any) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    
    const isValid = await bcrypt.compare(oldPassword, user?.password || "");
    if (!isValid) return res.status(400).json({ error: "Eski parol noto'g'ri." });
    
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashed }
    });
    
    res.json({ success: true });
  } catch(error) {
    res.status(500).json({ error: "Parol o'zgartirishda xatolik" });
  }
});

// Auth Middleware`;

serverContent = serverContent.replace(`// Auth Middleware`, newEndpoints);

fs.writeFileSync('D:\\EduSphere\\server\\index.ts', serverContent);


// --- 2. APP UPDATE ---
let appContent = fs.readFileSync('D:\\EduSphere\\src\\App.tsx', 'utf8');

// Add states
appContent = appContent.replace(
  `const [editBio, setEditBio] = useState("");`,
  `const [editBio, setEditBio] = useState("");\n  const [oldEmail, setOldEmail] = useState("");\n  const [otpCode, setOtpCode] = useState("");\n  const [newEmail, setNewEmail] = useState("");\n  const [otpSent, setOtpSent] = useState(false);\n  const [oldPassword, setOldPassword] = useState("");\n  const [newPassword, setNewPassword] = useState("");\n  const [confirmPassword, setConfirmPassword] = useState("");`
);

// Settings link
appContent = appContent.replace(
  `<div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
                    <Shield size={20} color="var(--primary-color)" /> <span style={{ fontWeight: 500 }}>Maxfiylik va Xavfsizlik</span>
                  </div>`,
  `<div onClick={() => { setActiveView('security'); setOtpSent(false); setOldEmail(""); setOtpCode(""); setNewEmail(""); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); }} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
                    <Shield size={20} color="var(--primary-color)" /> <span style={{ fontWeight: 500 }}>Maxfiylik va Xavfsizlik</span>
                  </div>`
);

// Security View
const securityView = `
            {activeView === 'security' && (
              <div style={{maxWidth: '600px'}}>
                <div style={{marginBottom: '20px'}}>
                   <button onClick={() => setActiveView('settings')} style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)'}}>
                      <ArrowLeft size={16} /> Orqaga
                   </button>
                </div>
                <h2 style={{marginBottom: '24px', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px'}}><Shield size={28} color="var(--primary-color)"/> Maxfiylik va Xavfsizlik</h2>
                
                <div className="card" style={{ marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Emailni o'zgartirish</h3>
                  
                  {!otpSent ? (
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Eski (Joriy) Emailingizni kiriting:</label>
                      <input type="email" value={oldEmail} onChange={e => setOldEmail(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', marginBottom: '16px'}} />
                      <button onClick={async () => {
                        if(!oldEmail) return showToast("Emailni kiriting", "error");
                        try {
                          const res = await fetch('http://localhost:5000/api/auth/send-otp', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                            body: JSON.stringify({ email: oldEmail })
                          });
                          const data = await res.json();
                          if (data.error) return showToast(data.error, "error");
                          setOtpSent(true);
                          showToast("Kod yuborildi! (Lokal test uchun backend konsolini tekshiring)", "success");
                        } catch(e) { showToast("Xatolik", "error"); }
                      }} style={{background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600}}>Kod yuborish</button>
                    </div>
                  ) : (
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Tasdiqlash kodi (OTP):</label>
                      <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="Misol uchun: 123456" style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', marginBottom: '16px'}} />
                      
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Yangi Email:</label>
                      <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', marginBottom: '16px'}} />
                      
                      <button onClick={async () => {
                        try {
                          const res = await fetch('http://localhost:5000/api/auth/change-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                            body: JSON.stringify({ oldEmail, otp: otpCode, newEmail })
                          });
                          const data = await res.json();
                          if (data.error) return showToast(data.error, "error");
                          setCurrentUser(data);
                          showToast("Email muvaffaqiyatli o'zgartirildi!", "success");
                          setOtpSent(false); setOldEmail(""); setOtpCode(""); setNewEmail("");
                        } catch(e) { showToast("Xatolik", "error"); }
                      }} style={{background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600}}>Yangi Emailni Saqlash</button>
                    </div>
                  )}
                </div>

                <div className="card">
                  <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Parolni o'zgartirish</h3>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Eski parol:</label>
                  <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', marginBottom: '16px'}} />
                  
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Yangi parol:</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', marginBottom: '16px'}} />
                  
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Yangi parolni takrorlang:</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', marginBottom: '16px'}} />
                  
                  <button onClick={async () => {
                    if (newPassword !== confirmPassword) return showToast("Yangi parollar bir xil emas!", "error");
                    try {
                      const res = await fetch('http://localhost:5000/api/auth/change-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                        body: JSON.stringify({ oldPassword, newPassword })
                      });
                      const data = await res.json();
                      if (data.error) return showToast(data.error, "error");
                      showToast("Parol muvaffaqiyatli o'zgartirildi!", "success");
                      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
                    } catch(e) { showToast("Xatolik", "error"); }
                  }} style={{background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, width: '100%'}}>Parolni Saqlash</button>
                </div>
              </div>
            )}`;

appContent = appContent.replace(
  `{activeView === 'edit-profile' && (`,
  securityView + `\n            {activeView === 'edit-profile' && (`
);

fs.writeFileSync('D:\\EduSphere\\src\\App.tsx', appContent);
console.log('Security view added');
