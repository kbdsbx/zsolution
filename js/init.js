"use strict"

const fs = require( 'fs' );
const rl = require( 'readline-sync' );

var init = function( argv ) {
    if ( ! exports.path ) {
        if ( ! argv[1] ) {
            exports.name = rl.question( 'Solution name: ' );
        } else {
            exports.name = argv[1];
        }
    }

    if ( ! exports.path ) {
        if ( ! argv[2] ) {
            exports.path = rl.question( 'Solution path: ' );
        } else {
            exports.path = argv[2];
        }
    }

    if ( ! exports.svn_url ) {
        if ( ! argv[3] ) {
            exports.svn_url = rl.question( 'SVN URL (if exists): ' );
        } else {
            exports.svn_url = argv[3];
        }
    }
}

exports.init_paths = function( argv ) {
    init( argv );

    var _path_end = exports.path.substr( -1, 1 );
    var _path = exports.path + ( _path_end == '/' || _path_end == '\\' ? exports.name : '\\' + exports.name );

    var _sub_folder = {
        'images' : null,
        'js' : null,
        'css' : {
            'less' : null,
            'sass' : null,
        },
        'lib' : null,
        'fonts' : null
    };

    var _mk_folder = function( path, folders ) {
        Object.keys( folders ).forEach( ( f ) => {
            var _sub_path = path + '\\' + f;
            fs.mkdir( _sub_path, () => {
                console.log( `created folder [${_sub_path}] successfully.` );
                if ( folders[f] && folders[f] instanceof Object ) {
                    _mk_folder( _sub_path, folders[f] );
                }
            } );
        } );
    }

    fs.exists( _path, ( exists ) => {
        if ( exists ) {
            const rl = require( 'readline' ).createInterface( {
                input: process.stdin,
                output: process.stdout
            } );

            rl.question( 'solution exists, 1:ignore and continue; 2:exit; (1):', ( answer ) => {
                switch( answer ) {
                    default:
                    case '1' :
                        _mk_folder( _path, _sub_folder );
                        break;
                    case '2' :
                        break;
                }
                
                rl.close();
            } );
        } else {
            fs.mkdir( _path, ( err ) => {
                if ( err ) throw err;
                console.log( `created solution folder [${_path}] successfully.` );
                _mk_folder( _path, _sub_folder );
            } );
        }

        return false;
    } );
}

exports.init_svn = function( argv ) {
    init( argv );

    var _url = exports.svn_url;
    if ( ! _url ) {
        return;
    }

    var _path_end = exports.path.substr( -1, 1 );
    var _path = exports.path + ( _path_end == '/' || _path_end == '\\' ? exports.name : '\\' + exports.name );
 
    // todo: svn url verify;

    console.log( 'requesting form svn...' );
    var val = require( 'child_process' ).execSync( `svn checkout ${_url} ${_path}`, { encoding : 'utf-8' } );
    console.log( val );
}
