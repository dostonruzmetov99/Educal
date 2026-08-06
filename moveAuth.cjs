const fs = require('fs');
let code = fs.readFileSync('D:\\EduSphere\\server\\index.ts', 'utf8');

const authMid = `// Auth Middleware
const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token topilmadi" });
  
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Token noto'g'ri formatda" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    req.level = decoded.level;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Yaroqsiz token" });
  }
};`;

// Remove existing authMiddleware
code = code.replace(authMid, "");

// Insert it above XAVFSIZLIK API
code = code.replace('// --- XAVFSIZLIK API (OTP, Email, Parol) ---', authMid + '\n\n// --- XAVFSIZLIK API (OTP, Email, Parol) ---');

fs.writeFileSync('D:\\EduSphere\\server\\index.ts', code);
console.log("Moved authMiddleware");
