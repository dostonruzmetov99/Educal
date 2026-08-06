const fs = require('fs');
let code = fs.readFileSync('D:\\EduSphere\\src\\App.tsx', 'utf8');

// Ensure all inputs only accept images
code = code.replaceAll('accept="image/*,video/*"', 'accept="image/*"');
code = code.replaceAll("accept='image/*,video/*'", 'accept="image/*"');
// Also maybe there is some video rendering code? 
// <video controls src={post.imageUrl} ... />?
// If it exists, let's leave it. If users upload new things it will be images anyway.

fs.writeFileSync('D:\\EduSphere\\src\\App.tsx', code);
console.log("Frontend inputs fixed for images only");
