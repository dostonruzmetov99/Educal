const fs = require('fs');
let env = fs.readFileSync('D:\\EduSphere\\server\\.env', 'utf8');
if (!env.includes('IMGBB_API_KEY')) {
  env += '\nIMGBB_API_KEY="962cc8f3a7ba9c7da61a45c33fd98efa"\n';
  fs.writeFileSync('D:\\EduSphere\\server\\.env', env);
}

let code = fs.readFileSync('D:\\EduSphere\\server\\index.ts', 'utf8');

// Replace multer storage
const oldStorage = `const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});`;

const newStorage = `const storage = multer.memoryStorage();`;
code = code.replace(oldStorage, newStorage);

// Replace upload endpoint
const oldUploadEndpoint = `app.post('/api/upload', authMiddleware, upload.single('file'), (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: "Fayl yuborilmadi" });
  res.json({ url: req.file.path || \`http://localhost:5000/uploads/\${req.file.filename}\` });
});`;

const newUploadEndpoint = `app.post('/api/upload', authMiddleware, upload.single('file'), async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Fayl yuborilmadi" });
    
    const formData = new FormData();
    formData.append('image', req.file.buffer.toString('base64'));
    
    const response = await fetch(\`https://api.imgbb.com/1/upload?key=\${process.env.IMGBB_API_KEY}\`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    if (data.success) {
      res.json({ url: data.data.url });
    } else {
      res.status(500).json({ error: "Rasm yuklashda xatolik (ImgBB API)" });
    }
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Server xatosi" });
  }
});`;

code = code.replace(oldUploadEndpoint, newUploadEndpoint);

fs.writeFileSync('D:\\EduSphere\\server\\index.ts', code);
console.log("ImgBB configured!");
