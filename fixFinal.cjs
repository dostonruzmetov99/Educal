const fs = require('fs');
let code = fs.readFileSync('D:/EduSphere/src/App.tsx', 'utf8');

// 1. Fix fetch users missing Auth
code = code.replace(
  "fetch(API_URL + '/api/users').then(r => r.json()).then(d => setUsers(d));",
  "fetch(API_URL + '/api/users', {headers:{'Authorization':'Bearer '+localStorage.getItem('token')}}).then(r => r.json()).then(d => { if(Array.isArray(d)) setUsers([...d, {id:999999, name:'Educal Bot', username:'@educal_bot', eduId:'1000000', level:'Bot', isVerified:true, avatar:'https://ui-avatars.com/api/?name=EB&background=4f46e5&color=fff', achievements:[]}]); });"
);

code = code.replace(
  ".then(() => fetch(API_URL + '/api/users'))",
  ".then(() => fetch(API_URL + '/api/users', {headers:{'Authorization':'Bearer '+localStorage.getItem('token')}}))"
);
code = code.replace(
  "if (Array.isArray(data)) setUsers(data);",
  "if (Array.isArray(data)) setUsers([...data, {id:999999, name:'Educal Bot', username:'@educal_bot', eduId:'1000000', level:'Bot', isVerified:true, avatar:'https://ui-avatars.com/api/?name=EB&background=4f46e5&color=fff', achievements:[]}]);"
);

// 2. Fix top reyting to hide bot and asoschi
code = code.replace(
  "const levelA = a.level === 'Asoschi' ? 1000 : parseInt(a.level || '1');",
  "if(a.level==='Bot') return 1; if(b.level==='Bot') return -1; const levelA = a.level === 'Asoschi' ? 1000 : parseInt(a.level || '1');"
);

// 3. Fix ImgBB direct upload
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
      showToast("Rasm ImgBB ga yuklanmoqda...", "info");
      const res = await fetch('https://api.imgbb.com/1/upload?key=962cc8f3a7ba9c7da61a45c33fd98efa', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if(data.success) {
         return data.data.url;
      }
      return null;
    } catch(e) {
      showToast("Yuklashda xatolik", "error");
      return null;
    }
  };`;
code = code.replace(oldUpload, newUpload);

// 4. Remove Educal Yaratuvchisi from edit achievements mapping
// Instead of complex parsing, just filter it out before mapping.
code = code.replace(
  "{editAchievements.map((ach: any, idx: number) => (",
  "{editAchievements.filter((a:any)=>a.title!=='Educal Yaratuvchisi').map((ach: any, idx: number) => ("
);

// 5. Hide Akkauntni O'chirish for self
code = code.replace(
  /<button onClick=\{\(\) => setConfirmDialog\(\{msg: "Haqiqatan ham akkauntni o\\'chirmoqchimisiz\?", onConfirm: handleDeleteAccount\}\)\} style=\{\{ marginTop: '24px', width: '100%', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' \}\}>\s*<Trash2 size=\{16\} \/> Akkountni O'chirish\s*<\/button>/g,
  `{currentUser?.id !== selectedUser.id && (<button onClick={() => setConfirmDialog({msg: "Haqiqatan ham akkauntni o\\'chirmoqchimisiz?", onConfirm: handleDeleteAccount})} style={{ marginTop: '24px', width: '100%', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Trash2 size={16} /> Akkountni O'chirish
                  </button>)}`
);

code = code.replace(
  /<button onClick=\{\(\) => setConfirmDialog\(\{msg: "Foydalanuvchini o\\'chirmoqchimisiz\?", onConfirm: \(\) => handleDeleteAccount\(\)\}\)\} style=\{\{ width: '100%', background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' \}\}>\s*<Trash2 size=\{16\} \/> O'chirish\s*<\/button>/g,
  `{currentUser?.id !== selectedUser.id && (<button onClick={() => setConfirmDialog({msg: "Foydalanuvchini o\\'chirmoqchimisiz?", onConfirm: () => handleDeleteAccount()})} style={{ width: '100%', background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Trash2 size={16} /> O'chirish
                    </button>)}`
);


// 6. Fix Global, Davlat, Viloyat hardcodes
code = code.replace(/>Global<\/div>\n\s*<div[^>]*>{selectedUser.level === 'Asoschi' \? 1 : Math.max\(1, 1000 - parseInt\(selectedUser.level\|\|'1'\) \* 5\)}<\/div>/g, ">Tizimda O'rni</div>\n                      <div className=\"rank-value\">{selectedUser.level === 'Asoschi' ? 1 : (users.filter(u=>u.level!=='Bot').sort((a,b)=>parseInt(b.level||'1')-parseInt(a.level||'1')).findIndex(u=>u.id===selectedUser.id)+1) || '-'}</div>");
code = code.replace(/>\s*Davlat<\/div>\n\s*<div[^>]*>{selectedUser.level === 'Asoschi' \? 1 : Math.max\(1, 500 - parseInt\(selectedUser.level\|\|'1'\) \* 2\)}<\/div>/g, ">O'quvchilari</div>\n                      <div className=\"rank-value\">{selectedUser.followedBy?.length || 0}</div>");
code = code.replace(/>\s*Viloyat<\/div>\n\s*<div[^>]*>{selectedUser.level === 'Asoschi' \? 1 : Math.max\(1, 100 - parseInt\(selectedUser.level\|\|'1'\)\)}<\/div>/g, ">Yutuqlari</div>\n                      <div className=\"rank-value\">{selectedUser.achievements?.filter((a:any)=>a.title!=='Educal Yaratuvchisi').length || 0}</div>");

fs.writeFileSync('D:/EduSphere/src/App.tsx', code);
console.log('App.tsx final fixes applied.');
