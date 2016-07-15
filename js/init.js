"use strict"

const fs = require( 'fs' );
const rl = require( 'readline-sync' );
const crypto = require( 'crypto' );
const path = require( 'path' );
const $ = require( __dirname + '/inc.js' );

exports = module.exports = init;

function init( opt ) {
    let _self = init;
    $.extend( init.options, opt );

    _self.data_solutions = $.load_by( _self.data_file ) || {};

    if ( ! _self.options.path ) {
        _self.options.path = process.cwd();
    }

    let _json_file = path.normalize( _self.options.path + '/solution.json' );

    if ( fs.existsSync( _json_file ) ) {
        try {
            $.extend( _self.options, $.load_by( _json_file ) );
            _self.data_solutions[ _self.options.name ] = _json_file;
            $.save_as( _self.data_file, _self.data_solutions )
        } catch ( e ) {
        }
    } else {
        if ( ! _self.options.name ) {
            _self.options.name = rl.question( 'Solution name: ' );
        }

        if ( _self.data_solutions[ _self.options.name ] ) {
            switch ( rl.question( 'This solution is existed. 1: ignore; 2: cover; 3: exit. (1)' ) ) {
                default:
                case '1':
                    break;
                case '2':
                    $.rmdir( _self.options.path );
                    break;
                case '3':
                    process.exit( 0 );
                    break;
            }
        }

        if ( ! _self.options.output_path ) {
            _self.options.output_path = path.normalize( _self.options.path + '/release' );
        }

        if ( ! _self.options.svn ) {
            _self.options.svn = rl.question( 'SVN URL (if exists): ' );
        }

        _self.data_solutions[ _self.options.name ] = _json_file;
        $.save_as( _self.data_file, _self.data_solutions );
    }
}

init.__proto__ = {
    data_file : path.normalize( __dirname + '/../data/data.json' ),
    data_solutions : '',
    options : {
        name: '',
        version: 0,
        path: '',
        svn: '',
        output_path: '',
        sub_folder: {
            'release' : null,
            'components' : null,
            'images' : null,
            'lib' : null,
            'fonts' : null,
            'js' : {
                'coffee': null,
            },
            'css' : {
                'less' : {
                    'style.less' : '',
                },
            },
            'index.html' : '',
        },
        ignore: [
            'release',      // release folder
            'components',   // html components folder
            '^\\.',         // hidden folders and files
        ],
    },

    init_path : function() {
        var _mk_folder = function( parent_path, folders ) {
            let res = {};
            Object.keys( folders ).forEach( ( key ) => {
                let _sub_path = path.normalize( parent_path + '/' + key );

                if ( fs.existsSync( _sub_path ) ) {
                    return;
                }

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

                    let f_info = $.get_info( _sub_path );
                    res[ key ] = f_info.hash;
                }
            } );

            return res;
        }

        let res;

        if ( fs.existsSync( init.options.path ) ) {
            res = _mk_folder( init.options.path, init.options.sub_folder );
        } else {
            fs.mkdirSync( init.options.path );
            console.log( `[${init.options.path}] created successfully.` );
            res = _mk_folder( init.options.path, init.options.sub_folder );
        }

        var _json_file = path.normalize( init.options.path + '/solution.json' );
        init.options.sub_folder = res;
        $.save_as( _json_file, init.options );
    },

    init_svn : function() {
        if ( ! init.options.svn ) {
            return;
        }

        // todo: svn url verify;

        console.log( 'requesting form svn...' );
        var val = require( 'child_process' ).execSync( `svn checkout ${init.options.svn} ${init.options.path}`, { encoding : 'utf-8' } );
        console.log( val );
    }
}

