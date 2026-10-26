import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const children = [
  spawn(process.execPath, ['server/passkey-server.mjs'], { cwd: root, stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5175', '--strictPort'], { cwd: root, stdio: 'inherit' }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (child.exitCode === null) child.kill('SIGTERM');
  setTimeout(() => process.exit(code), 250).unref();
}
for (const child of children) child.on('exit', (code) => { if (!stopping && code !== 0) stop(code ?? 1); });
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));



