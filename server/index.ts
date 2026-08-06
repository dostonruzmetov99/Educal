import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-educal';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Multer and Uploads configuration (Cloudinary + Local Fallback)
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
const upload = multer({ storage });


// Auth Middleware
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
};

// --- XAVFSIZLIK API (OTP, Email, Parol) ---
const otpStore = new Map<number, { code: string, expires: number }>();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'test@gmail.com',
    pass: process.env.SMTP_PASS || 'test'
  }
});

app.post('/api/auth/send-otp', authMiddleware, async (req: any, res: any) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (user?.email !== email) return res.status(400).json({ error: "Kiritilgan eski email sizning joriy emailingiz emas." });
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(req.userId, { code, expires: Date.now() + 5 * 60 * 1000 }); // 5 minutes
    
    console.log("===============================");
    console.log("OTP KOD:", code); // Test qilish uchun konsolga chiqaramiz
    console.log("===============================");
    
    // Agar real pochtaga yuborish kerak bo'lsa:
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'test@gmail.com') {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'EduSphere - Email tasdiqlash kodi',
        text: `Sizning tasdiqlash kodingiz: ${code}`
      });
    }
    
    res.json({ success: true, message: "Kod yuborildi (Test uchun konsolga ham chiqdi)" });
  } catch (error) {
    res.status(500).json({ error: "Kod yuborishda xatolik" });
  }
});

app.post('/api/auth/change-email', authMiddleware, async (req: any, res: any) => {
  try {
    const { oldEmail, otp, newEmail } = req.body;
    const store = otpStore.get(req.userId);
    
    if (!store || store.code !== otp || Date.now() > store.expires) {
      return res.status(400).json({ error: "Kod noto'g'ri yoki eskirgan." });
    }
    
    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) return res.status(400).json({ error: "Bu yangi email band." });
    
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { email: newEmail }
    });
    
    otpStore.delete(req.userId);
    res.json(updated);
  } catch(error) {
    res.status(500).json({ error: "Email o'zgartirishda xatolik" });
  }
});

app.post('/api/auth/change-password', authMiddleware, async (req: any, res: any) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    
    const isValid = await bcrypt.compare(oldPassword, user?.password || "");
    if (!isValid) return res.status(400).json({ error: "Eski parol noto'g'ri." });
    
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashed }
    });
    
    res.json({ success: true });
  } catch(error) {
    res.status(500).json({ error: "Parol o'zgartirishda xatolik" });
  }
});



// API: Fayl yuklash (Upload)
app.post('/api/upload', authMiddleware, upload.single('file'), async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Fayl yuborilmadi" });
    
    const formData = new FormData();
    formData.append('image', req.file.buffer.toString('base64'));
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
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
});

