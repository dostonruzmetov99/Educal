const fs = require('fs');
let code = fs.readFileSync('D:/EduSphere/src/App.tsx', 'utf8');

const oldSaveProfile = `const updatedUser = await res.json();
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setActiveView('profile');
      setSelectedUser(updatedUser);`;

const newSaveProfile = `const updatedUser = await res.json();
      const mergedUser = { ...(users.find(u => u.id === updatedUser.id) || {}), ...updatedUser };
      setCurrentUser(mergedUser);
      localStorage.setItem('user', JSON.stringify(mergedUser));
      setUsers(users.map(u => u.id === updatedUser.id ? mergedUser : u));
      setActiveView('profile');
      setSelectedUser(mergedUser);`;

code = code.replace(oldSaveProfile, newSaveProfile);

// For level and verification:
// newSelected is already `{...selectedUser, isVerified: newStatus}` or `{...selectedUser, level: newLevel}`, so it preserves the old fields correctly.

fs.writeFileSync('D:/EduSphere/src/App.tsx', code);
console.log('Fixed profile save data wipeout bug.');
