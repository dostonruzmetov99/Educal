import React, { useState, useEffect } from 'react';
import {
  Settings, Search, Users, LayoutDashboard,
  User, CheckCircle2, Globe, MapPin, Trophy,
  LogOut, Shield, Edit3, ArrowLeft, BadgeCheck, MoreHorizontal, Eye, EyeOff, Heart, MessageCircle, Image as ImageIcon,
  AlertTriangle, TrendingUp, XCircle, Trash2, Copy
} from 'lucide-react';
import './index.css';

const VerifiedBadge = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M23,12l-2.44-2.78l0.34-3.68l-3.61-0.82l-1.89-3.18L12,3L8.6,1.54L6.71,4.72L3.1,5.54L3.44,9.22L1,12l2.44,2.78l-0.34,3.68l3.61,0.82l1.89,3.18L12,21l3.4,1.46l1.89-3.18l3.61-0.82l-0.34-3.68L23,12z" fill="#0095F6" />
    <path d="M9.99999 15.8L6.49999 12.3L7.91999 10.88L9.99999 12.96L16.08 6.87997L17.5 8.29997L9.99999 15.8Z" fill="white" />
  </svg>
)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export default function App() {
  const getLevelDisplay = (u: any) => {
    if (!u) return 'Level 1';
    let val = parseInt(u.level);
    if (isNaN(val)) val = 1;

    if (u.eduId === '1000001') {
      return val > 999 ? 'Level +999' : `Level ${val}`;
    }
    
    return `Level ${Math.min(val, 999)}`;
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
  const [followingList, setFollowingList] = useState<number[]>([]);
  const [editName, setEditName] = useState("Dostonbek Ruzmatov");
  const [editBio, setEditBio] = useState("");
  const [oldEmail, setOldEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editUsername, setEditUsername] = useState("@d_ruzmatov");
  const [editAvatar, setEditAvatar] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [openPostMenuId, setOpenPostMenuId] = useState<number | null>(null);
  const [commentsModalPostId, setCommentsModalPostId] = useState<number | null>(null);
  const [editAchievements, setEditAchievements] = useState<any[]>([]);
  const [newAchievement, setNewAchievement] = useState("");
  const [newAchievementImage, setNewAchievementImage] = useState("");


  const handleFileUpload = async (file: any) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      showToast("Rasm ImgBB ga yuklanmoqda...", "info");
      const res = await fetch('https://api.imgbb.com/1/upload?key=962cc8f3a7ba9c7da61a45c33fd98efa', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if(data.success) {
         return data.data.url;
      }
      return null;
    } catch(e) {
      showToast("Yuklashda xatolik", "error");
      return null;
    }
  };

  const [toast, setToast] = useState<{msg: string, type: string} | null>(null);
  const showToast = (msg: string, type: 'success'|'error'|'info' = 'info') => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 3000);
  };
  const [confirmDialog, setConfirmDialog] = useState<{msg: string, onConfirm: () => void} | null>(null);
  const [promptDialog, setPromptDialog] = useState<{msg: string, val: string, onConfirm: (val: string) => void} | null>(null);
  const [botMessages, setBotMessages] = useState<any[]>([]);



  // Update edit states when currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || "Dostonbek Ruzmatov");
      setEditUsername(currentUser.username || "@d_ruzmatov");
      setEditAvatar(currentUser.avatar || "https://i.pravatar.cc/150?img=11");
      setEditAchievements(currentUser.achievements || []);
    }
  }, [currentUser?.id]);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(API_URL + '/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        body: JSON.stringify({ name: editName, username: editUsername, avatar: editAvatar, achievements: editAchievements, bio: editBio })
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
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file).then((url: any) => {
        if(url) setEditAvatar(url);
      });
    }
  };

  const handleAchievementImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file).then((url: any) => {
        if(url) setNewAchievementImage(url);
      });
    }
  };

  const handleFollow = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}/follow`, {
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
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim()) return;

    // UI-ni darhol yangilash
    const tempPost = { id: Date.now(), content: newPostText, user: currentUser, imageUrl: newPostImage };
    setPosts([tempPost, ...posts]);
    setNewPostText("");
    setNewPostImage("");

    try {
      // Haqiqiy Ma'lumotlar Bazasiga saqlash (Backend)
      const res = await fetch(API_URL + '/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        body: JSON.stringify({ content: tempPost.content, userId: currentUser?.id || 1, imageUrl: tempPost.imageUrl })
      });
      const realPost = await res.json();
      setPosts(prev => prev.map(p => p.id === tempPost.id ? realPost : p));
    } catch (err) {
      console.error("Post saqlanmadi:", err);
    }
  };


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(API_URL + '/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          setEditBio(data.user.bio || "");
          if (data.user.followingRel) {
            setFollowingList(data.user.followingRel.map((f: any) => f.followingId));
          }
          setIsAuthenticated(true);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsAppLoading(false));
    } else {
      setIsAppLoading(false);
    }

    fetch(API_URL + '/api/init', { method: 'POST' })
      .then(() => fetch(API_URL + '/api/users', {headers:{'Authorization':'Bearer '+localStorage.getItem('token')}}))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers([...data, {id:999999, name:'Educal Bot', username:'@educal_bot', eduId:'1000000', level:'Bot', isVerified:true, avatar:'https://ui-avatars.com/api/?name=EB&background=4f46e5&color=fff', achievements:[]}]);
      });

    fetch(API_URL + '/api/posts')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setPosts(data); });
      
  }, []);




  const handleProfileView = (user: any) => {
    setSelectedUser(user);
    setActiveView('profile');
  };

  if (isAppLoading) return <div style={{display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-main)'}}><h3>Yuklanmoqda...</h3></div>;

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div className="card" style={{ width: '400px', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="logo-icon" style={{ width: '64px', height: '64px', margin: '0 auto 16px', fontSize: '24px' }}>Edu</div>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{isLoginMode ? "Tizimga kirish" : "Ro'yxatdan o'tish"}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
              {isLoginMode ? "Profilingizga kirish uchun ma'lumotlarni kiriting" : "Yangi hisob yaratish uchun formani to'ldiring"}
            </p>
          </div>
          
          {!isLoginMode && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>To'liq ismingiz</label>
              <input type="text" id="regName" placeholder="Ism va Familiya" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', fontSize: '15px' }} />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email yoki Username</label>
            <input type="text" id="authEmail" placeholder="Email yoki usernameni kiriting" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', fontSize: '15px' }} />
          </div>
          
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Parol</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? "text" : "password"} id="authPassword" placeholder="••••••••" style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', fontSize: '15px' }} />
              <button 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button 
            onClick={async () => {
              const emailVal = (document.getElementById('authEmail') as HTMLInputElement).value;
              const passVal = (document.getElementById('authPassword') as HTMLInputElement).value;
              
              if (emailVal.trim() === '' || passVal.trim() === '') {
                 showToast("Iltimos maydonlarni to'ldiring!", "error");
                 return;
              }

              if (!isLoginMode) {
                 const nameVal = (document.getElementById('regName') as HTMLInputElement).value;
                 if (nameVal.trim() === '') {
                   showToast("Ismingizni kiriting!", "error");
                   return;
                 }
                 try {
                   const res = await fetch(API_URL + '/api/auth/register', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                     body: JSON.stringify({ name: nameVal, email: emailVal, password: passVal })
                   });
                   const data = await res.json();
                   if (!res.ok) {
                     showToast(data.error || "Ro'yxatdan o'tishda xatolik yuz berdi", "error");
                     return;
                   }
                   localStorage.setItem('token', data.token);
                   setCurrentUser(data.user);
                   setActiveView('dashboard');
                   setSelectedUser(null);
                   setIsAuthenticated(true);
                   // Refresh users to include new user
                   fetch(API_URL + '/api/users', {headers:{'Authorization':'Bearer '+localStorage.getItem('token')}}).then(r => r.json()).then(d => { if(Array.isArray(d)) setUsers([...d, {id:999999, name:'Educal Bot', username:'@educal_bot', eduId:'1000000', level:'Bot', isVerified:true, avatar:'https://ui-avatars.com/api/?name=EB&background=4f46e5&color=fff', achievements:[]}]); });
                 } catch (err) {
                   console.error(err);
                   showToast("Serverga ulanishda xatolik yuz berdi.", "error");
                 }
              } else {
                 try {
                   const res = await fetch(API_URL + '/api/auth/login', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                     body: JSON.stringify({ email: emailVal, password: passVal })
                   });
                   const data = await res.json();
                   if (!res.ok) {
                     showToast(data.error || "Login yoki parol noto'g'ri", "error");
                     return;
                   }
                   localStorage.setItem('token', data.token);
                   setCurrentUser(data.user);
                   setActiveView('dashboard');
                   setSelectedUser(null);
                   setIsAuthenticated(true);
                 } catch (err) {
                   console.error(err);
                   showToast("Serverga ulanishda xatolik yuz berdi.", "error");
                 }
              }
            }}
            style={{ width: '100%', background: 'var(--primary-color)', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '16px', transition: 'all 0.2s' }}
          >
            {isLoginMode ? 'Tizimga Kirish' : 'Hisob Yaratish'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
            {isLoginMode ? "Hali hisobingiz yo'qmi? " : "Hisobingiz bormi? "}
            <span onClick={() => setIsLoginMode(!isLoginMode)} style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600 }}>
              {isLoginMode ? "Ro'yxatdan o'tish" : "Tizimga kirish"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;
  return (
    <div className="dashboard-container">

      {/* Sidebar Nav */}
      <div className="sidebar">
        <div className="logo-area">
          <div className="logo-icon">Edu</div>
          <div className="logo-text">Educal</div>
        </div>

        <div className="nav-menu">
          <div
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Asosiy Ekran</span>
          </div>
          <div
            className={`nav-item ${activeView === 'students' ? 'active' : ''}`}
            onClick={() => setActiveView('students')}
          >
            <Users size={20} />
            <span>O'quvchilar</span>
          </div>
          <div
            className={`nav-item ${activeView === 'ranking' ? 'active' : ''}`}
            onClick={() => setActiveView('ranking')}
          >
            <Trophy size={20} />
            <span>Top Reyting</span>
          </div>
          <div
            className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveView('settings')}
          >
            <Settings size={20} />
            <span>Sozlamalar</span>
          </div>
          <div
            className={`nav-item ${activeView === 'messages' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('messages');
              if (currentUser?.level === 'Asoschi') {
                fetch(API_URL + '/api/reports', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } })
                  .then(r => r.json())
                  .then(data => { if(Array.isArray(data)) setBotMessages(data); });
              }
            }}
          >
            <MessageCircle size={20} />
            <span>Xabarlar</span>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="user-profile-btn" onClick={() => handleProfileView(currentUser)}>
            <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || "User")}&background=random`} alt="User" className="user-avatar" />
            <div className="user-details">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {currentUser.name} {currentUser.isVerified && <VerifiedBadge size={16} />}
              </h4>
              <span className="badge" style={{ marginTop: '4px', display: 'inline-block' }}>{getLevelDisplay(currentUser)}</span>
            </div>
          </div>

          <div style={{ marginTop: '24px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
            © 2026 Educal<br />
            Dostonbek Ruzmatov tomonidan asos solingan
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="main-area">

        {/* Header */}
        <div className="top-header">
          <div className="search-bar" style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Qidiruv: foydalanuvchilar, ID..."
              value={searchQuery}
              onChange={async (e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim().length > 0) {
                  try {
                    const res = await fetch(API_URL + '/api/users/search?q=' + encodeURIComponent(val), {
                      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    });
                    const result = await res.json();
                    setUsers(result);
                  } catch(e) {}
                }
              }}
            />
            {searchQuery && (
              <div style={{ position: 'absolute', top: '40px', left: 0, right: 0, background: 'var(--bg-card)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-light)' }}>
                {users.map(u => (
                  <div key={u.id} onClick={() => { handleProfileView(u); setSearchQuery(""); }} style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }}>
                    <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=random`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    <span style={{ fontWeight: 500 }}>{u.name} <span style={{fontSize: '12px', color: 'var(--text-muted)'}}>{u.username}</span></span>
                  </div>
                ))}
                {users.length === 0 && (
                  <div style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Hech kim topilmadi</div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
              <User size={20} onClick={() => handleProfileView(currentUser)} />
            </div>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="content-wrapper">
          {/* Main content directly renders */}
          <>
            {activeView === 'dashboard' && (
              <div>
                <h2 style={{ marginBottom: '24px', fontSize: '24px' }}>Asosiy Lenta</h2>
                
<div className="card" style={{ marginBottom: '24px' }}>
                  <textarea
                    placeholder="Nima yangiliklar? Yutuqlaringiz haqida yozing..."
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', minHeight: '60px', fontFamily: 'inherit', fontSize: '15px', background: 'transparent' }}
                  />
                  {newPostImage && <img src={newPostImage} style={{ width: '100px', borderRadius: '8px', marginTop: '8px' }} alt="preview" />}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--primary-color)', background: '#eef2ff', padding: '6px 12px', borderRadius: '6px', fontWeight: 500 }}>
                         <ImageIcon size={18} /> Rasm qo'shish
                         <input type="file" accept="image/*" onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                             const reader = new FileReader();
                             reader.onloadend = () => setNewPostImage(reader.result as string);
                             reader.readAsDataURL(file);
                           }
                         }} style={{ display: 'none' }} />
                       </label>
                    </div>
                    <button onClick={handleCreatePost} style={{ background: 'var(--primary-color)', color: 'white', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      Post Qoldirish
                    </button>
                  </div>
                </div>
                {posts.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)' }}>Hech qanday ma'lumot yo'q.</div>
                ) : (
                  <div className="grid-layout">
                    {posts.map((post: any) => (
                      <div className="card" key={post.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <img src={post.user?.avatar || `https://ui-avatars.com/api/?name=${post.user?.name}&background=random`} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <h4 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', margin: 0, whiteSpace: 'nowrap' }}>
                                {post.user?.name} {(post.user?.isVerified || post.user?.eduId === '1000001') && <VerifiedBadge size={16} />}
                              </h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{post.user?.username}</span>
                                <span className="badge" style={{ fontSize: '10px', padding: '2px 8px' }}>{getLevelDisplay(post.user)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ position: 'relative' }}>
                            <MoreHorizontal size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setOpenPostMenuId(openPostMenuId === post.id ? null : post.id)} />
                            {openPostMenuId === post.id && (
                              <div style={{ position: 'absolute', right: 0, top: '24px', background: 'white', border: '1px solid var(--border-light)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10, width: '150px' }}>
                                <div 
                                  onClick={() => { 
                                    navigator.clipboard.writeText(`http://localhost:5173/post/${post.id}`); 
                                    showToast("Post havolasi nusxalandi!", "success"); 
                                    setOpenPostMenuId(null); 
                                  }}
                                  style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                  <Copy size={16} /> Nusxa olish
                                </div>
                                {post.userId === (currentUser?.id || 1) && (
                                  <div 
                                    onClick={async () => {
                                      setConfirmDialog({
                                        msg: "Rostan ham bu postni o'chirib tashlamoqchimisiz?",
                                        onConfirm: async () => {
                                          try {
                                            await fetch(`${API_URL}/api/posts/${post.id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
                                            setPosts(posts.filter(p => p.id !== post.id));
                                          } catch (e) { showToast("Xatolik", "error"); }
                                        }
                                      });
                                    }}
                                    style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}
                                  >
                                    <Trash2 size={16} /> O'chirish
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <p style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '16px' }}>{post.content}</p>
                        {post.imageUrl && (
                          post.imageUrl.match(/\.(mp4|webm|mov)$/i) || post.imageUrl.includes('video/upload') ? 
                            <video src={post.imageUrl} controls style={{ width: '100%', borderRadius: '8px', marginBottom: '16px', maxHeight: '500px', backgroundColor: 'black' }} /> :
                            <img src={post.imageUrl} style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }} />
                        )}
                        
                        <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                          <button 
                            onClick={async () => {
                              try {
                                const res = await fetch(`${API_URL}/api/posts/${post.id}/like`, {
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
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: (post.likes || []).some((l:any) => l.userId === (currentUser?.id||1)) ? '#ef4444' : 'var(--text-muted)' }}
                          >
                            <Heart size={18} fill={(post.likes || []).some((l:any) => l.userId === (currentUser?.id||1)) ? '#ef4444' : 'none'} color={(post.likes || []).some((l:any) => l.userId === (currentUser?.id||1)) ? '#ef4444' : 'currentColor'} /> 
                            <span>{(post.likes || []).length}</span>
                          </button>
                          <button 
                            onClick={() => setCommentsModalPostId(post.id)}
                            style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}
                          >
                            <MessageCircle size={18} />
                            <span>{(post.comments || []).length}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            
            {activeView === 'ranking' && (
              <div>
                <h2 style={{ marginBottom: '24px', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={28} color="#f59e0b" /> Dunyoviy Top Reyting</h2>
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                  {[...users].sort((a, b) => {
                    if(a.level==='Bot') return 1; if(b.level==='Bot') return -1; const levelA = a.level === 'Asoschi' ? 1000 : parseInt(a.level || '1');
                    const levelB = b.level === 'Asoschi' ? 1000 : parseInt(b.level || '1');
                    return levelB - levelA;
                  }).map((user: any, index: number) => (
                    <div 
                      key={user.id} 
                      onClick={() => handleProfileView(user)} 
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', 
                        borderBottom: '1px solid var(--border-light)', cursor: 'pointer',
                        background: index === 0 ? '#fffbeb' : index === 1 ? '#f3f4f6' : index === 2 ? '#fff7ed' : 'transparent'
                      }}
                    >
                      <div style={{ fontSize: '20px', fontWeight: 700, color: index === 0 ? '#f59e0b' : index === 1 ? '#9ca3af' : index === 2 ? '#d97706' : 'var(--text-muted)', width: '30px', textAlign: 'center' }}>
                        #{index + 1}
                      </div>
                      <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`} alt="Avatar" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%', border: index < 3 ? `2px solid ${index === 0 ? '#f59e0b' : index === 1 ? '#9ca3af' : '#d97706'}` : 'none' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '16px', margin: '0 0 4px 0' }}>
                          {user.name} {user.isVerified && <VerifiedBadge size={16} />}
                        </h4>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user.username}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="badge" style={{ marginBottom: '4px', display: 'inline-block' }}>{getLevelDisplay(user)}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {user.eduId || `900${user.id}`}</div>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Hali foydalanuvchilar yo'q</div>}
                </div>
              </div>
            )}
            {activeView === 'students' && (
              <div>
                <h2 style={{ marginBottom: '24px', fontSize: '24px' }}>Barcha O'quvchilar</h2>
                <div className="grid-layout">
                  {users.map((user: any) => (
                    <div className="card" key={user.id} onClick={() => handleProfileView(user)} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`} alt="Avatar" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                        <div>
                          <h4 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {user.name} {user.isVerified && <VerifiedBadge size={16} />}
                          </h4>
                          <span className="badge">{getLevelDisplay(user)}</span>
                        </div>
                      </div>
                      <div className="rank-boxes">
                        <div className="rank-box">
                          <div className="rank-label"><Globe size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Global</div>
                          <div className="rank-value">{user.globalRank || '-'}</div>
                        </div>
                        <div className="rank-box">
                          <div className="rank-label"><span style={{ marginRight: '6px' }}>{user.countryFlag || '🇺🇿'}</span> Davlat</div>
                          <div className="rank-value">{user.countryRank || '-'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'settings' && (
              <div>
                <h2 style={{ marginBottom: '24px', fontSize: '24px' }}>Sozlamalar</h2>
                <div className="card" style={{ maxWidth: '600px' }}>
                  <div onClick={() => { setActiveView('edit-profile'); setEditBio(currentUser?.bio || ""); }} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
                    <Edit3 size={20} color="var(--primary-color)" /> <span style={{ fontWeight: 500 }}>Profilni Tahrirlash</span>
                  </div>
                  <div onClick={() => { setActiveView('security'); setOtpSent(false); setOldEmail(""); setOtpCode(""); setNewEmail(""); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); }} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
                    <Shield size={20} color="var(--primary-color)" /> <span style={{ fontWeight: 500 }}>Maxfiylik va Xavfsizlik</span>
                  </div>
                  <div onClick={() => { localStorage.removeItem('token'); setIsAuthenticated(false); setCurrentUser(null); }} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', cursor: 'pointer', color: '#ef4444' }}>
                    <LogOut size={20} /> <span style={{ fontWeight: 500 }}>Tizimdan Chiqish</span>
                  </div>
                </div>
              </div>
            )}

            
            {activeView === 'security' && (
              <div style={{maxWidth: '600px'}}>
                <div style={{marginBottom: '20px'}}>
                   <button onClick={() => setActiveView('settings')} style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)'}}>
                      <ArrowLeft size={16} /> Orqaga
                   </button>
                </div>
                <h2 style={{marginBottom: '24px', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px'}}><Shield size={28} color="var(--primary-color)"/> Maxfiylik va Xavfsizlik</h2>
                
                <div className="card" style={{ marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Emailni o'zgartirish</h3>
                  
                  {!otpSent ? (
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Eski (Joriy) Emailingizni kiriting:</label>
                      <input type="email" value={oldEmail} onChange={e => setOldEmail(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', marginBottom: '16px'}} />
                      <button onClick={async () => {
                        if(!oldEmail) return showToast("Emailni kiriting", "error");
                        try {
                          const res = await fetch(API_URL + '/api/auth/send-otp', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                            body: JSON.stringify({ email: oldEmail })
                          });
                          const data = await res.json();
                          if (data.error) return showToast(data.error, "error");
                          setOtpSent(true);
                          showToast("Kod yuborildi! (Lokal test uchun backend konsolini tekshiring)", "success");
                        } catch(e) { showToast("Xatolik", "error"); }
                      }} style={{background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600}}>Kod yuborish</button>
                    </div>
                  ) : (
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Tasdiqlash kodi (OTP):</label>
                      <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="Misol uchun: 123456" style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', marginBottom: '16px'}} />
                      
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Yangi Email:</label>
                      <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', marginBottom: '16px'}} />
                      
                      <button onClick={async () => {
                        try {
                          const res = await fetch(API_URL + '/api/auth/change-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                            body: JSON.stringify({ oldEmail, otp: otpCode, newEmail })
                          });
                          const data = await res.json();
                          if (data.error) return showToast(data.error, "error");
                          setCurrentUser(data);
                          showToast("Email muvaffaqiyatli o'zgartirildi!", "success");
                          setOtpSent(false); setOldEmail(""); setOtpCode(""); setNewEmail("");
                        } catch(e) { showToast("Xatolik", "error"); }
                      }} style={{background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600}}>Yangi Emailni Saqlash</button>
                    </div>
                  )}
                </div>

                <div className="card">
                  <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Parolni o'zgartirish</h3>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Eski parol:</label>
                  <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', marginBottom: '16px'}} />
                  
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Yangi parol:</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', marginBottom: '16px'}} />
                  
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Yangi parolni takrorlang:</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', marginBottom: '16px'}} />
                  
                  <button onClick={async () => {
                    if (newPassword !== confirmPassword) return showToast("Yangi parollar bir xil emas!", "error");
                    try {
                      const res = await fetch(API_URL + '/api/auth/change-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                        body: JSON.stringify({ oldPassword, newPassword })
                      });
                      const data = await res.json();
                      if (data.error) return showToast(data.error, "error");
                      showToast("Parol muvaffaqiyatli o'zgartirildi!", "success");
                      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
                    } catch(e) { showToast("Xatolik", "error"); }
                  }} style={{background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, width: '100%'}}>Parolni Saqlash</button>
                </div>
              </div>
            )}
            {activeView === 'edit-profile' && (
              <div style={{maxWidth: '600px'}}>
                <div style={{marginBottom: '20px'}}>
                   <button onClick={() => setActiveView('settings')} style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)'}}>
                      <ArrowLeft size={16} /> Orqaga
                   </button>
                </div>
                <h2 style={{marginBottom: '24px', fontSize: '24px'}}>Profilni Tahrirlash</h2>
                
                <div className="card">
                  <div style={{marginBottom: '16px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Ism va Familiya</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', fontSize: '15px'}} />
                  </div>
                  <div style={{marginBottom: '16px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Username</label>
                    <input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', fontSize: '15px'}} />
                  </div>
                  <div style={{marginBottom: '16px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Bio (O'zingiz haqingizda)</label>
                    <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="O'zingiz haqingizda qisqacha ma'lumot yozing (emojilar mumkin 🚀)..." style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', fontSize: '15px', minHeight: '80px', fontFamily: 'inherit'}} />
                  </div>
                  <div style={{marginBottom: '24px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Rasm yuklash</label>
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                      <img src={editAvatar} alt="Preview" style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-light)'}} />
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)'}} />
                    </div>
                  </div>

                  <div style={{marginBottom: '32px', padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid var(--border-light)'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Yutuqlar qo'shish</label>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px'}}>
                      <input type="text" value={newAchievement} onChange={(e) => setNewAchievement(e.target.value)} placeholder="Masalan: IELTS, IT Sertifikat, Maktab Baholari..." style={{padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)', outline: 'none'}} />
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <input type="file" accept="image/*" onChange={handleAchievementImageUpload} style={{flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '13px'}} />
                        {newAchievementImage && <img src={newAchievementImage} alt="Preview" style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-light)'}} />}
                        <button onClick={() => { if(newAchievement) { setEditAchievements([...editAchievements, {id: Date.now(), title: newAchievement, image: newAchievementImage}]); setNewAchievement(""); setNewAchievementImage(""); } }} style={{background: 'var(--text-main)', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500}}>Qo'shish</button>
                      </div>
                    </div>
                    {editAchievements.map((ach: any) => (
                      <div key={ach.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'white', borderRadius: '6px', border: '1px solid var(--border-light)', marginBottom: '4px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          {ach.image && <img src={ach.image} alt={ach.title} style={{width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px'}} />}
                          <span>{ach.title}</span>
                        </div>
                        <span onClick={() => setEditAchievements(editAchievements.filter(a => a.id !== ach.id))} style={{color: '#ef4444', cursor: 'pointer', fontWeight: 600}}>✕</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={handleSaveProfile} style={{background: 'var(--primary-color)', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, width: '100%'}}>
                    Saqlash
                  </button>
                </div>
              </div>
            )}

            {activeView === 'messages' && (
              <div>
                <h2 style={{ marginBottom: '24px', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><MessageCircle size={28} /> Xabarlar va Shikoyatlar</h2>
                <div className="card" style={{ padding: '24px', minHeight: '400px' }}>
                  {botMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '100px' }}>
                      <MessageCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                      <p>Hozircha xabarlar yo'q</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {botMessages.map((msg: any) => (
                        <div key={msg.id} style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ color: '#b91c1c' }}>Educal Bot</strong>
                            <span style={{ fontSize: '12px', color: '#991b1b' }}>{new Date(msg.createdAt).toLocaleString()}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-line', color: '#7f1d1d', lineHeight: '1.5' }}>DIQQAT! Shikoyat:\nKIMDAN: {msg.reporter?.name}\nKIMGA NISBATAN: {msg.reportedUser?.name}\nSABAB: {msg.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === 'profile' && selectedUser && (
              <div>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setActiveView('students')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}
                  >
                    <ArrowLeft size={16} /> Orqaga
                  </button>
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <MoreHorizontal size={24} />
                    </button>
                    {showMenu && (
                      <div style={{ position: 'absolute', top: '30px', right: '0', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '8px', zIndex: 100, width: '220px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {selectedUser.username !== currentUser.username && (
                            <button 
                              onClick={() => {
                                setPromptDialog({
                                  msg: `${selectedUser.name} ustidan nima sababdan shikoyat qilyapsiz?`,
                                  val: "",
                                  onConfirm: (reason) => {
                                    fetch(API_URL + '/api/reports', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                                      body: JSON.stringify({ reportedId: selectedUser.id, reason })
                                    });
                                    showToast("Shikoyatingiz adminga yuborildi!", "success");
                                    setShowMenu(false);
                                  }
                                });
                              }}
                              style={{ textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', fontWeight: 500, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }} className="nav-item"
                            >
                              <AlertTriangle size={16} /> Shikoyat qilish (Report)
                            </button>
                          )}
                          {currentUser.eduId === '1000001' && (
                            <>
                              <div style={{ borderTop: '1px solid var(--border-light)', margin: '4px 0' }}></div>
                              <button 
                                onClick={() => {
                                  setPromptDialog({
                                    msg: "Foydalanuvchi darajasi (Level)ni kiriting:",
                                    val: selectedUser.level || '1',
                                    onConfirm: async (val) => {
                                      try {
                                        await fetch(`${API_URL}/api/users/${selectedUser.id}/level`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                                          body: JSON.stringify({ level: val })
                                        });
                                        const newSelected = {...selectedUser, level: val};
                                        setSelectedUser(newSelected);
                                        setUsers(users.map(u => u.id === newSelected.id ? newSelected : u));
                                        setShowMenu(false);
                                        showToast("Level yangilandi", "success");
                                      } catch (e) { showToast("Xatolik yuz berdi", "error"); }
                                    }
                                  });
                                }}
                                style={{ textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }} className="nav-item"
                              >
                                <TrendingUp size={16} /> Level Tahrirlash
                              </button>
                              <button 
                                onClick={async () => {
                                  try {
                                    const action = selectedUser.isVerified ? 'olib tashlandi' : 'berildi';
                                    const newStatus = !selectedUser.isVerified;
                                    await fetch(`${API_URL}/api/users/${selectedUser.id}/verify`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                                      body: JSON.stringify({ isVerified: newStatus })
                                    });
                                    const newSelected = {...selectedUser, isVerified: newStatus};
                                    setSelectedUser(newSelected);
                                    setUsers(users.map((u: any) => u.id === newSelected.id ? newSelected : u));
                                    showToast(`Foydalanuvchiga galichka ${action}!`, "success");
                                    setShowMenu(false);
                                  } catch (e) {}
                                }}
                                style={{ textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#0095F6', display: 'flex', alignItems: 'center', gap: '8px' }} className="nav-item"
                              >
                                {selectedUser.isVerified ? <><XCircle size={16} /> Galichkani Olib Tashlash</> : <><BadgeCheck size={16} /> Galichka Berish</>}
                              </button>
                              <button 
                                onClick={() => {
                                  setConfirmDialog({
                                    msg: "Rostan ham bu akkountni o'chirmoqchimisiz?",
                                    onConfirm: () => {
                                      showToast("Akkount o'chirildi!", "success");
                                      setShowMenu(false);
                                    }
                                  });
                                }}
                                style={{ textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }} className="nav-item"
                              >
                                <Trash2 size={16} /> Akkountni O'chirish
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="profile-cover"></div>
                <div className="profile-info-box">
                  <img src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name || 'User')}&background=random`} alt="Avatar" className="profile-large-avatar" />

                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 style={{ fontSize: '28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {selectedUser.name} {selectedUser.isVerified && <VerifiedBadge size={28} />}
                      </h2>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
                        {selectedUser.username} <span style={{ marginLeft: '12px', padding: '2px 8px', background: '#f3f4f6', borderRadius: '12px', fontSize: '14px', border: '1px solid var(--border-light)' }}>ID: {selectedUser.eduId || `900${selectedUser.id}`}</span>
                      </p>
                      {selectedUser.bio && <p style={{ color: 'var(--text-main)', fontSize: '15px', marginTop: '8px', marginBottom: '12px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{selectedUser.bio}</p>}
                      <span className="badge">{getLevelDisplay(selectedUser)}</span>
                      <div style={{ display: 'flex', gap: '24px', fontSize: '14px', marginTop: '16px' }}>
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
                    )}

                    {selectedUser.username === currentUser.username && (
                      <button 
                        onClick={() => { setActiveView('edit-profile'); setEditBio(currentUser?.bio || ""); }}
                        style={{
                          background: '#f9fafb', 
                          color: 'var(--text-main)', 
                          padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                          border: '1px solid var(--border-light)',
                          height: 'fit-content'
                        }}
                      >
                        Profilni Tahrirlash
                      </button>
                    )}
                  </div>

                  <div className="rank-boxes" style={{ marginTop: '32px', maxWidth: '500px' }}>
                    <div className="rank-box">
                      <div className="rank-label"><Globe size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Global</div>
                      <div className="rank-value">{selectedUser.level === 'Asoschi' ? 1 : Math.max(1, 1000 - parseInt(selectedUser.level||'1') * 5)}</div>
                    </div>
                    <div className="rank-box">
                      <div className="rank-label"><span style={{ marginRight: '6px' }}>{selectedUser.countryFlag || '🇺🇿'}</span>O'quvchilari</div>
                      <div className="rank-value">{selectedUser.followedBy?.length || 0}</div>
                    </div>
                    <div className="rank-box">
                      <div className="rank-label"><MapPin size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Yutuqlari</div>
                      <div className="rank-value">{selectedUser.achievements?.filter((a:any)=>a.title!=='Educal Yaratuvchisi').length || 0}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '40px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Trophy size={20} color="var(--primary-color)" /> Rasmiy Yutuqlar
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {selectedUser.eduId === '1000001' && (
                        <div style={{ background: '#f9fafb', border: '1px solid var(--border-light)', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', fontWeight: 500, minWidth: '140px', textAlign: 'center' }}>
                          <CheckCircle2 size={32} color="#10b981" />
                          <span style={{ fontSize: '14px', lineHeight: '1.4' }}>Educal Yaratuvchisi</span>
                        </div>
                      )}
                      
                      {selectedUser.achievements && selectedUser.achievements.filter((a:any) => a.title !== 'Educal Yaratuvchisi').map((ach: any) => (
                        <div key={ach.id} style={{ background: '#f9fafb', border: '1px solid var(--border-light)', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', fontWeight: 500, minWidth: '140px', textAlign: 'center' }}>
                          {ach.image ? (
                            <img src={ach.image} alt={ach.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                          ) : (
                            <CheckCircle2 size={32} color="#10b981" />
                          )}
                          <span style={{ fontSize: '14px', lineHeight: '1.4' }}>{ach.title}</span>
                        </div>
                      ))}
                      
                      {(!selectedUser.achievements || selectedUser.achievements.length === 0) && selectedUser.eduId !== '1000001' && (
                        <p style={{ color: 'var(--text-muted)', width: '100%' }}>Hali rasmiy yutuqlar kiritilmagan.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
          
          {commentsModalPostId && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCommentsModalPostId(null)}>
              <div style={{ background: 'var(--bg-card)', width: '400px', maxHeight: '80vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontWeight: 600 }}>Fikrlar</h3>
                  <button onClick={() => setCommentsModalPostId(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
                </div>
                <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(posts.find(p => p.id === commentsModalPostId)?.comments || []).map((c: any) => (
                    <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
                      <img 
                        src={c.user?.avatar || `https://ui-avatars.com/api/?name=${c.user?.name}&background=random`} 
                        style={{ width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover' }} 
                        onClick={() => { handleProfileView(c.user); setCommentsModalPostId(null); }}
                      />
                      <div>
                        <strong 
                          style={{ cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => { handleProfileView(c.user); setCommentsModalPostId(null); }}
                        >
                          {c.user?.name} {c.user?.isVerified && <VerifiedBadge size={14} />}
                        </strong>
                        <div style={{ fontSize: '13px', marginTop: '2px' }}>{c.text}</div>
                      </div>
                    </div>
                  ))}
                  {(posts.find(p => p.id === commentsModalPostId)?.comments || []).length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Fikrlar yo'q</div>
                  )}
                </div>
                <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Fikr qoldirish..."
                    value={commentText[commentsModalPostId] || ""}
                    onChange={e => setCommentText({...commentText, [commentsModalPostId]: e.target.value})}
                    style={{ flex: 1, padding: '10px 16px', borderRadius: '20px', border: '1px solid var(--border-light)', outline: 'none', fontSize: '14px' }}
                  />
                  <button 
                    onClick={async () => {
                      if (!commentText[commentsModalPostId]) return;
                      try {
                        const res = await fetch(`${API_URL}/api/posts/${commentsModalPostId}/comments`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                          body: JSON.stringify({ userId: currentUser?.id || 1, text: commentText[commentsModalPostId] })
                        });
                        const newC = await res.json();
                        setPosts(posts.map(p => p.id === commentsModalPostId ? { ...p, comments: [...(p.comments||[]), newC] } : p));
                        setCommentText({...commentText, [commentsModalPostId]: ""});
                      } catch(e) {}
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
                  >
                    Yuborish
                  </button>
                </div>
              </div>
            </div>
          )}
          {toast && (
            <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#10b981' : '#3b82f6', color: 'white', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999, fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {toast.msg}
            </div>
          )}

          {confirmDialog && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', width: '320px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>Tasdiqlash</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>{confirmDialog.msg}</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setConfirmDialog(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, padding: '8px 16px', borderRadius: '8px' }}>Bekor qilish</button>
                  <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '8px 16px', borderRadius: '8px' }}>Tasdiqlash</button>
                </div>
              </div>
            </div>
          )}

          {promptDialog && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', width: '320px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>Ma'lumot kiritish</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '14px' }}>{promptDialog.msg}</p>
                <input 
                  type="text" 
                  autoFocus
                  value={promptDialog.val}
                  onChange={e => setPromptDialog({...promptDialog, val: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '8px', marginBottom: '24px', outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setPromptDialog(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, padding: '8px 16px', borderRadius: '8px' }}>Bekor qilish</button>
                  <button onClick={() => { promptDialog.onConfirm(promptDialog.val); setPromptDialog(null); }} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '8px 16px', borderRadius: '8px' }}>Saqlash</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
