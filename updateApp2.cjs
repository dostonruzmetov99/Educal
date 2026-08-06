const fs = require('fs');

let content = fs.readFileSync('D:\\EduSphere\\src\\App.tsx', 'utf8');

// 1. Add handleFileUpload function inside App component
const handleFileUploadCode = `
  const handleFileUpload = async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        body: formData
      });
      const data = await res.json();
      return data.url;
    } catch(e) {
      showToast("Fayl yuklashda xatolik", "error");
      return null;
    }
  };
`;

content = content.replace(
  `  const [toast, setToast] = useState<{msg: string, type: string} | null>(null);`,
  handleFileUploadCode + `\n  const [toast, setToast] = useState<{msg: string, type: string} | null>(null);`
);

// 2. Change image inputs to use handleFileUpload
content = content.replace(
  `                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setNewPostImage(reader.result as string);
                              reader.readAsDataURL(file);
                            }`,
  `                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file).then((url: any) => {
                                if(url) setNewPostImage(url);
                              });
                            }`
);

content = content.replace(
  `    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }`,
  `    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file).then((url: any) => {
        if(url) setEditAvatar(url);
      });
    }`
);

content = content.replace(
  `    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAchievementImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }`,
  `    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file).then((url: any) => {
        if(url) setNewAchievementImage(url);
      });
    }`
);

content = content.replace(
  `                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            setPromptDialog({
                              msg: "Storiya uchun izoh (ixtiyoriy):",
                              val: "",
                              onConfirm: async (caption) => {
                                try {
                                  const res = await fetch('http://localhost:5000/api/stories', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                                    body: JSON.stringify({ userId: currentUser?.id || 1, imageUrl: reader.result, caption })
                                  });
                                  const newStory = await res.json();
                                  setStories([newStory, ...stories]);
                                } catch(err) { showToast("Xatolik yuz berdi", "error"); }
                              }
                            });
                          };
                          reader.readAsDataURL(file);
                        }`,
  `                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file).then((url: any) => {
                            if (!url) return;
                            setPromptDialog({
                              msg: "Storiya uchun izoh (ixtiyoriy):",
                              val: "",
                              onConfirm: async (caption) => {
                                try {
                                  const res = await fetch('http://localhost:5000/api/stories', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                                    body: JSON.stringify({ imageUrl: url, caption })
                                  });
                                  const newStory = await res.json();
                                  setStories([newStory, ...stories]);
                                } catch(err) { showToast("Xatolik yuz berdi", "error"); }
                              }
                            });
                          });
                        }`
);

// 3. Fix Follow Logic
content = content.replace(
  `  const handleFollow = (id: number) => {
    if (followingList.includes(id)) {
      setFollowingList(followingList.filter(fid => fid !== id));
    } else {
      setFollowingList([...followingList, id]);
    }
  };`,
  `  const handleFollow = async (id: number) => {
    try {
      const res = await fetch(\`http://localhost:5000/api/users/\${id}/follow\`, {
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
    }
  };`
);

// Also we need to initialize followingList in useEffect:
content = content.replace(
  `          setCurrentUser(data.user);
          setIsAuthenticated(true);`,
  `          setCurrentUser(data.user);
          if (data.user.followingRel) {
            setFollowingList(data.user.followingRel.map((f: any) => f.followingId));
          }
          setIsAuthenticated(true);`
);

// Search logic
content = content.replace(
  `onChange={(e) => setSearchQuery(e.target.value)}`,
  `onChange={async (e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim().length > 0) {
                  try {
                    const res = await fetch('http://localhost:5000/api/users/search?q=' + encodeURIComponent(val), {
                      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    });
                    const result = await res.json();
                    setUsers(result);
                  } catch(e) {}
                }
              }}`
);
content = content.replace(
  `users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) || (u.eduId && u.eduId.includes(searchQuery))).map`,
  `users.map`
);
content = content.replace(
  `users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) || (u.eduId && u.eduId.includes(searchQuery))).length === 0`,
  `users.length === 0`
);

// Reports logic
content = content.replace(
  `                                    setBotMessages(prev => [{
                                      id: Date.now(),
                                      text: \`DIQQAT! Shikoyat kelib tushdi:\\nKIMDAN: \${currentUser.name}\\nKIMGA NISBATAN: \${selectedUser.name}\\nSABAB: \${reason}\`,
                                      date: new Date().toLocaleTimeString()
                                    }, ...prev]);`,
  `                                    fetch('http://localhost:5000/api/reports', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                                      body: JSON.stringify({ reportedId: selectedUser.id, reason })
                                    });`
);

content = content.replace(
  `onClick={() => setActiveView('messages')}`,
  `onClick={() => {
              setActiveView('messages');
              if (currentUser?.level === 'Asoschi') {
                fetch('http://localhost:5000/api/reports', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } })
                  .then(r => r.json())
                  .then(data => { if(Array.isArray(data)) setBotMessages(data); });
              }
            }}`
);

content = content.replace(
  `                      {botMessages.map(msg => (
                        <div key={msg.id} style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ color: '#b91c1c' }}>Educal Bot</strong>
                            <span style={{ fontSize: '12px', color: '#991b1b' }}>{msg.date}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-line', color: '#7f1d1d', lineHeight: '1.5' }}>{msg.text}</p>
                        </div>
                      ))}`,
  `                      {botMessages.map((msg: any) => (
                        <div key={msg.id} style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ color: '#b91c1c' }}>Educal Bot</strong>
                            <span style={{ fontSize: '12px', color: '#991b1b' }}>{new Date(msg.createdAt).toLocaleString()}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-line', color: '#7f1d1d', lineHeight: '1.5' }}>DIQQAT! Shikoyat:\\nKIMDAN: {msg.reporter?.name}\\nKIMGA NISBATAN: {msg.reportedUser?.name}\\nSABAB: {msg.reason}</p>
                        </div>
                      ))}`
);

// Rank System Logic Update 
content = content.replace(
  `                      <div className="rank-value">{selectedUser.globalRank || 'Yangi'}</div>
                    </div>
                    <div className="rank-box">
                      <div className="rank-label"><span style={{ marginRight: '6px' }}>{selectedUser.countryFlag || '🇺🇿'}</span> Davlat</div>
                      <div className="rank-value">{selectedUser.countryRank || 'Yangi'}</div>
                    </div>
                    <div className="rank-box">
                      <div className="rank-label"><MapPin size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Viloyat</div>
                      <div className="rank-value">{selectedUser.regionRank || 'Yangi'}</div>`,
  `                      <div className="rank-value">{selectedUser.level === 'Asoschi' ? 1 : Math.max(1, 1000 - parseInt(selectedUser.level||'1') * 5)}</div>
                    </div>
                    <div className="rank-box">
                      <div className="rank-label"><span style={{ marginRight: '6px' }}>{selectedUser.countryFlag || '🇺🇿'}</span> Davlat</div>
                      <div className="rank-value">{selectedUser.level === 'Asoschi' ? 1 : Math.max(1, 500 - parseInt(selectedUser.level||'1') * 2)}</div>
                    </div>
                    <div className="rank-box">
                      <div className="rank-label"><MapPin size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Viloyat</div>
                      <div className="rank-value">{selectedUser.level === 'Asoschi' ? 1 : Math.max(1, 100 - parseInt(selectedUser.level||'1'))}</div>`
);

fs.writeFileSync('D:\\EduSphere\\src\\App.tsx', content);
console.log('App.tsx updated for part 2');
