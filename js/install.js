"use strict"

const cp = require( 'child_process' );
const fs = require( 'fs' );
const cmd = `
@echo off
node "%~dp0\\node_modules\\zsolution\\z.js"   %*
`;

var install = function() {
    cp.execSync( `npm unlink zsolution` );
    cp.execSync( `npm link zsolution` );

    if ( process.platform == "win32" ) {
        fs.writeFile( process.env.APPDATA + '\\npm\\z.cmd', cmd, { encoding: 'utf8', flag: 'w+' }, ( err ) => {
            if ( err ) throw err;
            console.log( 'zsolution installed.' )
        } );
    }
}

install();
