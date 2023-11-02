const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * @param {ChildProcess} ls 
 */
function getStdInfo(process) {
    return new Promise((resolve, reject) => {
        let log = '';
        process.stdout.on('data', (data) => {
            log += data;
        });

        let err = '';
        process.stderr.on('data', (data) => {
            err += data;
        });

        process.on('close', (code) => {
            if (err) {
                reject(new Error(err));
            } else {
                resolve(log);
            }
        });
    })
}

function getGitDir(_path = path.resolve('.'), gitDirs = []) {
    if (fs.existsSync(_path) && fs.statSync(_path).isDirectory()) {
        const _git = path.resolve(_path, '.git');
        if (fs.existsSync(_git) && fs.statSync(_git).isDirectory()) {
            gitDirs.push(_path);
        } else {
            fs.readdirSync(_path).forEach((dir) => getGitDir(path.resolve(_path, dir), gitDirs));
        }
    }
    return gitDirs;
}

/**
 * 寻找当前目录GIT库更新
 */
(async () => {
    const urls = getGitDir();
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        try {
            console.log(`cd ${url} && git pull --all`);
            process.chdir(url);
            const log = await getStdInfo(spawn('git', ['pull', '--all']));
            console.log(`${log}`);
        } catch (e) {
            console.error(e.message);
        }
    }
})();