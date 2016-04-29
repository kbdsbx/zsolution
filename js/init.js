"use strict"

const fs = require( 'fs' );
const rl = require( 'readline-sync' );
const crypto = require( 'crypto' );
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
        'components' : null,
        'images' : null,
        'js' : {
            'coffee' : null,
        },
        'css' : {
            'less' : {
                'style.less': '',
            },
            'sass' : null,
        },
        'lib' : null,
        'fonts' : null,
        'index.html' : '',
    },
    ignore: [
        'release',      // release folder
        'components',   // html components folder
        '^\\.',         // hidden folder
    ]
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
                let topt = tools.load_by( data_solutions[options.name] );
                tools.rmdir( topt.path );
                break;
            case '2':
                // options = tools.load_by( data_solutions[options.name] );
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
        let res = {};
        Object.keys( folders ).forEach( ( key ) => {
            let _sub_path = path + '\\' + key;

            if ( folders[key] === null || folders[key] instanceof Object ) {
                // folder
                fs.mkdirSync( _sub_path );
                console.log( `[${_sub_path}] created successfully.` );

                if ( folders[key] !== null ) {
                    res[ key ] = _mk_folder( _sub_path, folders[key] );
                } else {
                    res[ key ] = null;
                }
            } else if ( folders[key] === '' || folders[key] instanceof String ) {
                // file
                fs.writeFileSync( _sub_path, '' );
                console.log( `[${_sub_path}] created successfully.` );

                let f_info = tools.get_info( _sub_path );
                res[ key ] = tools.sha256( f_info.name + f_info.ext + f_info.changed_time.toString() );
            }
        } );

        return res;
    }

    fs.exists( options.path, ( exists ) => {
        let res;

        if ( exists ) {
            res = _mk_folder( options.path, options.sub_folder );
        } else {
            fs.mkdirSync( options.path );
            console.log( `[${options.path}] created successfully.` );
            res = _mk_folder( options.path, options.sub_folder );
        }

        var cur_solution = options.path + '\\solution.json';
        options.sub_folder = res;
        tools.save_as( cur_solution, options );

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
