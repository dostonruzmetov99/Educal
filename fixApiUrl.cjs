const fs = require('fs');
let code = fs.readFileSync('D:\\EduSphere\\src\\App.tsx', 'utf8');

if (!code.includes('const API_URL = import.meta.env.VITE_API_URL')) {
    code = code.replace('export default function App() {', "const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';\n\nexport default function App() {");
}

code = code.replaceAll("'http://localhost:5000", "API_URL + '");
code = code.replaceAll('"http://localhost:5000', 'API_URL + "');
code = code.replaceAll('`http://localhost:5000', '`${API_URL}');

fs.writeFileSync('D:\\EduSphere\\src\\App.tsx', code);
console.log("Replaced localhost with API_URL");
