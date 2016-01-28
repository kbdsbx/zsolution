"use strict"

const fs = require( 'fs' );
const rl = require( 'readline-sync' );
const cr = require( 'crypto' );

var operator = {
    // folder path;
    path: '',
    // setting sub-folder;
    deep: false,
    // remove all of repeated files;
    remove: false,
}

var _setting_folder = function ( path ) {
    var path_end = path.substr( -1, 1 );
    fs.readdir( path, ( err, files ) => {
        if ( err ) { throw err; }
        var res = new Object();
        files.forEach( ( f ) => {
            f = path + ( path_end == '/' || path_end == '\\' ? f : '\\' + f );

            if ( operator.deep && fs.statSync( f ).isDirectory() ) {
                _setting_folder( f, deep );
                return;
            }

            const input = fs.createReadStream( f );
            const hash = cr.createHash( 'sha256' );
            input.on( 'readable', () => {
                var data = input.read();
                if ( data ) {
                    hash.update( data );
                } else {
                    var hex = hash.digest('hex');
                    console.log( `${f} computing...` );
                    if ( res[hex] ) {
                        console.log( `The [${f}] same as [${res[hex]}].` );
                        if ( operator.remove || '2' != rl.question( 'How to fix it? 1: Delete; 2: ignore; (1)' ) ) {
                            fs.unlinkSync( f );
                        }
                    } else {
                        res[hex] = f;
                    }
                }
            } );
        } );
    } );
}

exports.set = function( argv ) {
    if ( ! argv[1] ) {
        operator.path = rl.question( 'Folder path: ' );
    } else {
        operator.path = argv[1];
    }

    for ( var i = 2; i < argv.length; i++ ) {
        switch( argv[i] ) {
            case '-r' :
                operator.deep = true;
                break;
            case '-d' :
                operator.remove = true;
                break;
        }
    }

    fs.exists( operator.path, ( exists ) => {
        if ( exists ) {
            _setting_folder( operator.path );
        } else {
            console.log( 'The folder is not exists.' );
        }
    } );
}
