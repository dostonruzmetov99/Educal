const fs = require('fs');

// --- 1. SERVER UPDATE ---
let serverContent = fs.readFileSync('D:\\EduSphere\\server\\index.ts', 'utf8');

const oldServerLogic = `if (pointsToAdd > 0) {
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

const newServerLogic = `if (pointsToAdd > 0) {
       const founder = await prisma.user.findFirst({ where: { eduId: '1000001' } });
       if (founder) {
         await prisma.report.create({
           data: {
             reporterId: req.userId,
             reportedId: req.userId,
             reason: \`DIQQAT YANGI YUTUQ!\nFoydalanuvchi: \${user?.name} (\${user?.username})\nYutuq nomi: "\${lastTitle}"\nProfiliga kirib rasmini tekshiring va o'zingiz munosib ko'rgan Levelni qo'lda bering.\`
           }
         });
       }
    }`;

serverContent = serverContent.replace(oldServerLogic, newServerLogic);
fs.writeFileSync('D:\\EduSphere\\server\\index.ts', serverContent);


// --- 2. APP UPDATE ---
let appContent = fs.readFileSync('D:\\EduSphere\\src\\App.tsx', 'utf8');

const oldUI = `<div style={{display: 'flex', flexDirection: 'column', gap: '12px', flex: 1}}>
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

const newUI = `<input type="text" placeholder="Yutuq nomi (Masalan: IELTS 7.0)" value={newAchievement} onChange={(e) => setNewAchievement(e.target.value)} style={{flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none'}} />
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

appContent = appContent.replace(oldUI, newUI);
fs.writeFileSync('D:\\EduSphere\\src\\App.tsx', appContent);
