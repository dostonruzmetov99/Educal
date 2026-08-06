const fs = require('fs');
let code = fs.readFileSync('D:/EduSphere/src/App.tsx', 'utf8');

// Filter Educal Yaratuvchisi
code = code.replace(
  'setEditAchievements(currentUser.achievements || []);',
  'setEditAchievements(currentUser.achievements?.filter((a:any) => a.title !== "Educal Yaratuvchisi") || []);'
);

// Add loading state
code = code.replace(
  'const [isLoginMode, setIsLoginMode] = useState(true);',
  'const [isLoginMode, setIsLoginMode] = useState(true);\n  const [isSaving, setIsSaving] = useState(false);'
);

code = code.replace(
  'const res = await fetch(API_URL + \'/api/users/profile\', {',
  'setIsSaving(true);\n      const res = await fetch(API_URL + \'/api/users/profile\', {'
);

code = code.replace(
  'showToast("Xatolik", "error");\n    }\n  };',
  'showToast("Xatolik", "error");\n    } finally { setIsSaving(false); }\n  };'
);

code = code.replace(
  '<button onClick={handleSaveProfile} style={{background: \'var(--primary-color)\', color: \'white\', padding: \'12px 24px\', borderRadius: \'8px\', border: \'none\', cursor: \'pointer\', fontWeight: 600, width: \'100%\'}}>',
  '<button onClick={handleSaveProfile} disabled={isSaving} style={{background: isSaving ? \'var(--text-muted)\' : \'var(--primary-color)\', color: \'white\', padding: \'12px 24px\', borderRadius: \'8px\', border: \'none\', cursor: isSaving ? \'not-allowed\' : \'pointer\', fontWeight: 600, width: \'100%\'}}>'
);

code = code.replace(
  'Saqlash\n</button>',
  '{isSaving ? "Saqlanmoqda..." : "Saqlash"}\n</button>'
);

fs.writeFileSync('D:/EduSphere/src/App.tsx', code);
console.log('Fixed profile save loading state and achievements.');
