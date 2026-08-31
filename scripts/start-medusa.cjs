const { spawn } = require('child_process');
const path = require('path');

const medusaBin = path.join(__dirname, '..', 'backend', 'medusa-app', 'node_modules', '.bin', 'medusa.cmd');
const cwd = path.join(__dirname, '..', 'backend', 'medusa-app', 'apps', 'backend');

console.log('Launching Medusa v2 from:', cwd);
console.log('Medusa binary:', medusaBin);

const child = spawn(medusaBin, ['develop'], {
  cwd,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: '9000',
    MEDUSA_BACKEND_URL: 'http://localhost:9000'
  }
});

child.on('error', (err) => {
  console.error('Failed to start Medusa:', err);
});

child.on('exit', (code, signal) => {
  console.log(`Medusa process exited with code ${code} and signal ${signal}`);
});
