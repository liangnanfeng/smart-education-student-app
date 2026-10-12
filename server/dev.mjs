import { spawn } from 'node:child_process'
import { join } from 'node:path'

const root = process.cwd()
const viteCli = join(root, 'node_modules', 'vite', 'bin', 'vite.js')
const forwardedArgs = process.argv.slice(2)

const proxy = spawn(process.execPath, [join(root, 'server', 'ai-proxy.mjs')], {
  cwd: root,
  env: process.env,
  stdio: 'inherit',
})

const web = spawn(process.execPath, [viteCli, ...forwardedArgs], {
  cwd: root,
  env: process.env,
  stdio: 'inherit',
})

let stopping = false

function stop(exitCode = 0) {
  if (stopping) return
  stopping = true
  if (!proxy.killed) proxy.kill()
  if (!web.killed) web.kill()
  process.exitCode = exitCode
}

proxy.on('exit', (code) => {
  if (!stopping && code !== 0) stop(code ?? 1)
})

web.on('exit', (code) => stop(code ?? 0))
process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
