const fs = require('fs');
let code = fs.readFileSync('D:/EduSphere/src/App.tsx', 'utf8');

// 1. Direct ImgBB Upload
const oldUpload = `const handleFileUpload = async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(API_URL + '/api/upload', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        body: formData
      });
      const data = await res.json();
      return data.url;
    } catch(e) {
      showToast("Fayl yuklashda xatolik", "error");
      return null;
    }
  };`;
const newUpload = `const handleFileUpload = async (file: any) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      showToast("Rasm yuklanmoqda...", "info");
      const res = await fetch('https://api.imgbb.com/1/upload?key=962cc8f3a7ba9c7da61a45c33fd98efa', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if(data.success) {
         showToast("Yuklandi", "success");
         return data.data.url;
      }
      return null;
    } catch(e) {
      showToast("Fayl yuklashda xatolik", "error");
      return null;
    }
  };`;
code = code.replace(oldUpload, newUpload);

// 2. Fix Top Reyting Logic
// If there's something like `.filter(u => ...)` in Reyting view
// Let's replace the whole Reyting mapping if we can find it.
// We'll search for 'Dunyo bo\\'yicha eng yaxshi' or similar

// 3. Fix Akkauntni O'chirish (hide for current user)
const oldDeleteBtn = `<button onClick={() => setConfirmDialog({msg: "Haqiqatan ham akkauntni o\\'chirmoqchimisiz?", onConfirm: handleDeleteAccount})} style={{ marginTop: '24px', width: '100%', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Trash2 size={16} /> Akkountni O'chirish
                  </button>`;
const newDeleteBtn = `{currentUser?.id !== selectedUser.id && (<button onClick={() => setConfirmDialog({msg: "Haqiqatan ham akkauntni o\\'chirmoqchimisiz?", onConfirm: handleDeleteAccount})} style={{ marginTop: '24px', width: '100%', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Trash2 size={16} /> Akkountni O'chirish
                  </button>)}`;
code = code.replace(oldDeleteBtn, newDeleteBtn);

const oldDeleteBtn2 = `<button onClick={() => setConfirmDialog({msg: "Foydalanuvchini o\\'chirmoqchimisiz?", onConfirm: () => handleDeleteAccount()})} style={{ width: '100%', background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Trash2 size={16} /> O'chirish
                    </button>`;
const newDeleteBtn2 = `{currentUser?.id !== selectedUser.id && (<button onClick={() => setConfirmDialog({msg: "Foydalanuvchini o\\'chirmoqchimisiz?", onConfirm: () => handleDeleteAccount()})} style={{ width: '100%', background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Trash2 size={16} /> O'chirish
                    </button>)}`;
code = code.replace(oldDeleteBtn2, newDeleteBtn2);


// 4. Fix GLOBAL DAVLAT VILOYAT
code = code.replace(/>GLOBAL<\/span>\n\s*<h3[^>]*>990<\/h3>/g, '>Foydalanuvchilar</span>\n                          <h3 style={{ fontSize: \\'20px\\', color: \\'var(--primary-color)\\' }}>{users.length}</h3>');
code = code.replace(/>DAVLAT<\/span>\n\s*<h3[^>]*>496<\/h3>/g, '>Postlar</span>\n                          <h3 style={{ fontSize: \\'20px\\', color: \\'var(--primary-color)\\' }}>{posts.length}</h3>');
code = code.replace(/>VILOYAT<\/span>\n\s*<h3[^>]*>98<\/h3>/g, ">Baho (Reyting)</span>\n                          <h3 style={{ fontSize: '20px', color: 'var(--primary-color)' }}>{selectedUser.level}</h3>");

fs.writeFileSync('D:/EduSphere/src/App.tsx', code);
console.log('App.tsx partial fixes applied.');
