const fs = require('fs');
let code = fs.readFileSync('D:/EduSphere/src/App.tsx', 'utf8');

// 1. Fix handleFollow for optimistic UI
const oldHandleFollow = `const handleFollow = async (id: number) => {
    try {
      const res = await fetch(\`\${API_URL}/api/users/\${id}/follow\`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await res.json();
      if (data.following) {
        setFollowingList([...followingList, id]);
      } else {
        setFollowingList(followingList.filter(fid => fid !== id));
      }
    } catch(e) {
      showToast("Xatolik", "error");
    } finally { setIsSaving(false); }
  };`;

const newHandleFollow = `const handleFollow = async (id: number) => {
    const isCurrentlyFollowing = followingList.includes(id);
    setFollowingList(isCurrentlyFollowing ? followingList.filter(fid => fid !== id) : [...followingList, id]);
    
    if (selectedUser && selectedUser.id === id) {
      setSelectedUser({
        ...selectedUser,
        followedBy: isCurrentlyFollowing 
          ? (selectedUser.followedBy || []).filter((f:any) => f.followerId !== currentUser?.id)
          : [...(selectedUser.followedBy || []), { followerId: currentUser?.id }]
      });
    }
    
    setUsers(users.map(u => u.id === id ? {
      ...u,
      followedBy: isCurrentlyFollowing
        ? (u.followedBy || []).filter((f:any) => f.followerId !== currentUser?.id)
        : [...(u.followedBy || []), { followerId: currentUser?.id }]
    } : u));

    try {
      await fetch(\`\${API_URL}/api/users/\${id}/follow\`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
    } catch(e) {
      showToast("Xatolik", "error");
    } finally { setIsSaving(false); }
  };`;

code = code.replace(oldHandleFollow, newHandleFollow);

// 2. Hide bot from ranking
const oldRanking = `{[...users].sort((a, b) => {`;
const newRanking = `{[...users].filter(u => u.eduId !== '1000000').sort((a, b) => {`;

code = code.replace(oldRanking, newRanking);

fs.writeFileSync('D:/EduSphere/src/App.tsx', code);
console.log('Fixed follow optimistic UI and hidden bot from ranking.');
