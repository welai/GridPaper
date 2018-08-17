const fs = require('fs');
const exec = require('child_process').exec;

// NPM install first
exec('npm install').on('close', () => {

    console.log('Running tsc...')
    exec('webpack', (err, stdout, stderr) => {
        if(err) throw err;
        console.log('TypeScript files compiled.')
    });

    console.log('Copying paper.js...')
    fs  .createReadStream('node_modules/paper/dist/paper-full.min.js')
        .on('error', err => { throw err })
        .pipe(fs.createWriteStream('doc/js/paper.js').on('error', err => { throw err }))
        .on('close', () => console.log('Paper.js copied.'))
})

    
