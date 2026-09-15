const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
c = c.replace(/.*?nimo/g, 'Ánimo');
fs.writeFileSync('src/App.jsx', c, 'utf8');
