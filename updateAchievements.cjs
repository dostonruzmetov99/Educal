const fs = require('fs');

// --- 1. SERVER UPDATE ---
let serverContent = fs.readFileSync('D:\\EduSphere\\server\\index.ts', 'utf8');

const oldAchievementsCode = `    // Agar yangi yutuq qo'shilgan bo'lsa
    if (achievements.length > oldAchievements.length) {
       const diff = achievements.length - oldAchievements.length;
       newLevel = currentLevel + diff;
       
       // Asoschiga bildirishnoma (Report) yuboramiz
       const founder = await prisma.user.findFirst({ where: { eduId: '1000001' } });
       if (founder) {
         await prisma.report.create({
           data: {
             reporterId: req.userId,
             reportedId: req.userId, // O'zining profilida yuz berdi
             reason: \`YANGI YUTUQ YUKLANDI: "\${achievements[achievements.length-1].title}". Tizim avtomatik \${diff} level qo'shdi. Profiliga kirib tekshiring va kerak bo'lsa levelini tahrirlang!\`
           }
         });
       }
    }`;

const newAchievementsCode = `    // Yangi yutuqlarni tekshiramiz (Spam himoyasi)
    const oldImages = new Set(oldAchievements.map((a: any) => a.image));
    const seenImages = new Set();
    let pointsToAdd = 0;
    let newValidAchievements: any[] = [];
    let maxPointAdded = 0;
    let lastTitle = "";

    for (const ach of achievements) {
      if (!seenImages.has(ach.image)) {
        seenImages.add(ach.image);
        newValidAchievements.push(ach);
        
        // Agar haqiqatda yangi rasm bo'lsa (eski bazada yo'q bo'lsa)
        if (!oldImages.has(ach.image)) {
           const val = parseInt(ach.levelValue || ach.value) || 1;
           pointsToAdd += val;
           if (val > maxPointAdded) {
             maxPointAdded = val;
             lastTitle = ach.title;
           }
        }
      }
    }
    
    if (pointsToAdd > 0) {
       newLevel = currentLevel + pointsToAdd;
       
       const founder = await prisma.user.findFirst({ where: { eduId: '1000001' } });
       if (founder) {
         await prisma.report.create({
           data: {
             reporterId: req.userId,
             reportedId: req.userId,
             reason: \`YANGI YUTUQ YUKLANDI: "\${lastTitle}". Tizim avtomatik +\${pointsToAdd} level qo'shdi. Profiliga kirib tekshiring!\`
           }
         });
       }
    }`;

serverContent = serverContent.replace(oldAchievementsCode, newAchievementsCode);

const oldCreate = `achievements: {
          create: achievements.map((a: any) => ({ title: a.title, image: a.image }))
        }`;
const newCreate = `achievements: {
          create: newValidAchievements.map((a: any) => ({ title: a.title, image: a.image, levelValue: parseInt(a.levelValue || a.value) || 1 }))
        }`;

serverContent = serverContent.replace(oldCreate, newCreate);

fs.writeFileSync('D:\\EduSphere\\server\\index.ts', serverContent);


// --- 2. APP UPDATE ---
let appContent = fs.readFileSync('D:\\EduSphere\\src\\App.tsx', 'utf8');

// Add state
appContent = appContent.replace(
  `const [newAchievementImage, setNewAchievementImage] = useState("");`,
  `const [newAchievementImage, setNewAchievementImage] = useState("");\n  const [newAchievementValue, setNewAchievementValue] = useState(1);`
);

// Update UI
const oldAchUI = `<input type="text" placeholder="Yutuq nomi (Masalan: IELTS 7.0)" value={newAchievement} onChange={(e) => setNewAchievement(e.target.value)} style={{flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none'}} />
                      <button onClick={() => document.getElementById('achImageUpload')?.click()} style={{background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <Camera size={18} /> Rasm
                      </button>
                      <input type="file" accept="image/*" id="achImageUpload" style={{display: 'none'}} onChange={handleAchievementImageUpload} />
                      <button onClick={() => {
                        if(newAchievement && newAchievementImage) {
                          setEditAchievements([...editAchievements, {title: newAchievement, image: newAchievementImage}]);
                          setNewAchievement(""); setNewAchievementImage("");
                        }
                      }} style={{background: 'var(--primary-color)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600}}>Qo'shish</button>`;

const newAchUI = `<div style={{display: 'flex', flexDirection: 'column', gap: '12px', flex: 1}}>
                        <input type="text" placeholder="Yutuq nomi (Masalan: IELTS 7.0)" value={newAchievement} onChange={(e) => setNewAchievement(e.target.value)} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none'}} />
                        <select value={newAchievementValue} onChange={e => setNewAchievementValue(Number(e.target.value))} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none'}}>
                          <option value={1}>Kichik yutuq (Maktab/Tuman) - +1 Level</option>
                          <option value={3}>O'rtacha yutuq (Viloyat) - +3 Level</option>
                          <option value={5}>Katta yutuq (Respublika) - +5 Level</option>
                          <option value={10}>Xalqaro (IELTS, SAT, Olimpiada) - +10 Level</option>
                        </select>
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                        <button onClick={() => document.getElementById('achImageUpload')?.click()} style={{background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                          <Camera size={18} /> Rasm
                        </button>
                        <input type="file" accept="image/*" id="achImageUpload" style={{display: 'none'}} onChange={handleAchievementImageUpload} />
                        <button onClick={() => {
                          if(newAchievement && newAchievementImage) {
                            setEditAchievements([...editAchievements, {title: newAchievement, image: newAchievementImage, value: newAchievementValue}]);
                            setNewAchievement(""); setNewAchievementImage(""); setNewAchievementValue(1);
                          }
                        }} style={{background: 'var(--primary-color)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600}}>Qo'shish</button>
                      </div>`;

appContent = appContent.replace(oldAchUI, newAchUI);

fs.writeFileSync('D:\\EduSphere\\src\\App.tsx', appContent);
console.log('Done achievements update');
