const fs = require('fs');
let code = fs.readFileSync('D:/EduSphere/src/App.tsx', 'utf8');

const oldLike = `onClick={async () => {
                              try {
                                const res = await fetch(\`\${API_URL}/api/posts/\${post.id}/like\`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                                  body: JSON.stringify({ userId: currentUser?.id || 1 })
                                });
                                const data = await res.json();
                                setPosts(posts.map(p => p.id === post.id ? {
                                  ...p, 
                                  likes: data.liked ? [...(p.likes||[]), {userId: currentUser?.id||1}] : (p.likes||[]).filter((l: any) => l.userId !== (currentUser?.id||1))
                                } : p));
                              } catch(e) {}
                            }}`;

const newLike = `onClick={() => {
                              const isLiked = (post.likes || []).some((l:any) => l.userId === (currentUser?.id || 1));
                              setPosts(posts.map(p => p.id === post.id ? {
                                ...p,
                                likes: isLiked 
                                  ? (p.likes || []).filter((l:any) => l.userId !== (currentUser?.id || 1))
                                  : [...(p.likes || []), {userId: currentUser?.id || 1}]
                              } : p));
                              
                              fetch(\`\${API_URL}/api/posts/\${post.id}/like\`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                                body: JSON.stringify({ userId: currentUser?.id || 1 })
                              }).catch(() => {});
                            }}`;

code = code.replace(oldLike, newLike);

fs.writeFileSync('D:/EduSphere/src/App.tsx', code);
console.log('Likes are now optimistic!');
