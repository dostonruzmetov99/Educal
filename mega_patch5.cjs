const fs = require('fs');
let code = fs.readFileSync('D:/EduSphere/src/App.tsx', 'utf8');

const targetBlock = `<div style={{ display: 'flex', gap: '24px', fontSize: '14px', marginTop: '16px' }}>
                        <span><strong>{followingList.includes(selectedUser.id) ? (selectedUser.followers || 0) + 1 : (selectedUser.followers || 0)}</strong> Obunachilar</span>
                        <span><strong>{selectedUser.following || 0}</strong> Obunalar</span>
                      </div>
                    </div>

                    {selectedUser.username !== currentUser.username && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={() => handleFollow(selectedUser.id)}
                          style={{
                            background: followingList.includes(selectedUser.id) ? '#f3f4f6' : 'var(--primary-color)',
                            color: followingList.includes(selectedUser.id) ? 'var(--text-main)' : 'white',
                            padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                            border: followingList.includes(selectedUser.id) ? '1px solid var(--border-light)' : '1px solid var(--primary-color)'
                          }}
                        >
                          {followingList.includes(selectedUser.id) ? 'Kuzatilmoqda' : 'Kuzatish'}
                        </button>
                      </div>
                    )}`;

const replacementBlock = `<div style={{ display: 'flex', gap: '24px', fontSize: '14px', marginTop: '16px' }}>
                        <span onClick={() => setFollowersModal({type: 'followers', userId: selectedUser.id})} style={{ cursor: 'pointer' }}><strong>{selectedUser.followedBy?.length || followingList.includes(selectedUser.id) ? (selectedUser.followers || 0) + 1 : (selectedUser.followers || 0)}</strong> Obunachilar</span>
                        <span onClick={() => setFollowersModal({type: 'following', userId: selectedUser.id})} style={{ cursor: 'pointer' }}><strong>{selectedUser.followingRel?.length || selectedUser.following || 0}</strong> Obunalar</span>
                      </div>
                    </div>

                    {selectedUser.username !== currentUser.username && (
                      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexDirection: 'row' }}>
                        <button
                          onClick={() => handleFollow(selectedUser.id)}
                          style={{
                            background: followingList.includes(selectedUser.id) ? '#f3f4f6' : 'var(--primary-color)',
                            color: followingList.includes(selectedUser.id) ? 'var(--text-main)' : 'white',
                            padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                            border: followingList.includes(selectedUser.id) ? '1px solid var(--border-light)' : '1px solid var(--primary-color)',
                            flex: 1
                          }}
                        >
                          {followingList.includes(selectedUser.id) ? 'Kuzatilmoqda' : 'Kuzatish'}
                        </button>
                        <button onClick={() => alert("Chat tizimi tez orada ishga tushadi!")} style={{ padding: '10px 24px', background: 'var(--bg-main)', color: 'var(--text-main)', borderRadius: '8px', border: '1px solid var(--border-light)', fontWeight: 600, cursor: 'pointer', flex: 1 }}>
                          Xabar yuborish
                        </button>
                      </div>
                    )}`;

code = code.replace(targetBlock, replacementBlock);

fs.writeFileSync('D:/EduSphere/src/App.tsx', code);
console.log('Followers and buttons patched successfully.');
