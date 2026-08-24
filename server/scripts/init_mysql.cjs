const { execSync } = require('child_process');

try {
  console.log('Testing MySQL CLI connection with --protocol=tcp...');
  const cmd = `C:\\xampp\\mysql\\bin\\mysql.exe --protocol=tcp -h 127.0.0.1 -u root -e "CREATE DATABASE IF NOT EXISTS soutarah_group; SHOW DATABASES;"`;
  const output = execSync(cmd, { encoding: 'utf8', timeout: 5000 });
  console.log('SUCCESS! Output:\n', output);
} catch (err) {
  console.error('ERROR executing mysql CLI:', err.message);
  if (err.stdout) console.log('STDOUT:', err.stdout);
  if (err.stderr) console.log('STDERR:', err.stderr);
}
