const fs = require('fs');
let code = fs.readFileSync('D:/EduSphere/src/App.tsx', 'utf8');

// 1. Fix GET /api/posts Auth Header
code = code.replace(
  "fetch(API_URL + '/api/posts')",
  "fetch(API_URL + '/api/posts', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } })"
);

// 2. Hide Viloyat entirely and restrict Global/Davlat to ONLY Asoschi OR self
// In Profile View:
const profileStatsTarget = `<div className="rank-boxes" style={{ marginTop: '32px', maxWidth: '500px' }}>
                    <div className="rank-box">
                      <Globe size={16} color="var(--text-muted)" />
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tizimda O'rni</div>
                      <div className="rank-value">{selectedUser.level === 'Asoschi' ? 1 : (users.filter(u=>u.level!=='Bot').sort((a,b)=>parseInt(b.level||'1')-parseInt(a.level||'1')).findIndex(u=>u.id===selectedUser.id)+1) || '-'}</div>
                    </div>
                    <div className="rank-box">
                      <Flag size={16} color="var(--text-muted)" />
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>O'quvchilari</div>
                      <div className="rank-value">{selectedUser.followedBy?.length || 0}</div>
                    </div>
                    <div className="rank-box">
                      <MapPin size={16} color="var(--text-muted)" />
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Yutuqlari</div>
                      <div className="rank-value">{selectedUser.achievements?.filter((a:any)=>a.title!=='Educal Yaratuvchisi').length || 0}</div>
                    </div>
                  </div>`;

const profileStatsReplacement = `{(currentUser?.id === selectedUser.id || currentUser?.eduId === '1000001') && (
<div className="rank-boxes" style={{ marginTop: '32px', maxWidth: '500px' }}>
                    <div className="rank-box">
                      <Globe size={16} color="var(--text-muted)" />
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tizimda O'rni</div>
                      <div className="rank-value">{selectedUser.level === 'Asoschi' ? 1 : (users.filter(u=>u.level!=='Bot').sort((a,b)=>parseInt(b.level||'1')-parseInt(a.level||'1')).findIndex(u=>u.id===selectedUser.id)+1) || '-'}</div>
                    </div>
                    <div className="rank-box">
                      <Flag size={16} color="var(--text-muted)" />
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>O'quvchilari</div>
                      <div className="rank-value">{selectedUser.followedBy?.length || 0}</div>
                    </div>
                  </div>)}`;
code = code.replace(profileStatsTarget, profileStatsReplacement);

// 3. User Posts on Profile
const officialAchievementsSection = `<div style={{ marginTop: '48px', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px' }}>
                      <Trophy size={24} color="#6366f1" /> Rasmiy Yutuqlar
                    </h3>
                    {selectedUser.achievements?.filter((a:any)=>a.title!=='Educal Yaratuvchisi').map((ach: any) => (
                      <div key={ach.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        {ach.image ? (
                          <img src={ach.image} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={24} color="#6366f1"/></div>
                        )}
                        <div style={{ fontWeight: 600, fontSize: '16px' }}>{ach.title}</div>
                      </div>
                    ))}
                  </div>`;

const postsOnProfile = `
                  <div style={{ marginTop: '48px', maxWidth: '500px' }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Foydalanuvchi Postlari</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {posts.filter(p => p.userId === selectedUser.id).map(post => (
                        <div key={post.id} style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                          <p style={{ marginBottom: '12px', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{post.content}</p>
                          {post.imageUrl && <img src={post.imageUrl} style={{ width: '100%', borderRadius: '8px', marginBottom: '12px' }} />}
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                            {(currentUser?.id === selectedUser.id || currentUser?.eduId === '1000001') && (
                              <button onClick={() => {
                                fetch(API_URL + '/api/posts/' + post.id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } })
                                .then(() => setPosts(posts.filter(p => p.id !== post.id)));
                              }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>O'chirish</button>
                            )}
                          </div>
                        </div>
                      ))}
                      {posts.filter(p => p.userId === selectedUser.id).length === 0 && <p style={{ color: 'var(--text-muted)' }}>Hozircha postlar yo'q.</p>}
                    </div>
                  </div>
`;
code = code.replace(officialAchievementsSection, officialAchievementsSection + postsOnProfile);

// 4. Main Feed Logic (Subscriptions & Founder only)
const feedPostsMap = `{posts.map(post => (`;
const newFeedPostsMap = `{posts.filter(p => currentUser?.eduId === '1000001' || p.user?.level === 'Asoschi' || p.userId === currentUser?.id || currentUser?.followingRel?.some((f:any) => f.followingId === p.userId)).map(post => (`;
code = code.replace(feedPostsMap, newFeedPostsMap);

// 5. Image preview removal in Post creation
const tempPostImage = `{tempPost.imageUrl && (
                        <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden' }}>
                          <img src={tempPost.imageUrl} style={{ width: '100%', display: 'block' }} />
                        </div>
                      )}`;
const newTempPostImage = `{tempPost.imageUrl && (
                        <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                          <img src={tempPost.imageUrl} style={{ width: '100%', display: 'block' }} />
                          <button onClick={() => setTempPost({...tempPost, imageUrl: ''})} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
                        </div>
                      )}`;
code = code.replace(tempPostImage, newTempPostImage);

// 6. Bot Profile Layout
const profileHeader = `<h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedUser.name} {selectedUser.isVerified && <VerifiedBadge size={20} />}
                  </h1>
                  <div style={{ color: 'var(--text-muted)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span>{selectedUser.username}</span>
                    <span style={{ background: 'var(--bg-main)', padding: '4px 10px', borderRadius: '20px', fontSize: '13px' }}>ID: {selectedUser.eduId}</span>
                  </div>`;
const newProfileHeader = `<h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedUser.name} {selectedUser.isVerified && <VerifiedBadge size={20} />}
                  </h1>
                  <div style={{ color: 'var(--text-muted)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span>{selectedUser.username}</span>
                    <span style={{ background: 'var(--bg-main)', padding: '4px 10px', borderRadius: '20px', fontSize: '13px' }}>ID: {selectedUser.eduId}</span>
                  </div>
                  {selectedUser.level === 'Bot' && currentUser?.id !== selectedUser.id && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                      <button onClick={async () => {
                          await fetch(API_URL + '/api/users/' + selectedUser.id + '/follow', { method: 'POST', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
                          showToast("Obuna bo'ldingiz", "success");
                        }} style={{ padding: '8px 16px', background: 'var(--primary-color)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Kuzatish</button>
                      <button onClick={() => alert("Chat tizimi V2 da qo'shiladi!")} style={{ padding: '8px 16px', background: 'var(--bg-main)', color: 'var(--text-main)', borderRadius: '8px', border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer' }}>Xabar yuborish</button>
                    </div>
                  )}`;
code = code.replace(profileHeader, newProfileHeader);

fs.writeFileSync('D:/EduSphere/src/App.tsx', code);
console.log('App.tsx heavily patched for user requests.');
