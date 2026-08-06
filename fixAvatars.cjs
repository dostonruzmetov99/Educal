const fs = require('fs');
let code = fs.readFileSync('D:\\EduSphere\\src\\App.tsx', 'utf8');

// Fix pravatar instances to use ui-avatars based on the object's name
code = code.replace(/https:\/\/i\.pravatar\.cc\/150\?u=\$\{([^}]+)\.id\}/g, "https://ui-avatars.com/api/?name=${encodeURIComponent($1.name || 'User')}&background=random");

// Fix instances where there is NO fallback (like currentUser.avatar)
code = code.replaceAll('src={currentUser.avatar}', 'src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || "User")}&background=random`}');
code = code.replaceAll('src={selectedUser.avatar}', 'src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name || "User")}&background=random`}');

fs.writeFileSync('D:\\EduSphere\\src\\App.tsx', code);
console.log("Avatars fixed");
