const fs = require('fs');

let content = fs.readFileSync('D:\\EduSphere\\src\\App.tsx', 'utf8');

// 1. Remove hardcoded users and add currentUser state properly
content = content.replace(
  `  const [users, setUsers] = useState<any[]>([
    {
      id: 1, name: 'Yuki Tanaka', username: '@yuki_t', level: 'Elite Scholar',
      avatar: 'https://i.pravatar.cc/150?img=12', isPrivate: true,
      followers: 1200, following: 30, globalRank: 234, countryRank: 12, regionRank: 3, countryFlag: '🇯🇵', isVerified: true, eduId: '8394021'
    },
    {
      id: 2, name: 'Ali Tursunov', username: '@ali_uz', level: 'Advanced',
      avatar: 'https://i.pravatar.cc/150?img=33', isPrivate: false,
      followers: 450, following: 100, globalRank: 8945, countryRank: 150, regionRank: 24, countryFlag: '🇺🇿', isVerified: false, eduId: '4729103'
    }
  ]);`,
  `  const [users, setUsers] = useState<any[]>([]);\n  const [currentUser, setCurrentUser] = useState<any>(null);\n  const [isAppLoading, setIsAppLoading] = useState(true);`
);

// 2. Remove the old currentUser fallback logic
content = content.replace(
  /  let currentUser = users\.find\(.*?if \(currentUser\) \{.*?\} else \{.*?\};\n  \}/s,
  `` // we remove it completely because currentUser is now a state
);

// 3. Fix handleSaveProfile to call API
content = content.replace(
  `  const handleSaveProfile = () => {
    const updatedUsers = users.map(u => u.id === currentUser?.id ? { ...u, name: editName, username: editUsername, avatar: editAvatar, achievements: editAchievements } : u);
    setUsers(updatedUsers);
    setActiveView('profile');
    setSelectedUser(updatedUsers.find(u => u.id === currentUser?.id) || updatedUsers[0]);
    showToast("Profil muvaffaqiyatli saqlandi!", "success");
  };`,
  `  const handleSaveProfile = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        body: JSON.stringify({ name: editName, username: editUsername, avatar: editAvatar, achievements: editAchievements })
      });
      const updatedUser = await res.json();
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setActiveView('profile');
      setSelectedUser(updatedUser);
      showToast("Profil muvaffaqiyatli saqlandi!", "success");
    } catch(e) {
      showToast("Xatolik", "error");
    }
  };`
);

// 4. Wrap fetch requests with Authorization headers
// For handleCreatePost we just use a global replace later, but for others too.

const newUseEffect = `
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsAppLoading(false));
    } else {
      setIsAppLoading(false);
    }

    fetch('http://localhost:5000/api/init', { method: 'POST' })
      .then(() => fetch('http://localhost:5000/api/users'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
      });

    fetch('http://localhost:5000/api/posts')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setPosts(data); });
      
    fetch('http://localhost:5000/api/stories')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setStories(data); });
  }, []);
`;

content = content.replace(
  /  useEffect\(\(\) => \{\n    \/\/ Backend API ulanishi.*?  \}, \[\]\);/s,
  newUseEffect
);

// Update logout
content = content.replace(
  `onClick={() => setIsAuthenticated(false)}`,
  `onClick={() => { localStorage.removeItem('token'); setIsAuthenticated(false); setCurrentUser(null); }}`
);

// Add missing headers everywhere else
content = content.replace(
  `fetch(\`http://localhost:5000/api/posts/\${post.id}\`, { method: 'DELETE' });`,
  `fetch(\`http://localhost:5000/api/posts/\${post.id}\`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });`
);

content = content.replace(
  /headers: \{'Content-Type': 'application\/json'\}/g,
  `headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') }`
);

content = content.replace(
  /headers: \{ 'Content-Type': 'application\/json' \}/g,
  `headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') }`
);

// After auth register/login, setCurrentUser should be called:
content = content.replace(
  `localStorage.setItem('token', data.token);
                   setLoggedInEmail(data.user.email || data.user.username);
                   setActiveView('dashboard');
                   setSelectedUser(null);
                   setIsAuthenticated(true);`,
  `localStorage.setItem('token', data.token);
                   setCurrentUser(data.user);
                   setActiveView('dashboard');
                   setSelectedUser(null);
                   setIsAuthenticated(true);`
);
content = content.replace(
  `localStorage.setItem('token', data.token);
                   setLoggedInEmail(data.user.email || data.user.username);
                   setActiveView('dashboard');
                   setSelectedUser(null);
                   setIsAuthenticated(true);`,
  `localStorage.setItem('token', data.token);
                   setCurrentUser(data.user);
                   setActiveView('dashboard');
                   setSelectedUser(null);
                   setIsAuthenticated(true);`
);

// Handle isAppLoading check
const loadingRender = `  if (isAppLoading) return <div style={{display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-main)'}}><h3>Yuklanmoqda...</h3></div>;

  if (!isAuthenticated) {`;

content = content.replace(`  if (!isAuthenticated) {`, loadingRender);

// Ensure currentUser defaults when undefined in the UI are handled if we somehow missed them
// Like `currentUser.avatar` might error if currentUser is null, but we return early if !isAuthenticated. So inside main area, currentUser is guaranteed (except if there's a bug).
// Just to be safe, add `if (!currentUser) return null;` after `if (!isAuthenticated)` block.
content = content.replace(
  `  return (
    <div className="dashboard-container">`,
  `  if (!currentUser) return null;
  return (
    <div className="dashboard-container">`
);

fs.writeFileSync('D:\\EduSphere\\src\\App.tsx', content);
console.log('App.tsx updated');
