import os, { homedir } from "os";
import fs from "fs";
import md5File from "md5-file";
import CUtil from "./CUtil.js";
import shellExec from "./shellExec.js";
const homeitms = `
AWSInst
MEMO.txt
SYSTEMLOGKEN
SYSTEMLOGMOV
alidel
aligomonitor
chkalive
computerkanri
dandockmonitor
devnoda
encfile
filejong
filesearch
gifenc.sh
hypergames
hypergw
keyvalue
modifyappleversion
pem
pnb_control
police
pull_yeu_code.py
remove_tele_gabage.py
upload107.sh
videologsmaller
yeujudge
zipping_adv_z005.py
zipping_z005.py
`.trim().split('\n');

const isItem = (path) => CUtil.isDir(path) || CUtil.isFile(path);
const getBackupFilename = async () => {
  let result = await shellExec(`ls pchomebackup.*.tar`, { cwd: os.homedir() })
  let list = result.stdout.trim().split('\n').filter(Boolean)
  if (list.length === 1) return list[0]
  return null
}
const removing = async () => {
  let cmds = []
  cmds.push(`rm -rf "${os.homedir()}/Desktop/androidWork/"`);
  cmds.push(`rm -rf "${os.homedir()}/pchome"`);
  for (const name of homeitms) cmds.push(`rm -rf "${os.homedir()}/${name}"`)
  await shellExec(cmds.join(' && '))
}
const main = async () => {
  await removing();
  const backupfile = await getBackupFilename()
  if (!backupfile) {
    console.log('There should be pchomebackup tar file in home directory before doing it')
    return;
  }
  await removing();
  let hash = await md5File(os.homedir() + '/' + backupfile)
  if (backupfile.split('.')[2] !== hash) {
    console.log('Backup file looks broken')
    return;
  }
  console.log('hash:', hash);
  console.log('backupfile:', backupfile);
  if ((await shellExec(`tar xfp "${backupfile}"`, { cwd: os.homedir() })).code !== 0) {
    console.log('untar fail')
    return;
  } else { console.log('untar ok', await CUtil.freespaceOk(10000)) }
  if (!CUtil.isDir(`${os.homedir()}/pchome`)) {
    console.log('There is no pchome dir in homedir')
    return;
  }
  for (const name of homeitms) {
    if (!isItem(`${os.homedir()}/pchome/${name}`)) continue
    if (isItem(`${os.homedir()}/${name}`)) await shellExec(`rm -rf "${os.homedir()}/${name}"`)
    fs.renameSync(`${os.homedir()}/pchome/${name}`, `${os.homedir()}/${name}`)
  }
  CUtil.isFile(`${os.homedir()}/pchome/.DS_Store`) && fs.unlinkSync(`${os.homedir()}/pchome/.DS_Store`)
  let left = fs.readdirSync(`${os.homedir()}/pchome`)
  if (left.length !== 1) {
    console.log('There should be only one item in pchome dir after renaming work')
    return;
  }
  let src = `${os.homedir()}/pchome/${left[0]}`
  let dst = `${os.homedir()}/Desktop/${left[0]}`
  if (CUtil.isDir(dst)) {
    console.log('There should not be androidWork dir in Desktop')
    return;
  }
  fs.renameSync(src, dst)
  fs.rmdirSync(`${os.homedir()}/pchome`)
  if (!(await CUtil.freespaceOk(10000)).state) {
    await removing();
    console.log('Not enough space')
  } else {
    CUtil.isFile(`${os.homedir()}/${backupfile}`) && fs.unlinkSync(`${os.homedir()}/${backupfile}`)
    console.log('success')
  }
}
await main();