// API: Ro'yxatdan o'tish (Register)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username: email }] } });
    if (existing) return res.status(400).json({ error: "Bu email yoki username band." });

    const hashedPassword = await bcrypt.hash(password, 10);
    let eduId = Math.floor(1000000 + Math.random() * 9000000).toString(); 
    let level = '1';
    if (email === 'donykimg@gmail.com' || email === 'admin@gmail.com') {
      eduId = '1000001';
      level = 'Asoschi';
    }
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username: email.split('@')[0] + Math.floor(Math.random() * 1000), 
        password: hashedPassword,
        eduId,
        level,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f3f4f6&color=9ca3af&size=150`
      },
      include: { achievements: true, followedBy: true, followingRel: true }
    });

    const token = jwt.sign({ userId: user.id, level: user.level }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: "Ro'yxatdan o'tishda xatolik." });
  }
});

// API: Tizimga kirish (Login)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { username: email }] },
      include: { achievements: true, followedBy: true, followingRel: true }
    });
    
    if (!user) return res.status(404).json({ error: "Foydalanuvchi topilmadi." });

    const isValid = await bcrypt.compare(password, user.password || "");
    if (!isValid) return res.status(401).json({ error: "Parol noto'g'ri." });

    if ((user.email === 'donykimg@gmail.com' || user.email === 'admin@gmail.com') && user.eduId !== '1000001') {
       await prisma.user.update({ where: { id: user.id }, data: { eduId: '1000001', level: 'Asoschi' } });
       user.eduId = '1000001';
       user.level = 'Asoschi';
    }

    const token = jwt.sign({ userId: user.id, level: user.level }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: "Tizimga kirishda xatolik." });
  }
});

// API: Joriy foydalanuvchini olish (F5 uchun)
app.get('/api/auth/me', authMiddleware, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { achievements: true, followedBy: true, followingRel: true }
    });
    if (!user) return res.status(404).json({ error: "Foydalanuvchi topilmadi." });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Xatolik yuz berdi." });
  }
});

// API: Profilni tahrirlash
app.put('/api/users/profile', authMiddleware, async (req: any, res: any) => {
  try {
    const { name, username, avatar, achievements, bio } = req.body;
    
    const oldAchievements = await prisma.achievement.findMany({ where: { userId: req.userId } });
    await prisma.achievement.deleteMany({ where: { userId: req.userId } });
    
    let user = await prisma.user.findUnique({ where: { id: req.userId } });
    let currentLevel = parseInt(user?.level || '1');
    if (isNaN(currentLevel)) currentLevel = 1;
    let newLevel = currentLevel;
    
    const oldImages = new Set(oldAchievements.map((a: any) => a.image));
    let hasNew = false;
    let lastTitle = "";

    for (const ach of achievements) {
      if (!oldImages.has(ach.image)) {
         hasNew = true;
         lastTitle = ach.title;
      }
    }
    
    if (hasNew) {
       const founder = await prisma.user.findFirst({ where: { eduId: '1000001' } });
       if (founder) {
         await prisma.report.create({
           data: {
             reporterId: req.userId,
             reportedId: req.userId,
             reason: "DIQQAT YANGI YUTUQ! Foydalanuvchi: " + user?.name + " (" + user?.username + "). Yutuq nomi: " + lastTitle + ". Profiliga kirib rasmini tekshiring va munosib ko'rgan Levelni bering."
           }
         });
       }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        name,
        username,
        avatar,
        bio,
        level: user?.level === 'Asoschi' ? 'Asoschi' : newLevel.toString(),
        achievements: {
          create: achievements.map((a: any) => ({ title: a.title, image: a.image, levelValue: parseInt(a.levelValue || a.value) || 1 }))
        }
      },
      include: { achievements: true, followedBy: true, followingRel: true }
    });
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Profilni saqlashda xatolik." });
  }
});

// API: Qidiruv (Search)
app.get('/api/users/search', authMiddleware, async (req: any, res: any) => {
  try {
    const query = req.query.q as string;
    if (!query) return res.json([]);
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { username: { contains: query } },
          { eduId: { contains: query } }
        ]
      },
      include: { achievements: true, followedBy: true, followingRel: true }
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: "Xatolik" });
  }
});

// API: Barcha o'quvchilarni olish
app.get('/api/users', authMiddleware, async (req, res) => {
  const users = await prisma.user.findMany({
    include: { achievements: true, followedBy: true, followingRel: true }
  });
  res.json(users);
});

// API: User levelni yangilash
app.put('/api/users/:id/level', authMiddleware, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const { level } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { level: level.toString() }
    });
    res.json(user);
  } catch(error) {
    res.status(500).json({ error: "Level yangilashda xatolik" });
  }
});

// API: Galichka (isVerified) yangilash
app.put('/api/users/:id/verify', authMiddleware, async (req: any, res: any) => {
  try {
    const admin = await prisma.user.findUnique({ where: { id: req.userId } });
    if (admin?.eduId !== '1000001' && admin?.level !== 'Asoschi') {
      return res.status(403).json({ error: "Ruxsat yo'q. Faqat asoschi buni qila oladi." });
    }
    const id = parseInt(req.params.id);
    const { isVerified } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { isVerified }
    });
    res.json(user);
  } catch(error) {
    res.status(500).json({ error: "Galichka yangilashda xatolik" });
  }
});

// API: Userni o'chirish
app.delete('/api/users/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    if (req.userId !== userId) {
      const caller = await prisma.user.findUnique({ where: { id: req.userId } });
      if (caller?.eduId !== '1000001') {
        return res.status(403).json({ error: "Ruxsat yo'q" });
      }
    }
    
    await prisma.like.deleteMany({ where: { userId } });
    await prisma.comment.deleteMany({ where: { userId } });
    await prisma.achievement.deleteMany({ where: { userId } });
    await prisma.follow.deleteMany({ where: { OR: [{ followerId: userId }, { followingId: userId }] } });
    await prisma.report.deleteMany({ where: { OR: [{ reporterId: userId }, { reportedId: userId }] } });
    await prisma.message.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } });

    const userPosts = await prisma.post.findMany({ where: { userId } });
    const postIds = userPosts.map(p => p.id);
    if (postIds.length > 0) {
      await prisma.like.deleteMany({ where: { postId: { in: postIds } } });
      await prisma.comment.deleteMany({ where: { postId: { in: postIds } } });
      await prisma.post.deleteMany({ where: { userId } });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: "Akkountni o'chirishda xatolik" });
  }
});

// API: Obuna bo'lish / Bekor qilish
app.post('/api/users/:id/follow', authMiddleware, async (req: any, res: any) => {
  try {
    const followingId = parseInt(req.params.id);
    const followerId = req.userId;
    
    if (followerId === followingId) return res.status(400).json({ error: "O'zingizga obuna bo'la olmaysiz" });

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } }
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      res.json({ following: false });
    } else {
      await prisma.follow.create({ data: { followerId, followingId } });
      res.json({ following: true });
    }
  } catch (e) {
    res.status(500).json({ error: "Xatolik" });
  }
});

// API: Shikoyat (Report) yaratish
app.post('/api/reports', authMiddleware, async (req: any, res: any) => {
  try {
    const { reportedId, reason } = req.body;
    const report = await prisma.report.create({
      data: { reporterId: req.userId, reportedId, reason },
      include: { reporter: true, reportedUser: true }
    });
    res.json(report);
  } catch (e) {
    res.status(500).json({ error: "Report yaratishda xatolik" });
  }
});

// API: Shikoyatlarni olish
app.get('/api/reports', authMiddleware, async (req: any, res: any) => {
  try {
    if (req.level !== 'Asoschi') return res.status(403).json({ error: "Ruxsat yo'q" });
    const reports = await prisma.report.findMany({ include: { reporter: true, reportedUser: true }, orderBy: { createdAt: 'desc' } });
    res.json(reports);
  } catch(e) {
    res.status(500).json({ error: "Xatolik" });
  }
});

// API: Barcha postlarni olish
app.get('/api/posts', authMiddleware, async (req, res) => {
  const posts = await prisma.post.findMany({
    include: { user: true, likes: true, comments: { include: { user: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(posts);
});


// API: Yangi post yaratish
app.post('/api/posts', authMiddleware, async (req: any, res: any) => {
  try {
    const { content, imageUrl } = req.body;
    const post = await prisma.post.create({
      data: {
        content,
        userId: req.userId,
        imageUrl
      },
      include: { user: true, likes: true, comments: { include: { user: true } } }
    });
    res.json(post);
  } catch(e) {
    res.status(500).json({ error: "Post yaratishda xatolik" });
  }
});

// API: Postni o'chirish
app.delete('/api/posts/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: "Post topilmadi" });
    
    await prisma.comment.deleteMany({ where: { postId } });
    await prisma.like.deleteMany({ where: { postId } });
    await prisma.post.delete({ where: { id: postId } });
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: "Post o'chirishda xatolik" });
  }
});

// API: Postga Like bosish/olish
app.post('/api/posts/:id/like', authMiddleware, async (req: any, res: any) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.userId;
    
    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId } }
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return res.json({ liked: false });
    } else {
      await prisma.like.create({ data: { postId, userId } });
      return res.json({ liked: true });
    }
  } catch(e) {
    res.status(500).json({ error: "Like bosishda xatolik" });
  }
});

// API: Postga Comment yozish
app.post('/api/posts/:id/comments', authMiddleware, async (req: any, res: any) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.userId;
    const { text } = req.body;
    const comment = await prisma.comment.create({
      data: { postId, userId, text },
      include: { user: true }
    });
    res.json(comment);
  } catch(e) {
    res.status(500).json({ error: "Comment yozishda xatolik" });
  }
});

// API: Commentni o'chirish
app.delete('/api/posts/:postId/comments/:commentId', authMiddleware, async (req: any, res: any) => {
  try {
    const commentId = parseInt(req.params.commentId);
    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: "Commentni o'chirishda xatolik" });
  }
});


app.post('/api/init', async (req, res) => {
  const existing = await prisma.user.findFirst({ where: { level: 'Asoschi' } });
  if (!existing) {
    const adminPassword = process.env.ADMIN_PASSWORD as string;
    if (!adminPassword) throw new Error("ADMIN_PASSWORD is not set in .env");
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        name: "Dostonbek Ruzmatov",
        username: "@d_ruzmatov",
        email: "donykimg@gmail.com",
        password: hashedPassword,
        level: "Asoschi",
        eduId: "1000001",
        isVerified: true,
        globalRank: "1", countryRank: "1", regionRank: "1",
        achievements: {
          create: [{ title: "Educal Yaratuvchisi" }]
        }
      }
    });
  }
  res.json({ message: "Asoschi profili tayyor!" });
});

app.listen(PORT, () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
});
