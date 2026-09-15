import fs from 'fs';
import { globSync } from 'glob';

const files = globSync('src/**/*.{jsx,js}');
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/[^\x00-\x7F]nimo/g, 'Ánimo');
  c = c.replace(/nimo/g, 'Ánimo');
  c = c.replace(/ÁÁnimo/g, 'Ánimo');
  c = c.replace(/Â·/g, '•');
  c = c.replace(/Ã¡/g, 'á');
  c = c.replace(/Ã©/g, 'é');
  c = c.replace(/Ã­/g, 'í');
  c = c.replace(/Ã³/g, 'ó');
  c = c.replace(/Ãº/g, 'ú');
  c = c.replace(/Ã±/g, 'ñ');
  c = c.replace(/Ã\?/g, 'Á'); 
  c = c.replace(/Â¿/g, '¿');
  c = c.replace(/Â¡/g, '¡');
  c = c.replace(/â€¢/g, '•');
  c = c.replace(/Ãš/g, 'Ú');
  c = c.replace(/Ã\x81/g, 'Á'); // C3 81
  c = c.replace(/Ã\xAD/g, 'í');
  c = c.replace(/Ã\xB3/g, 'ó');
  
  // also fix some mangled symbols we saw earlier
  c = c.replace(/\?nimo/g, 'Ánimo');
  c = c.replace(/\?\"/g, '—');
  c = c.replace(/\?rbol/g, 'Árbol');
  c = c.replace(/\?\?/g, '•');
  
  fs.writeFileSync(f, c, 'utf8');
});
console.log('done');
