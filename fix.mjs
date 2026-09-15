import fs from 'fs';
import { globSync } from 'glob';

const files = globSync('src/**/*.{jsx,js}');
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  
  // Replace the specific UTF-8 decoding errors the user introduced
  c = c.replace(/Ã¡/g, 'á');
  c = c.replace(/Ã©/g, 'é');
  c = c.replace(/Ã­/g, 'í');
  c = c.replace(/Ã³/g, 'ó');
  c = c.replace(/Ãº/g, 'ú');
  c = c.replace(/Ã±/g, 'ñ');
  c = c.replace(/Ã\?/g, 'Á'); // Capital A with accent sometimes comes as single character
  c = c.replace(/Â¿/g, '¿');
  c = c.replace(/Â¡/g, '¡');
  c = c.replace(/â€¢/g, '•');
  c = c.replace(/Ãš/g, 'Ú');

  // Also replace some of my own powershell manglings if they exist
  c = c.replace(/sesin/g, 'sesión');
  c = c.replace(/opcin/g, 'opción');
  c = c.replace(/aadir/g, 'añadir');
  c = c.replace(/Aadir/g, 'Añadir');
  c = c.replace(/Ttulo/g, 'Título');
  c = c.replace(/Duracin/g, 'Duración');
  c = c.replace(/categora/g, 'categoría');
  c = c.replace(/tambiǸn/g, 'también');
  c = c.replace(/cmo/g, 'cómo');
  c = c.replace(/automǭticos/g, 'automáticos');
  c = c.replace(/compaero/g, 'compañero');
  c = c.replace(/Aǧn/g, 'Aún');
  c = c.replace(/todava/g, 'todavía');
  c = c.replace(/snete/g, 'Únete');
  c = c.replace(/Electrnico/g, 'Electrónico');
  c = c.replace(/Contrasea/g, 'Contraseña');
  c = c.replace(/Regstrate/g, 'Regístrate');
  c = c.replace(/Listo!/g, '¡Registro exitoso!');
  c = c.replace(/Tiempo cumplido!/g, '¡Tiempo cumplido!');
  c = c.replace(/Hazme clic!/g, '¡Hazme clic!');
  c = c.replace(/No tenǸis cuenta\? /g, '¿No tienes cuenta? ');
  c = c.replace(/Ya tenǸis cuenta\? /g, '¿Ya tienes cuenta? ');
  c = c.replace(/No tenǸs cuenta\? /g, '¿No tienes cuenta? ');
  c = c.replace(/Ya tenǸs cuenta\? /g, '¿Ya tienes cuenta? ');
  c = c.replace(/No tienes cuenta\? /g, '¿No tienes cuenta? ');
  c = c.replace(/Ya tienes cuenta\? /g, '¿Ya tienes cuenta? ');
  
  c = c.replace(/Personalizǭ tu refugio pa' que estǸis lo mǭs cmodo posible/g, 'Personaliza tu refugio para trabajar cómodamente');
  c = c.replace(/Aad una arriba pa' empezar a darle caa/g, 'Añade una nueva tarea arriba para comenzar');
  c = c.replace(/Hubo un peo, revisǭ tus datos/g, 'Ha ocurrido un error. Verifica tus datos e intenta de nuevo');
  c = c.replace(/inicia sesin de una/g, 'inicia sesión directamente');
  
  // Specific symbol fixes
  c = c.replace(/\u0007/g, '•'); // Special character bell to bullet
  c = c.replace(/\?\"/g, '—'); // Weird hyphen replacement
  c = c.replace(/\?rbol/g, 'Árbol');
  c = c.replace(/mtico/g, 'mítico');
  c = c.replace(/csmico/g, 'cósmico');
  c = c.replace(/Retoo/g, 'Retoño');
  c = c.replace(/decado/g, 'decaído');
  c = c.replace(/Estǭs/g, 'Estás');
  c = c.replace(/hidrǭtate/g, 'hidrátate');
  c = c.replace(/mǧsculos/g, 'músculos');
  c = c.replace(/energa/g, 'energía');
  c = c.replace(/MantǸn/g, 'Mantén');
  c = c.replace(/continǧa/g, 'continúa');
  c = c.replace(/atencin/g, 'atención');
  c = c.replace(/ConcǸntrate/g, 'Concéntrate');
  c = c.replace(/Estadsticas/g, 'Estadísticas');
  c = c.replace(/An/g, 'Aún');
  c = c.replace(/todava/g, 'todavía');
  c = c.replace(/Ttulo/g, 'Título');
  c = c.replace(/Duracin/g, 'Duración');
  c = c.replace(/categora/g, 'categoría');
  c = c.replace(/Aadir/g, 'Añadir');
  c = c.replace(/Aad/g, 'Añade');
  c = c.replace(/caa/g, 'caña');
  c = c.replace(/aqu/g, 'aquí');
  c = c.replace(/sesin/g, 'sesión');
  c = c.replace(/opcin/g, 'opción');
  c = c.replace(/compaero/g, 'compañero');

  // Fix remaining literal slang that might not be mangled
  c = c.replace(/pa' confirmar/g, 'para confirmar');
  c = c.replace(/inicia sesión de una/g, 'inicia sesión directamente');
  c = c.replace(/pa' empezar a darle caña/g, 'para comenzar');
  c = c.replace(/Hubo un peo, revisá tus datos/g, 'Ha ocurrido un error. Verifica tus datos e intenta de nuevo');
  c = c.replace(/Personalizá tu refugio pa' que estéis lo más cómodo posible/g, 'Personaliza tu refugio para trabajar cómodamente');
  c = c.replace(/Añadí una arriba pa' empezar a darle caña/g, 'Añade una nueva tarea arriba para comenzar');

  fs.writeFileSync(f, c, 'utf8');
});
console.log('done');
