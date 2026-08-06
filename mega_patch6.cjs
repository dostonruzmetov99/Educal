const fs = require('fs');
let code = fs.readFileSync('D:/EduSphere/src/App.tsx', 'utf8');

// 1. Remove duplicate isSaving
code = code.replace('const [isSaving, setIsSaving] = useState(false);\n  const handleSaveProfile = async () => {\n    try {\n      setIsSaving(true);\n      setIsSaving(true);', 'const handleSaveProfile = async () => {\n    try {\n      setIsSaving(true);');
code = code.replace('const [isSaving, setIsSaving] = useState(false);\n  const handleSaveProfile', 'const handleSaveProfile');
code = code.replace('const [isSaving, setIsSaving] = useState(false);', '');
code = code.replace('const [isLoginMode, setIsLoginMode] = useState(true);', 'const [isLoginMode, setIsLoginMode] = useState(true);\n  const [isSaving, setIsSaving] = useState(false);');

// 2. Remove postMenuId unused state
code = code.replace('const [postMenuId, setPostMenuId] = useState<number | null>(null);', '');

// 3. Fix Post Menu (Copy text instead of link, allow founder to delete)
const oldPostMenu = `<div 
                                  onClick={() => { 
                                    navigator.clipboard.writeText(\`http://localhost:5173/post/\${post.id}\`); 
                                    showToast("Post havolasi nusxalandi!", "success"); 
                                    setOpenPostMenuId(null); 
                                  }}
                                  style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                  <Copy size={16} /> Nusxa olish
                                </div>
                                {post.userId === (currentUser?.id || 1) && (
                                  <div 
                                    onClick={async () => {
                                      setConfirmDialog({
                                        msg: "Rostan ham bu postni o'chirib tashlamoqchimisiz?",
                                        onConfirm: async () => {
                                          try {
                                            await fetch(\`\${API_URL}/api/posts/\${post.id}\`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
                                            setPosts(posts.filter(p => p.id !== post.id));
                                          } catch (e) { showToast("Xatolik", "error"); }
                                        }
                                      });
                                    }}
                                    style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}
                                  >
                                    <Trash2 size={16} /> O'chirish
                                  </div>
                                )}`;

const newPostMenu = `<div 
                                  onClick={() => { 
                                    navigator.clipboard.writeText(post.content); 
                                    showToast("Matn nusxalandi!", "success"); 
                                    setOpenPostMenuId(null); 
                                  }}
                                  style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                  <Copy size={16} /> Nusxa olish
                                </div>
                                {(post.userId === currentUser?.id || currentUser?.eduId === '1000001') && (
                                  <div 
                                    onClick={async () => {
                                      setConfirmDialog({
                                        msg: "Rostan ham bu postni o'chirib tashlamoqchimisiz?",
                                        onConfirm: async () => {
                                          try {
                                            await fetch(\`\${API_URL}/api/posts/\${post.id}\`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
                                            setPosts(posts.filter(p => p.id !== post.id));
                                          } catch (e) { showToast("Xatolik", "error"); }
                                        }
                                      });
                                    }}
                                    style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}
                                  >
                                    <Trash2 size={16} /> O'chirish
                                  </div>
                                )}`;

code = code.replace(oldPostMenu, newPostMenu);

fs.writeFileSync('D:/EduSphere/src/App.tsx', code);
console.log('Post menu and duplicate states patched.');
