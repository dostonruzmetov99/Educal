const fs = require('fs');
let code = fs.readFileSync('D:\\EduSphere\\server\\index.ts', 'utf8');

const matchStart = code.indexOf("app.put('/api/users/profile', authMiddleware, async (req: any, res: any) => {");
const matchEnd = code.indexOf("});", code.indexOf("res.status(500).json({ error: \"Profilni saqlashda xatolik.\" });")) + 3;

if (matchStart !== -1 && matchEnd !== -1) {
  const newBlock = `app.put('/api/users/profile', authMiddleware, async (req: any, res: any) => {
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
});`;

  code = code.substring(0, matchStart) + newBlock + code.substring(matchEnd);
  fs.writeFileSync('D:\\EduSphere\\server\\index.ts', code);
  console.log("Fixed syntax error");
} else {
  console.log("Could not find block");
}
