import fs from "fs";
import { promisify } from "util";
import { spawn } from 'node:child_process'
let runnerPath;
let executer = ['bash', 'zsh'];
const advExec = async (...argv) => {
  if (argv.length === 0) return {};
  let cwd, stdin, ignorestdout;
  if (argv[argv.length - 1].constructor === Object) {
    let opt = argv.splice(argv.length - 1, 1)[0];
    if (opt?.cwd?.constructor === String) cwd = opt.cwd;
    if (opt?.stdin?.constructor === String) stdin = opt.stdin;
    if (opt?.ignorestdout?.constructor === Boolean) ignorestdout = opt.ignorestdout;
  }
  let command = argv.splice(0, 1)[0];
  const ls = spawn(command, argv, { cwd });
  if (stdin?.constructor === String) {
    ls.stdin.write(stdin)
    ls.stdin.end()
  }
  return await new Promise((resolve, reject) => {
    let stdout = [];
    let stderr = [];
    !ignorestdout && ls.stdout.on('data', (data) => !ignorestdout && stdout.push(data.toString()))
    !ignorestdout && ls.stderr.on('data', (data) => !ignorestdout && stderr.push(data.toString()))
    ls.on('close', (code) => resolve({ code, stderr: stderr.join(''), stdout: stdout.join('') }));
    ls.on('exit', (code) => { });
    ls.on('error', (code) => { });
    ls.on('spawn', (code) => { });
    ls.on('disconnect', (code) => { });
  })
};
const shellExec = async (stdin, cwd) => {
  let ignorestdout;
  if (cwd && cwd.constructor === Object) {
    let args = cwd;
    ignorestdout = args.ignorestdout;
    cwd = args.cwd;
  }
  if (cwd && !await promisify(fs.exists)(cwd)) return {};
  if (!runnerPath) {
    for (let name of executer) {
      let result = await advExec('which', name);
      if (result.code !== 0) continue;
      runnerPath = result.stdout.trim();
      break;
    }
    if (!runnerPath) return {};
  }
  return await advExec(runnerPath, { stdin, cwd, ignorestdout })
}
export default shellExec;

/*
[사용법]
  console.log(await shellExec('pwd', '/Users/kst'))
  console.log(await shellExec('pwd'))
  console.log(await shellExec('ls nothing && pwd'))
  console.log(await shellExec('pwd\npwd'))
*/