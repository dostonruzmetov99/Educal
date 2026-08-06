const fs = require('fs');
let code = fs.readFileSync('D:/EduSphere/src/App.tsx', 'utf8');

// 1. Optimistic comment delete
const oldCommentDelete = `onClick={async () => {
                                  try {
                                    await fetch(\`\${API_URL}/api/posts/\${commentsModalPostId}/comments/\${c.id}\`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
                                    setPosts(posts.map(p => p.id === commentsModalPostId ? { ...p, comments: (p.comments||[]).filter((cm:any) => cm.id !== c.id) } : p));
                                    setOpenCommentMenuId(null);
                                  } catch (e) { showToast("Xatolik", "error"); }
                                }}`;

const newCommentDelete = `onClick={() => {
                                  setPosts(posts.map(p => p.id === commentsModalPostId ? { ...p, comments: (p.comments||[]).filter((cm:any) => cm.id !== c.id) } : p));
                                  setOpenCommentMenuId(null);
                                  fetch(\`\${API_URL}/api/posts/\${commentsModalPostId}/comments/\${c.id}\`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } }).catch(() => {});
                                }}`;
code = code.replace(oldCommentDelete, newCommentDelete);

// 2. Optimistic comment create
const oldCommentSubmit = `onClick={async () => {
                      if (!commentText[commentsModalPostId]) return;
                      try {
                        const res = await fetch(\`\${API_URL}/api/posts/\${commentsModalPostId}/comments\`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                          body: JSON.stringify({ userId: currentUser?.id || 1, text: commentText[commentsModalPostId] })
                        });
                        const newC = await res.json();
                        setPosts(posts.map(p => p.id === commentsModalPostId ? { ...p, comments: [...(p.comments||[]), newC] } : p));
                        setCommentText({...commentText, [commentsModalPostId]: ""});
                      } catch(e) {}
                    }}`;

const newCommentSubmit = `onClick={() => {
                      if (!commentText[commentsModalPostId]) return;
                      const text = commentText[commentsModalPostId];
                      const tempComment = { id: Date.now(), text, userId: currentUser?.id, user: currentUser, createdAt: new Date().toISOString() };
                      setPosts(posts.map(p => p.id === commentsModalPostId ? { ...p, comments: [...(p.comments||[]), tempComment] } : p));
                      setCommentText({...commentText, [commentsModalPostId]: ""});
                      
                      fetch(\`\${API_URL}/api/posts/\${commentsModalPostId}/comments\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                        body: JSON.stringify({ userId: currentUser?.id || 1, text })
                      }).catch(() => {});
                    }}`;

code = code.replace(oldCommentSubmit, newCommentSubmit);

fs.writeFileSync('D:/EduSphere/src/App.tsx', code);
console.log('Optimistic UI for comments applied.');
