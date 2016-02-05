"use strict"

const fs = require( 'fs' );
const rl = require( 'readline-sync' );
const tools = require( __dirname + '/inc.js' );
const data_file = __dirname + '/../data/data.json';

var data_solutions;

var options = {
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

exports.init = function( opt ) {
    // getting solution data
    data_solutions = tools.load_by( data_file );

    for ( var attr in opt ) {
        options[attr] = opt[attr];
    }

    if ( ! options.name ) {
        options.name = rl.question( 'Solution name: ' );
    }

    if ( data_solutions[options.name] ) {
        switch ( rl.question( 'This solution is existed. 1: cover; 2: update; 3: exit; (1)' ) ) {
            default:
            case '1':
                break;
            case '2':
                options = tools.load_by( data_solutions[options.name] );
                return;
            case '3':
                process.exit(0);
                return;
        }
    }

    if ( ! options.path ) {
        options.path = rl.question( 'Solution path: ' );
    }

    if ( ! options.svn_url ) {
        options.svn_url = rl.question( 'SVN URL (if exists): ' );
    }

    options.path = options.path + ( options.path.substr( -1, 1 ) == '/' || options.path.substr( -1, 1 ) == '\\' ? options.name : '\\' + options.name );
    options.release_folder = options.path + '\\release';

    if ( ! fs.existsSync( options.path ) ) {
        fs.mkdirSync( options.path );
        console.log( `created solution folder [${options.path}] successfully.` );
    }

    var cur_solution = options.path + '\\solution.json';
    data_solutions[options.name] = cur_solution;

    tools.save_as( data_file, data_solutions );
    tools.save_as( cur_solution, options );
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

    fs.exists( options.path, ( exists ) => {
        if ( exists ) {
            _mk_folder( options.path, options.sub_folder );
        } else {
            fs.mkdir( options.path, ( err ) => {
                if ( err ) throw err;
                console.log( `created solution folder [${_path}] successfully.` );
                _mk_folder( _path, options.sub_folder );
            } );
        }

        return false;
    } );
}

exports.init_svn = function() {
    if ( ! options.svn_url ) {
        return;
    }

    // todo: svn url verify;

    console.log( 'requesting form svn...' );
    var val = require( 'child_process' ).execSync( `svn checkout ${options.svn_url} ${options.release_folder}`, { encoding : 'utf-8' } );
    console.log( val );
}
