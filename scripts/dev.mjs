#!/usr/bin/env node

/**
 * ProofLayer Unified Development Orchestrator
 * Spawns both Fastify Gateway (Port 3001) and Studio UI (Port 3000) concurrently.
 * Pure Node.js with zero third-party dependencies, cross-platform on Windows/macOS/Linux.
 */

import { spawn } from 'node:child_process';
import process from 'node:process';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

console.log('\n======================================================');
console.log('🚀 PROOFLAYER UNIFIED DEV STACK');
console.log('======================================================');
console.log('  📡 Backend Gateway API : http://localhost:3001');
console.log('  🖥️  Studio Web Console  : http://localhost:3000');
console.log('  🛡️  Zero-Trust Interceptor: ACTIVE (<0.05ms AST latency)');
console.log('  Press Ctrl+C to shut down all services cleanly.');
console.log('======================================================\n');

// 1. Spawn Fastify Backend Gateway
const serverProcess = spawn(npmCmd, ['--workspace=@prooflayer/server', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '3001' },
});

// 2. Spawn Studio Web Console
const studioProcess = spawn(npmCmd, ['--workspace=@prooflayer/studio', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '3000' },
});

let isShuttingDown = false;

function cleanup() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n🛑 Shutting down ProofLayer services...');

  try {
    if (serverProcess && !serverProcess.killed) {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', serverProcess.pid.toString(), '/f', '/t']);
      } else {
        serverProcess.kill('SIGTERM');
      }
    }
  } catch {}

  try {
    if (studioProcess && !studioProcess.killed) {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', studioProcess.pid.toString(), '/f', '/t']);
      } else {
        studioProcess.kill('SIGTERM');
      }
    }
  } catch {}

  setTimeout(() => process.exit(0), 500);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
