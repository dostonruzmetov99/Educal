const fs = require('fs');

let content = fs.readFileSync('D:\\EduSphere\\src\\App.tsx', 'utf8');

content = content.replace(
  `const [editName, setEditName] = useState("Dostonbek Ruzmatov");`,
  `const [editName, setEditName] = useState("Dostonbek Ruzmatov");\n  const [editBio, setEditBio] = useState("");`
);

content = content.replace(
  `          setCurrentUser(data.user);
          if (data.user.followingRel) {`,
  `          setCurrentUser(data.user);
          setEditBio(data.user.bio || "");
          if (data.user.followingRel) {`
);

content = content.replace(
  `body: JSON.stringify({ name: editName, username: editUsername, avatar: editAvatar, achievements: editAchievements })`,
  `body: JSON.stringify({ name: editName, username: editUsername, avatar: editAvatar, achievements: editAchievements, bio: editBio })`
);

content = content.replace(
  `const updatedUsers = users.map(u => u.id === currentUser?.id ? { ...u, name: editName, username: editUsername, avatar: editAvatar, achievements: editAchievements } : u);`,
  `const updatedUsers = users.map(u => u.id === currentUser?.id ? { ...u, name: editName, username: editUsername, avatar: editAvatar, achievements: editAchievements, bio: editBio } : u);`
);

content = content.replace(
  `<input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', fontSize: '15px'}} />
                  </div>
                  <div style={{marginBottom: '24px'}}>`,
  `<input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', fontSize: '15px'}} />
                  </div>
                  <div style={{marginBottom: '16px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Bio (O'zingiz haqingizda)</label>
                    <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="O'zingiz haqingizda qisqacha ma'lumot yozing (emojilar mumkin 🚀)..." style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', fontSize: '15px', minHeight: '80px', fontFamily: 'inherit'}} />
                  </div>
                  <div style={{marginBottom: '24px'}}>`
);

content = content.replace(
  `                      <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
                        {selectedUser.username} <span style={{ marginLeft: '12px', padding: '2px 8px', background: '#f3f4f6', borderRadius: '12px', fontSize: '14px', border: '1px solid var(--border-light)' }}>ID: {selectedUser.eduId || \`900\${selectedUser.id}\`}</span>
                      </p>
                      <span className="badge">{getLevelDisplay(selectedUser)}</span>`,
  `                      <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
                        {selectedUser.username} <span style={{ marginLeft: '12px', padding: '2px 8px', background: '#f3f4f6', borderRadius: '12px', fontSize: '14px', border: '1px solid var(--border-light)' }}>ID: {selectedUser.eduId || \`900\${selectedUser.id}\`}</span>
                      </p>
                      {selectedUser.bio && <p style={{ color: 'var(--text-main)', fontSize: '15px', marginTop: '8px', marginBottom: '12px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{selectedUser.bio}</p>}
                      <span className="badge">{getLevelDisplay(selectedUser)}</span>`
);

// We should also set the bio into editBio when editing profile. Wait, we already do it in useEffect.
// What if we open edit profile without reloading?
content = content.replace(
  `onClick={() => setActiveView('edit-profile')}`,
  `onClick={() => { setActiveView('edit-profile'); setEditBio(currentUser?.bio || ""); }}`
);
content = content.replace(
  `onClick={() => setActiveView('edit-profile')}`,
  `onClick={() => { setActiveView('edit-profile'); setEditBio(currentUser?.bio || ""); }}`
);

fs.writeFileSync('D:\\EduSphere\\src\\App.tsx', content);
console.log('App.tsx updated for bio');
