const { spawn } = require('child_process');
const path = require('path');

const cliJs = path.join(__dirname, '..', 'backend', 'medusa-app', 'node_modules', '@medusajs', 'cli', 'cli.js');
const cwd = path.join(__dirname, '..', 'backend', 'medusa-app', 'apps', 'backend');

console.log('Launching Medusa CLI from:', cwd);
console.log('Medusa CLI file:', cliJs);

const child = spawn(process.execPath, [cliJs, 'develop'], {
  cwd,
  env: {
    ...process.env,
    PORT: '9000',
    MEDUSA_BACKEND_URL: 'http://localhost:9000'
  }
});

child.stdout.on('data', (d) => process.stdout.write(d));
child.stderr.on('data', (d) => process.stderr.write(d));

child.on('error', (err) => {
  console.error('Failed to start Medusa:', err);
});

child.on('exit', (code, signal) => {
  console.log(`Medusa process exited with code ${code} and signal ${signal}`);
});
