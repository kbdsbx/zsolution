"use strict"

const fs = require( 'fs' );
const rl = require( 'readline-sync' );
const tools = require( './inc.js' );
const data_file = './data/data.json';

var data_solutions;

var operator = {
    name: '',
    varsion: '0.0.0',
    path: '',
    svn_url: '',
    release_folder: '',
    sub_folder: {
        'release' : null,
        'images' : null,
        'js' : {
            'coffee' : null,
        },
        'css' : {
            'less' : null,
            'sass' : null,
        },
        'lib' : null,
        'fonts' : null,
    },
};

exports.init = function( argv ) {
    // getting solution data
    data_solutions = tools.load_by( data_file );

    if ( ! operator.name ) {
        if ( ! argv[1] ) {
            operator.name = rl.question( 'Solution name: ' );
        } else {
            operator.name = argv[1];
        }
    }

    if ( data_solutions[operator.name] ) {
        switch ( rl.question( 'This solution is existed. 1: cover; 2: update; 3: exit; (1)' ) ) {
            default:
            case '1':
                break;
            case '2':
                operator = JSON.parse( fs.readFileSync( data_solutions[operator.name] ) );
                return;
            case '3':
                process.exit(0);
                return;
        }
    }

    if ( ! operator.path ) {
        if ( ! argv[2] ) {
            operator.path = rl.question( 'Solution path: ' );
        } else {
            operator.path = argv[2];
        }
    }

    if ( ! operator.svn_url ) {
        if ( ! argv[3] ) {
            operator.svn_url = rl.question( 'SVN URL (if exists): ' );
        } else {
            operator.svn_url = argv[3];
        }
    }

    operator.path = operator.path + ( operator.path.substr( -1, 1 ) == '/' || operator.path.substr( -1, 1 ) == '\\' ? operator.name : '\\' + operator.name );
    operator.release_folder = operator.path + '\\release';

    if ( ! fs.existsSync( operator.path ) ) {
        fs.mkdirSync( operator.path );
        console.log( `created solution folder [${operator.path}] successfully.` );
    }

    var cur_solution = operator.path + '\\solution.json';
    data_solutions[operator.name] = cur_solution;

    fs.writeFile( data_file, JSON.stringify( data_solutions ), ( err ) => {
        if ( err ) { throw err; }
    } );
    fs.writeFile( cur_solution, JSON.stringify( operator ), ( err ) => {
        if ( err ) { throw err; }
    } );
}

exports.init_paths = function() {
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

    fs.exists( operator.path, ( exists ) => {
        if ( exists ) {
            _mk_folder( operator.path, operator.sub_folder );
        } else {
            fs.mkdir( operator.path, ( err ) => {
                if ( err ) throw err;
                console.log( `created solution folder [${_path}] successfully.` );
                _mk_folder( _path, operator.sub_folder );
            } );
        }

        return false;
    } );
}

exports.init_svn = function() {
    if ( ! operator.svn_url ) {
        return;
    }

    // todo: svn url verify;

    console.log( 'requesting form svn...' );
    var val = require( 'child_process' ).execSync( `svn checkout ${operator.svn_url} ${operator.release_folder}`, { encoding : 'utf-8' } );
    console.log( val );
}
