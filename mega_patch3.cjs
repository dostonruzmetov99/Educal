const fs = require('fs');
let code = fs.readFileSync('D:/EduSphere/src/App.tsx', 'utf8');

// 1. Remove "Yutuqlari" (Viloyat) rank box entirely
const yutuqlariBox = `<div className="rank-box">
                      <div className="rank-label"><MapPin size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Yutuqlari</div>
                      <div className="rank-value">{selectedUser.achievements?.filter((a:any)=>a.title!=='Educal Yaratuvchisi').length || 0}</div>
                    </div>`;
code = code.replace(yutuqlariBox, '');

// 2. Hide Global and Davlat unless founder or self
const rankBoxesStart = `<div className="rank-boxes" style={{ marginTop: '32px', maxWidth: '500px' }}>`;
const rankBoxesEnd = `<div className="rank-value">{selectedUser.followedBy?.length || 0}</div>
                    </div>
                  </div>`;
                  
if (code.includes(rankBoxesStart)) {
  const indexStart = code.indexOf(rankBoxesStart);
  const indexEnd = code.indexOf(rankBoxesEnd, indexStart) + rankBoxesEnd.length;
  if (indexStart !== -1 && indexEnd > indexStart) {
    const originalRankBoxes = code.substring(indexStart, indexEnd);
    const wrappedRankBoxes = `{(currentUser?.id === selectedUser.id || currentUser?.eduId === '1000001') && (
      ${originalRankBoxes}
    )}`;
    code = code.replace(originalRankBoxes, wrappedRankBoxes);
  }
}

// 3. Add User Posts in Profile (below Rasmiy Yutuqlar)
const afterAchievements = `{selectedUser.achievements?.filter((a:any)=>a.title!=='Educal Yaratuvchisi').length === 0 && selectedUser.eduId !== '1000001' && (
                        <p style={{ color: 'var(--text-muted)' }}>Hozircha yutuqlar yo'q.</p>
                      )}
                    </div>
                  </div>`;

const postsInProfile = `
                  <div style={{ marginTop: '48px', maxWidth: '500px' }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 700 }}>Foydalanuvchi Postlari</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {posts.filter(p => p.userId === selectedUser.id).map(post => (
                        <div key={post.id} style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                          <p style={{ marginBottom: '12px', fontSize: '15px', whiteSpace: 'pre-wrap' }}>{post.content}</p>
                          {post.imageUrl && <img src={post.imageUrl} style={{ width: '100%', borderRadius: '8px', marginBottom: '12px', objectFit: 'cover' }} />}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                            {(currentUser?.id === selectedUser.id || currentUser?.eduId === '1000001') && (
                              <button onClick={() => {
                                fetch(API_URL + '/api/posts/' + post.id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } })
                                .then(() => setPosts(posts.filter(p => p.id !== post.id)));
                              }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>O'chirish</button>
                            )}
                          </div>
                        </div>
                      ))}
                      {posts.filter(p => p.userId === selectedUser.id).length === 0 && <p style={{ color: 'var(--text-muted)' }}>Hozircha postlar yo'q.</p>}
                    </div>
                  </div>
`;

code = code.replace(afterAchievements, afterAchievements + postsInProfile);

fs.writeFileSync('D:/EduSphere/src/App.tsx', code);
console.log('Fixed profile posts and rank boxes visibility.');
