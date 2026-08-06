const fs = require('fs');
let code = fs.readFileSync('D:/EduSphere/src/App.tsx', 'utf8');

// 1. Add openCommentMenuId state right after activeView
code = code.replace(
  "const [activeView, setActiveView] = useState('dashboard');",
  "const [activeView, setActiveView] = useState('dashboard');\n  const [openCommentMenuId, setOpenCommentMenuId] = useState<number | null>(null);"
);

// 2. Remove isAppLoading delay and fix initial load
const oldInitialState = `const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [openCommentMenuId, setOpenCommentMenuId] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);`;

const newInitialState = `const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [openCommentMenuId, setOpenCommentMenuId] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch(e) { return null; } });`;

code = code.replace(oldInitialState, newInitialState);
code = code.replace(`if (isAppLoading) return <div style={{display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-main)'}}><h3>Yuklanmoqda...</h3></div>;`, '');

code = code.replace(`.finally(() => setIsAppLoading(false));\n    } else {\n      setIsAppLoading(false);\n    }`, `.catch(e => console.error(e));\n    }`);

// 3. Rewrite Comment Mapping
const oldCommentMap = `{(posts.find(p => p.id === commentsModalPostId)?.comments || []).map((c: any) => (
                    <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
                      <img 
                        src={c.user?.avatar || \`https://ui-avatars.com/api/?name=\${c.user?.name}&background=random\`} 
                        style={{ width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover' }} 
                        onClick={() => { handleProfileView(c.user); setCommentsModalPostId(null); }}
                      />
                      <div>
                        <strong 
                          style={{ cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => { handleProfileView(c.user); setCommentsModalPostId(null); }}
                        >
                          {c.user?.name} {c.user?.isVerified && <VerifiedBadge size={14} />}
                        </strong>
                        <div style={{ fontSize: '13px', marginTop: '2px' }}>{c.text}</div>
                      </div>
                    </div>
                  ))}`;

const newCommentMap = `{(posts.find(p => p.id === commentsModalPostId)?.comments || []).map((c: any) => {
                    const post = posts.find(p => p.id === commentsModalPostId);
                    const isCommentOwner = c.userId === currentUser?.id;
                    const isPostOwner = post?.userId === currentUser?.id;
                    const isFounder = currentUser?.eduId === '1000001';
                    const canDelete = isCommentOwner || isPostOwner || isFounder;
                    return (
                    <div key={c.id} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                      <img 
                        src={c.user?.avatar || \`https://ui-avatars.com/api/?name=\${c.user?.name}&background=random\`} 
                        style={{ width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover' }} 
                        onClick={() => { handleProfileView(c.user); setCommentsModalPostId(null); }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong 
                            style={{ cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => { handleProfileView(c.user); setCommentsModalPostId(null); }}
                          >
                            {c.user?.name} {c.user?.isVerified && <VerifiedBadge size={14} />}
                          </strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                        </div>
                        <div style={{ fontSize: '13px', marginTop: '2px' }}>{c.text}</div>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <MoreHorizontal size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setOpenCommentMenuId(openCommentMenuId === c.id ? null : c.id)} />
                        {openCommentMenuId === c.id && (
                          <div style={{ position: 'absolute', right: 0, top: '20px', background: 'white', border: '1px solid var(--border-light)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10, width: '130px' }}>
                            <div 
                              onClick={() => { 
                                navigator.clipboard.writeText(c.text); 
                                showToast("Matn nusxalandi!", "success"); 
                                setOpenCommentMenuId(null); 
                              }}
                              style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '12px', borderBottom: canDelete ? '1px solid var(--border-light)' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                              <Copy size={14} /> Nusxalash
                            </div>
                            {canDelete && (
                              <div 
                                onClick={async () => {
                                  try {
                                    await fetch(\`\${API_URL}/api/posts/\${commentsModalPostId}/comments/\${c.id}\`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
                                    setPosts(posts.map(p => p.id === commentsModalPostId ? { ...p, comments: (p.comments||[]).filter((cm:any) => cm.id !== c.id) } : p));
                                    setOpenCommentMenuId(null);
                                  } catch (e) { showToast("Xatolik", "error"); }
                                }}
                                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}
                              >
                                <Trash2 size={14} /> O'chirish
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) })}`;

code = code.replace(oldCommentMap, newCommentMap);

fs.writeFileSync('D:/EduSphere/src/App.tsx', code);
console.log('App patched!');
