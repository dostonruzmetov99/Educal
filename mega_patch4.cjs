const fs = require('fs');
let code = fs.readFileSync('D:/EduSphere/src/App.tsx', 'utf8');

const oldNav = `<div className="nav-menu">
          <div
            className={\`nav-item \${activeView === 'dashboard' ? 'active' : ''}\`}
            onClick={() => setActiveView('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Asosiy Ekran</span>
          </div>
          <div
            className={\`nav-item \${activeView === 'students' ? 'active' : ''}\`}
            onClick={() => setActiveView('students')}
          >
            <Users size={20} />
            <span>O'quvchilar</span>
          </div>
          <div
            className={\`nav-item \${activeView === 'ranking' ? 'active' : ''}\`}
            onClick={() => setActiveView('ranking')}
          >
            <Trophy size={20} />
            <span>Top Reyting</span>
          </div>
          <div
            className={\`nav-item \${activeView === 'settings' ? 'active' : ''}\`}
            onClick={() => setActiveView('settings')}
          >
            <Settings size={20} />
            <span>Sozlamalar</span>
          </div>
          <div
            className={\`nav-item \${activeView === 'messages' ? 'active' : ''}\`}
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
        </div>`;

const newNav = `<div className="nav-menu">
          <div
            className={\`nav-item \${activeView === 'dashboard' ? 'active' : ''}\`}
            onClick={() => setActiveView('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Asosiy Ekran</span>
          </div>
          <div
            className={\`nav-item \${activeView === 'messages' ? 'active' : ''}\`}
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
          <div
            className={\`nav-item \${activeView === 'ranking' ? 'active' : ''}\`}
            onClick={() => setActiveView('ranking')}
          >
            <Trophy size={20} />
            <span>Top Reyting</span>
          </div>
          <div
            className={\`nav-item \${activeView === 'settings' ? 'active' : ''}\`}
            onClick={() => setActiveView('settings')}
          >
            <Settings size={20} />
            <span>Sozlamalar</span>
          </div>
        </div>`;

code = code.replace(oldNav, newNav);

fs.writeFileSync('D:/EduSphere/src/App.tsx', code);
console.log('Nav menu updated successfully.');
