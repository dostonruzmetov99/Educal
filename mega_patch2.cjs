const fs = require('fs');
let code = fs.readFileSync('D:/EduSphere/src/App.tsx', 'utf8');

// 1. Post Options (3 dots) in the feed
const feedPostHeader = `<div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>`;
const feedPostHeaderReplace = `<div style={{ display: 'flex', gap: '12px', marginBottom: '16px', position: 'relative' }}>
                          <button onClick={() => setPostMenuId(postMenuId === post.id ? null : post.id)} style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><MoreHorizontal size={20} /></button>
                          {postMenuId === post.id && (
                            <div style={{ position: 'absolute', top: '24px', right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '8px', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <button onClick={() => { navigator.clipboard.writeText(post.content); showToast("Nusxalandi", "success"); setPostMenuId(null); }} style={{ background: 'none', border: 'none', textAlign: 'left', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Copy size={14}/> Nusxalash</button>
                              {(currentUser?.id === post.userId || currentUser?.eduId === '1000001') && (
                                <button onClick={() => { fetch(API_URL + '/api/posts/' + post.id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } }).then(() => { setPosts(posts.filter(p => p.id !== post.id)); setPostMenuId(null); showToast("O'chirildi", "success"); }); }} style={{ background: 'none', border: 'none', textAlign: 'left', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}><Trash2 size={14}/> O'chirish</button>
                              )}
                            </div>
                          )}`;

code = code.replace(feedPostHeader, feedPostHeaderReplace);

// 2. Add postMenuId state
code = code.replace(
  'const [commentsModalPostId, setCommentsModalPostId] = useState<number | null>(null);',
  'const [commentsModalPostId, setCommentsModalPostId] = useState<number | null>(null);\n  const [postMenuId, setPostMenuId] = useState<number | null>(null);'
);

// 3. Remove Yutuqlari from rank boxes completely if they requested "yutuqlari degan ham keremas"
const yutuqlariBox = `<div className="rank-box">
                      <MapPin size={16} color="var(--text-muted)" />
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Yutuqlari</div>
                      <div className="rank-value">{selectedUser.achievements?.filter((a:any)=>a.title!=='Educal Yaratuvchisi').length || 0}</div>
                    </div>`;
code = code.replace(yutuqlariBox, '');

// 4. Followers/Following Clickable List Modal
code = code.replace(
  'const [commentsModalPostId, setCommentsModalPostId] = useState<number | null>(null);',
  'const [commentsModalPostId, setCommentsModalPostId] = useState<number | null>(null);\n  const [followersModal, setFollowersModal] = useState<{type: "followers" | "following", userId: number} | null>(null);'
);

const profileFollowersDiv = `<div style={{ display: 'flex', gap: '24px', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '18px' }}>{selectedUser.followedBy?.length || 0}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 500 }}>Obunachilar</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '18px' }}>{selectedUser.followingRel?.length || 0}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 500 }}>Obunalar</span>
                    </div>
                  </div>`;

const newProfileFollowersDiv = `<div style={{ display: 'flex', gap: '24px', fontWeight: 600, marginBottom: '16px' }}>
                    <div onClick={() => setFollowersModal({type: 'followers', userId: selectedUser.id})} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '18px' }}>{selectedUser.followedBy?.length || 0}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 500 }}>Obunachilar</span>
                    </div>
                    <div onClick={() => setFollowersModal({type: 'following', userId: selectedUser.id})} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '18px' }}>{selectedUser.followingRel?.length || 0}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 500 }}>Obunalar</span>
                    </div>
                  </div>
                  {currentUser?.id !== selectedUser.id && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={async () => {
                          await fetch(API_URL + '/api/users/' + selectedUser.id + '/follow', { method: 'POST', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
                          showToast("Obuna bo'ldingiz", "success");
                        }} style={{ padding: '8px 16px', background: 'var(--primary-color)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', flex: 1 }}>Kuzatish</button>
                      <button onClick={() => alert("Chat tizimi V2 da qo'shiladi!")} style={{ padding: '8px 16px', background: 'var(--bg-main)', color: 'var(--text-main)', borderRadius: '8px', border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer', flex: 1 }}>Xabar yuborish</button>
                    </div>
                  )}`;
                  
code = code.replace(profileFollowersDiv, newProfileFollowersDiv);

// 5. Remove the duplicate bot buttons from previous patch
const botButtons = `{selectedUser.level === 'Bot' && currentUser?.id !== selectedUser.id && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                      <button onClick={async () => {
                          await fetch(API_URL + '/api/users/' + selectedUser.id + '/follow', { method: 'POST', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
                          showToast("Obuna bo'ldingiz", "success");
                        }} style={{ padding: '8px 16px', background: 'var(--primary-color)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Kuzatish</button>
                      <button onClick={() => alert("Chat tizimi V2 da qo'shiladi!")} style={{ padding: '8px 16px', background: 'var(--bg-main)', color: 'var(--text-main)', borderRadius: '8px', border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer' }}>Xabar yuborish</button>
                    </div>
                  )}`;
code = code.replace(botButtons, '');

// 6. Followers Modal UI
const followersModalUI = `
{followersModal && (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setFollowersModal(null)}>
    <div style={{ background: 'var(--bg-card)', width: '350px', maxHeight: '70vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontWeight: 600 }}>{followersModal.type === 'followers' ? 'Obunachilar' : 'Obunalar'}</h3>
        <button onClick={() => setFollowersModal(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {users.filter(u => followersModal.type === 'followers' ? u.followingRel?.some((f:any)=>f.followingId === followersModal.userId) : u.followedBy?.some((f:any)=>f.followerId === followersModal.userId)).map(u => (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => { handleProfileView(u); setFollowersModal(null); }}>
            <img src={u.avatar || \`https://ui-avatars.com/api/?name=\${u.name}&background=random\`} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <div style={{ fontWeight: 600 }}>{u.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{u.username}</div>
            </div>
          </div>
        ))}
        {users.filter(u => followersModal.type === 'followers' ? u.followingRel?.some((f:any)=>f.followingId === followersModal.userId) : u.followedBy?.some((f:any)=>f.followerId === followersModal.userId)).length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Hech kim yo'q</p>
        )}
      </div>
    </div>
  </div>
)}
`;

code = code.replace('{commentsModalPostId && (', followersModalUI + '\n{commentsModalPostId && (');

fs.writeFileSync('D:/EduSphere/src/App.tsx', code);
console.log('App.tsx features patched.');
