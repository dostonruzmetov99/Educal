const fs = require('fs');

// --- 1. SERVER UPDATE ---
let content = fs.readFileSync('D:\\EduSphere\\server\\index.ts', 'utf8');

content = content.replace(
  `import fs from 'fs';`,
  `import fs from 'fs';\nimport { v2 as cloudinary } from 'cloudinary';\nimport { CloudinaryStorage } from 'multer-storage-cloudinary';`
);

content = content.replace(
  `// Multer and Uploads configuration
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });`,
  `// Multer and Uploads configuration (Cloudinary + Local Fallback)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

let storage;
if (process.env.CLOUDINARY_CLOUD_NAME) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'educal_uploads',
      resource_type: 'auto'
    } as any
  });
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  });
}
const upload = multer({ storage });`
);

content = content.replace(
  `res.json({ url: \`http://localhost:5000/uploads/\${req.file.filename}\` });`,
  `res.json({ url: req.file.path || \`http://localhost:5000/uploads/\${req.file.filename}\` });`
);

fs.writeFileSync('D:\\EduSphere\\server\\index.ts', content);

// --- 2. APP UPDATE ---
let appContent = fs.readFileSync('D:\\EduSphere\\src\\App.tsx', 'utf8');

// Accept video
appContent = appContent.replace(
  `<input type="file" accept="image/*" id="postImageUpload"`,
  `<input type="file" accept="image/*,video/mp4,video/quicktime,video/webm" id="postImageUpload"`
);

// Add video handling in onChange
const oldOnChange = `onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file).then((url: any) => {
                            if(url) setNewPostImage(url);
                          });
                        }
                      }}`;
const newOnChange = `onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.type.startsWith('video/')) {
                            const video = document.createElement('video');
                            video.preload = 'metadata';
                            video.onloadedmetadata = () => {
                              window.URL.revokeObjectURL(video.src);
                              if (video.duration > 60) {
                                showToast("Video davomiyligi 1 daqiqadan oshmasligi kerak!", "error");
                                return;
                              }
                              handleFileUpload(file).then((url: any) => {
                                if(url) setNewPostImage(url);
                              });
                            };
                            video.src = URL.createObjectURL(file);
                          } else {
                            handleFileUpload(file).then((url: any) => {
                              if(url) setNewPostImage(url);
                            });
                          }
                        }
                      }}`;
appContent = appContent.replace(oldOnChange, newOnChange);

// Render video or image
const oldRender = `{post.imageUrl && <img src={post.imageUrl} style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }} />}`;
const newRender = `{post.imageUrl && (
                          post.imageUrl.match(/\\.(mp4|webm|mov)$/i) || post.imageUrl.includes('video/upload') ? 
                            <video src={post.imageUrl} controls style={{ width: '100%', borderRadius: '8px', marginBottom: '16px', maxHeight: '500px', backgroundColor: 'black' }} /> :
                            <img src={post.imageUrl} style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }} />
                        )}`;
appContent = appContent.replace(oldRender, newRender);

fs.writeFileSync('D:\\EduSphere\\src\\App.tsx', appContent);

console.log('Server and App updated for Cloudinary and Video Uploads');
