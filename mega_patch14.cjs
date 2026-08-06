const fs = require('fs');
let code = fs.readFileSync('D:/EduSphere/src/App.tsx', 'utf8');

// 1. Replace alert with showToast
code = code.replace(
  'alert("Chat tizimi tez orada ishga tushadi!")',
  'showToast("Chat tizimi tez orada ishga tushadi!", "info")'
);

// 2. Add global onClick to close menus
code = code.replace(
  '<div className="dashboard-container">',
  '<div className="dashboard-container" onClick={() => { setOpenPostMenuId(null); setOpenCommentMenuId(null); }}>'
);

// 3. Fix 3-dots in feed posts
code = code.replace(
  'onClick={() => setOpenPostMenuId(openPostMenuId === post.id ? null : post.id)}',
  'onClick={(e) => { e.stopPropagation(); setOpenPostMenuId(openPostMenuId === post.id ? null : post.id); }}'
);

// 4. Fix 3-dots in profile posts (wait, I didn't add 3 dots to profile posts, they just have O'chirish button directly)
// Wait! Profile posts don't have a menu right now, they just have the Delete button visible directly for the owner. 
// Did I add 3 dots to profile posts? Let me check mega_patch12.cjs.
// In mega_patch12.cjs, I added:
// <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
// <button onClick={...}>Heart</button>
// {(currentUser?.id === selectedUser.id || currentUser?.eduId === '1000001') && (
//   <button onClick={() => { ... }}>O'chirish</button>
// )}

// 5. Fix 3-dots in comments
code = code.replace(
  'onClick={() => setOpenCommentMenuId(openCommentMenuId === c.id ? null : c.id)}',
  'onClick={(e) => { e.stopPropagation(); setOpenCommentMenuId(openCommentMenuId === c.id ? null : c.id); }}'
);

fs.writeFileSync('D:/EduSphere/src/App.tsx', code);
console.log('Fixed alerts and global click closing.');
