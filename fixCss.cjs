const fs = require('fs');
let css = fs.readFileSync('D:/EduSphere/src/index.css', 'utf8');

// 1. Fix body overflow hidden issue
css = css.replace('body {\n  font-family: \\'Outfit\\', sans-serif;\n  background: var(--bg-main);\n  color: var(--text-main);\n  overflow: hidden;\n}', 'body {\n  font-family: \\'Outfit\\', sans-serif;\n  background: var(--bg-main);\n  color: var(--text-main);\n  overflow-x: hidden;\n}');
css = css.replace('overflow: hidden;', 'overflow-x: hidden;'); // Fallback replace

// 2. Add overflow-y: auto to content area
if (!css.includes('overflow-y: auto')) {
  css = css.replace('.content-scroll {', '.content-scroll {\n  overflow-y: auto;\n  padding-bottom: 100px;'); // padding for mobile nav
}

// 3. Fix input width in mobile edit profile
css += `
@media (max-width: 768px) {
  .dashboard-container {
    height: auto;
    min-height: 100vh;
  }
  .main-area {
    padding-bottom: 80px; /* Space for mobile bottom nav */
  }
  .top-header {
    padding: 0 16px;
  }
  input[type="text"], input[type="password"], textarea {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box;
  }
  .card {
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }
  .profile-stats {
    flex-wrap: wrap;
  }
  .profile-stats-card {
    flex: 1 1 100%;
    margin-bottom: 10px;
  }
}
`;

fs.writeFileSync('D:/EduSphere/src/index.css', css);
console.log('CSS fixed.');
