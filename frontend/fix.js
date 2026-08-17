const fs = require('fs');
const path = require('path');
const dirs = ['integrations', 'organizations', 'roles', 'security'];
dirs.forEach(d => {
  const p = path.join('src/app/(dashboard)/super-admin', d, 'page.tsx');
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/@\/components\/ToastContainer/g, '@/components/ui/Toast');
    c = c.replace(/toast\("error", /g, 'toast.error("Error", ');
    c = c.replace(/toast\("success", /g, 'toast.success("Success", ');
    fs.writeFileSync(p, c);
  }
});
console.log('Done');
