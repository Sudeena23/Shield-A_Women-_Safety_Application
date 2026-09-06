const fs = require('fs');
const files = [
  'c:/Users/DELL/OneDrive/Desktop/Project/Shield/frontend/src/pages/Auth.jsx',
  'c:/Users/DELL/OneDrive/Desktop/Project/Shield/frontend/src/pages/UserSettings.jsx',
  'c:/Users/DELL/OneDrive/Desktop/Project/Shield/frontend/src/components/AuthModal.jsx',
  'c:/Users/DELL/OneDrive/Desktop/Project/Shield/frontend/src/components/ProtectedRoute.jsx'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Remove block comments /* ... */ and JSX comments {/* ... */}
  content = content.replace(/\{?\/\*[\s\S]*?\*\/\}?/g, '');
  // Remove single line comments // ... but be careful with URLs like http://
  content = content.replace(/(?<![:\"\'\`])\/\/.*$/gm, '');
  // Remove empty lines created by comment deletion
  content = content.replace(/^\s*[\r\n]/gm, '');
  fs.writeFileSync(file, content);
}
console.log("Done");
