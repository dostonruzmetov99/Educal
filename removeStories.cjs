const fs = require('fs');

// 1. Update App.tsx
let appContent = fs.readFileSync('D:\\EduSphere\\src\\App.tsx', 'utf8');

// Remove story states
appContent = appContent.replace(/  const \[stories, setStories\] = useState<any\[\]>\(\[\]\);\n/g, '');
appContent = appContent.replace(/  const storyInputRef = React\.useRef<HTMLInputElement>\(null\);\n/g, '');

// Remove fetch('/api/stories') inside useEffect
const storyFetchRegex = /    fetch\('http:\/\/localhost:5000\/api\/stories'\)[\s\S]*?setStories\(data\); \}\);\n/g;
appContent = appContent.replace(storyFetchRegex, '');

// Remove UI section
const storyUIRegex = /[ \t]*\{\/\* Stories Section \*\/\}[\s\S]*?(?=<div className="card" style=\{\{ marginBottom: '24px' \}\}>)/g;
appContent = appContent.replace(storyUIRegex, '');

fs.writeFileSync('D:\\EduSphere\\src\\App.tsx', appContent);


// 2. Update server/index.ts
let serverContent = fs.readFileSync('D:\\EduSphere\\server\\index.ts', 'utf8');
const serverStoryRegex1 = /\/\/ API: Storislarini olish[\s\S]*?res\.json\(stories\);\n\}\);\n/g;
const serverStoryRegex2 = /\/\/ API: Yangi Story qo'shish[\s\S]*?res\.status\(500\)\.json\(\{ error: "Storiya yaratishda xatolik" \}\);\n  \}\n\}\);\n/g;
serverContent = serverContent.replace(serverStoryRegex1, '');
serverContent = serverContent.replace(serverStoryRegex2, '');
fs.writeFileSync('D:\\EduSphere\\server\\index.ts', serverContent);

// 3. Update schema.prisma
let schemaContent = fs.readFileSync('D:\\EduSphere\\server\\prisma\\schema.prisma', 'utf8');
const schemaStoryFieldRegex = /  stories      Story\[\]\n/g;
const schemaStoryModelRegex = /model Story \{[\s\S]*?\}\n/g;
schemaContent = schemaContent.replace(schemaStoryFieldRegex, '');
schemaContent = schemaContent.replace(schemaStoryModelRegex, '');
fs.writeFileSync('D:\\EduSphere\\server\\prisma\\schema.prisma', schemaContent);

console.log("Stories removed completely.");
