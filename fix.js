const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/**/*.jsx');
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/Ã¡||ǭ||/g, 'á');
  c = c.replace(/Ã©|Ǹ/g, 'é');
  c = c.replace(/Ã|/g, 'í');
  c = c.replace(/Ã³/g, 'ó');
  c = c.replace(/Ãº|ǧ/g, 'ú');
  c = c.replace(/Ã±||/g, 'ñ');
  c = c.replace(/Ã|\?/g, 'Á');
  c = c.replace(/Â¿/g, '¿');
  c = c.replace(/Â¡/g, '¡');
  c = c.replace(/â€¢|\x07/g, '•');
  c = c.replace(/Ãš/g, 'Ú');
  c = c.replace(/usestte/g, 'useState');
  c = c.replace(//g, 'o'); // Fallback for some broken o's
  
  // Specific word fixes
  c = c.replace(/Sesin|sesin/g, 'sesión');
  c = c.replace(/Aad/g, 'Añad');
  c = c.replace(/aqu/g, 'aquí');
  c = c.replace(/Ttulo/g, 'Título');
  c = c.replace(/Duracin/g, 'Duración');
  c = c.replace(/categora/g, 'categoría');
  c = c.replace(/ms cmodo/g, 'más cómodo');
  c = c.replace(/tambin/g, 'también');
  c = c.replace(/cmo/g, 'cómo');
  c = c.replace(/automticos/g, 'automáticos');
  c = c.replace(/compaero/g, 'compañero');
  c = c.replace(/An/g, 'Aún');
  c = c.replace(/todava/g, 'todavía');
  c = c.replace(/nete/g, 'Únete');
  c = c.replace(/Electrnico/g, 'Electrónico');
  c = c.replace(/Contrasea/g, 'Contraseña');
  c = c.replace(/Regstrate/g, 'Regístrate');
  c = c.replace(/Listo!/g, '¡Listo!');
  c = c.replace(/Tiempo cumplido!/g, '¡Tiempo cumplido!');
  c = c.replace(/Hazme clic!/g, '¡Hazme clic!');
  c = c.replace(/No tienes cuenta\? /g, '¿No tienes cuenta? ');
  c = c.replace(/Ya tienes cuenta\? /g, '¿Ya tienes cuenta? ');
  
  // TasksPanel specific
  c = c.replace(/pa' empezar a darle caa/g, 'para comenzar');
  c = c.replace(/pa' confirmar la cuenta/g, 'para confirmar la cuenta');
  c = c.replace(/inicia sesión de una/g, 'inicia sesión directamente');
  c = c.replace(/pa' que trabajes/g, 'para que trabajes');
  
  // StatsPanel specific
  c = c.replace(/completadas •1/g, 'completadas += 1');
  c = c.replace(/perdidas •1/g, 'perdidas += 1');
  c = c.replace(/c.completadas •c.perdidas •0/g, 'c.completadas + c.perdidas > 0');
  c = c.replace(/completadas •perdidas •ra/g, 'completadas o perdidas para');
  c = c.replace(/ResponsiveContAner/g, 'ResponsiveContainer');
  c = c.replace(/c.completadas •c.perdidas/g, 'c.completadas + c.perdidas');
  c = c.replace(/c.completadas •total/g, 'c.completadas / total');
  
  // Companion
  c = c.replace(/posicin/g, 'posición');
  c = c.replace(/ratn/g, 'ratón');
  c = c.replace(/pequeo/g, 'pequeño');
  
  // TaskSession
  c = c.replace(/curso • ciclo/g, 'curso • ciclo');
  c = c.replace(/cumplido \?" agrega tiempo o cierra/g, 'cumplido — agrega tiempo o cierra');

  fs.writeFileSync(f, c, 'utf8');
});
console.log('done');
