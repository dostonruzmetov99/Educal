const fs = require('fs');
let appContent = fs.readFileSync('D:\\EduSphere\\src\\App.tsx', 'utf8');

// 1. Add Navigation Item
const oldNav = `<div
            className={\`nav-item \${activeView === 'students' ? 'active' : ''}\`}
            onClick={() => setActiveView('students')}
          >
            <Users size={20} />
            <span>O'quvchilar</span>
          </div>`;
const newNav = `${oldNav}
          <div
            className={\`nav-item \${activeView === 'ranking' ? 'active' : ''}\`}
            onClick={() => setActiveView('ranking')}
          >
            <Trophy size={20} />
            <span>Top Reyting</span>
          </div>`;
appContent = appContent.replace(oldNav, newNav);

// 2. Add Ranking View
const rankingView = `
            {activeView === 'ranking' && (
              <div>
                <h2 style={{ marginBottom: '24px', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={28} color="#f59e0b" /> Dunyoviy Top Reyting</h2>
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                  {[...users].sort((a, b) => {
                    const levelA = a.level === 'Asoschi' ? 1000 : parseInt(a.level || '1');
                    const levelB = b.level === 'Asoschi' ? 1000 : parseInt(b.level || '1');
                    if (levelB !== levelA) return levelB - levelA;
                    return (b.followedBy?.length || 0) - (a.followedBy?.length || 0);
                  }).map((user: any, index: number) => (
                    <div 
                      key={user.id} 
                      onClick={() => handleProfileView(user)} 
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', 
                        borderBottom: '1px solid var(--border-light)', cursor: 'pointer',
                        background: index === 0 ? '#fffbeb' : index === 1 ? '#f3f4f6' : index === 2 ? '#fff7ed' : 'transparent'
                      }}
                    >
                      <div style={{ fontSize: '20px', fontWeight: 700, color: index === 0 ? '#f59e0b' : index === 1 ? '#9ca3af' : index === 2 ? '#d97706' : 'var(--text-muted)', width: '30px', textAlign: 'center' }}>
                        #{index + 1}
                      </div>
                      <img src={user.avatar || \`https://i.pravatar.cc/150?u=\${user.id}\`} alt="Avatar" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%', border: index < 3 ? \`2px solid \${index === 0 ? '#f59e0b' : index === 1 ? '#9ca3af' : '#d97706'}\` : 'none' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '16px', margin: '0 0 4px 0' }}>
                          {user.name} {user.isVerified && <VerifiedBadge size={16} />}
                        </h4>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user.username}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="badge" style={{ marginBottom: '4px', display: 'inline-block' }}>{getLevelDisplay(user)}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {user.eduId || \`900\${user.id}\`}</div>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Hali foydalanuvchilar yo'q</div>}
                </div>
              </div>
            )}`;

appContent = appContent.replace(
  `{activeView === 'students' && (`,
  rankingView + `\n            {activeView === 'students' && (`
);

fs.writeFileSync('D:\\EduSphere\\src\\App.tsx', appContent);
console.log('Top Ranking added');
