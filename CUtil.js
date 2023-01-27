import path from "path";
import fs from "fs";
import os from "os";
import util from "util";
import sj from "shelljs";
import md5File from "md5-file";
import shellExec from "./shellExec.js";
import { promisify } from 'util'

const CUtil = {};
CUtil.freespaceOk = async (limit) => {
  const state = { volume: 0, state: false }
  let list = (await CUtil.getDiskInfo(true)).filter(dt => dt.path === os.homedir())
  if (list.length === 1) {
    state.volume = list[0].size
    state.state = state.volume > limit
  }
  return state;
}
CUtil.which = async function (name) {
  if (!CUtil.isProperPath(name)) return;
  let res = await CUtil.exec(`which "${name}"`);
  return res.stdout.trim();
}
CUtil.removeDSpaces = function (str) {
  while (str.indexOf("  ") !== -1) {
    str = str.split("  ").join(" ");
  }
  return str;
}
CUtil.getDiskInfo = async function (includehome) {
  if (os.type() !== 'Darwin') return [];
  return await new Promise((r) => {
    sj.exec("df -m", { silent: true }, function (code, stdout, err) {
      let lines = stdout.trim().split("\n");
      lines = lines
        .map((line, i) => {
          if (i === 0) return;
          let vd = CUtil.removeDSpaces(line).split(" ");
          if (vd.length !== 9) return;
          if (!(vd[8] === "/" || vd[8].startsWith("/Volumes/"))) return;
          return { path: vd[8], size: Number(vd[3]) };
        })
        .filter(Boolean);
      let list = lines.filter((info) => info.path === "/");
      let homepath = os.homedir();
      if (list.length) {
        list[0].path = homepath;
        if (includehome) {
          let aasd = [];
          let homepath = os.homedir();
          let listd = fs.readdirSync(homepath);
          for (let name of listd) {
            let pt = homepath + '/' + name;
            if (!CUtil.isDir(pt)) continue;
            if (!CUtil.isFile(pt + '/.kstutil.json')) continue;
            aasd.push(pt);
          }
          aasd.push(homepath + '/' + 'Downloads')
          aasd.push(homepath + '/' + 'Documents')
          aasd.push(homepath + '/' + 'Desktop')
          aasd.push(homepath + '/' + 'SYSTEMLOGMOV')
          aasd.push(homepath + '/' + 'SYSTEMLOGKEN')
          list[0].spaces = aasd;
        }
      }
      if (!includehome) lines = lines.filter(info => info.path !== homepath);
      for (let ds of lines) {
        if (ds.path !== homepath) {
          ds.spaces = [
            ds.path,
            ds.path + '/SYSTEMLOGMOV',
            ds.path + '/SYSTEMLOGKEN',
          ];
        }
      }
      r(lines);
    });
  });
}
CUtil.isProperPath = function (pathd) {
  try {//shelljs 에서 커맨드에 포함시킬 경로는 주의해서 다뤄야한다.
    if (pathd.constructor === String || pathd.constructor === Number) {
      pathd = `${pathd}`;
      return pathd.indexOf(`"`) === -1 && pathd.indexOf(`\\`) === -1;
    }
  } catch { }
  return false;
};
CUtil.rmpath = async function (ds) {
  if (!CUtil.isProperPath(ds)) return;
  await CUtil.exec(`rm -rf "${ds}"`);
}
CUtil.isDir = function (path) {
  if (!path) return false;
  if (!CUtil.isProperPath(path)) return false;
  try {
    return fs.statSync(path).isDirectory();
  } catch { }
};
CUtil.isFile = function (path) {
  try {
    return fs.statSync(path).isFile();
  } catch { }
  return false;
};
CUtil.getTmpPath = function () {
  while (true) {
    let dsf = path.normalize(`${os.homedir()}/.tempwork.${Math.random()}/`);
    try {
      fs.statSync(dsf);
    } catch {
      fs.mkdirSync(dsf);
      return dsf;
    }
  }
};
CUtil.exec = function (cmd) {
  return new Promise((rr) => {
    sj.exec(cmd, { silent: true }, function (code, stdout, err) {
      rr({ code, stdout });
    });
  });
};
CUtil.makeFullPath = function (tpath, force) {
  if (!tpath) return;
  if (!force && tpath[0] === "/") return path.normalize(tpath);
  return path.normalize(`${process.cwd()}/${tpath}`);
};
export default CUtil;
