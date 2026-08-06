const fs = require('fs');
let css = fs.readFileSync('D:/EduSphere/src/index.css', 'utf8');

// 1. Fix body overflow hidden issue
css = css.replace(/overflow:\s*hidden;/g, 'overflow-x: hidden;\n  overflow-y: auto;'); 

// 3. Fix input width in mobile edit profile
css += `
@media (max-width: 768px) {
  .dashboard-container {
    height: auto;
    min-height: 100vh;
  }
  .main-area {
    padding-bottom: 80px;
    height: auto !important;
    overflow: visible !important;
  }
  .content-scroll {
    overflow: visible !important;
    height: auto !important;
  }
  .top-header {
    padding: 0 16px;
  }
  input[type="text"], input[type="password"], textarea, input[type="file"] {
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
