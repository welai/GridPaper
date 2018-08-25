const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

const args = process.argv.slice(2)
let releaseFlag = args.indexOf('release') >= 0;

let paperjsDir = 'node_modules/paper/dist/';
var paperjs = path.resolve(paperjsDir, 'paper-full.js');

// Modifications need to be done when release flag is used
if(releaseFlag) {
    paperjs = path.resolve(paperjsDir, 'paper-full.min.js');
}

var run = cmd => new Promise((resolve, reject) => {
    let childProcess = exec(cmd, (err, stdout, stderr) => {
        let errMsg = err? stdout? stderr? null: stderr: stdout: err;
        console.log(stdout);
        console.log(stderr);
        if(errMsg) reject(`${errMsg}`);
        resolve(childProcess);
    })
})

console.log('Bundling .ts files...');
run('webpack')
.then(() => {
    console.log('Bundling done.');
})
.then(() => {
    console.log('Copying paper.js...');
    fs  .createReadStream(paperjs)
        .on('error', err => { throw err })
        .pipe(fs.createWriteStream('doc/js/paper.js', {flags: 'w'}).on('error', err => { throw err }))
        .on('close', () => console.log('Paper.js copied.'));
})
.catch(err => console.log(err));
