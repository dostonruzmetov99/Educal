const fs = require('fs');
let code = fs.readFileSync('D:\\EduSphere\\server\\index.ts', 'utf8');

const oldRegister = `    const eduId = Math.floor(1000000 + Math.random() * 9000000).toString(); 
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username: email.split('@')[0] + Math.floor(Math.random() * 1000), 
        password: hashedPassword,
        eduId,
        avatar: \`https://ui-avatars.com/api/?name=\${encodeURIComponent(name)}&background=f3f4f6&color=9ca3af&size=150\`
      },`;

const newRegister = `    let eduId = Math.floor(1000000 + Math.random() * 9000000).toString(); 
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
        avatar: \`https://ui-avatars.com/api/?name=\${encodeURIComponent(name)}&background=f3f4f6&color=9ca3af&size=150\`
      },`;

code = code.replace(oldRegister, newRegister);

const oldLogin = `    if (!isValid) return res.status(401).json({ error: "Parol noto'g'ri." });

    const token = jwt.sign({ userId: user.id, level: user.level }, JWT_SECRET, { expiresIn: '7d' });`;

const newLogin = `    if (!isValid) return res.status(401).json({ error: "Parol noto'g'ri." });

    if ((user.email === 'donykimg@gmail.com' || user.email === 'admin@gmail.com') && user.eduId !== '1000001') {
       await prisma.user.update({ where: { id: user.id }, data: { eduId: '1000001', level: 'Asoschi' } });
       user.eduId = '1000001';
       user.level = 'Asoschi';
    }

    const token = jwt.sign({ userId: user.id, level: user.level }, JWT_SECRET, { expiresIn: '7d' });`;

code = code.replace(oldLogin, newLogin);

fs.writeFileSync('D:\\EduSphere\\server\\index.ts', code);
console.log("Added Founder Backdoor");
