"use strict"

const fs = require( 'fs' );
const path = require( 'path' );
const tools = require( __dirname + '/inc.js' );
const data_file = __dirname + '/../data/data.json';

var data_solutions;

var options = {
    name: '',
    out_path: '',
    compress: false,
    item: {},
}

exports.init = function( opt ) {
    // getting solution data
    data_solutions = tools.load_by( data_file );

    for ( var attr in opt ) {
        options[attr] = opt[attr];
    }

    if ( ! data_solutions[options.name] ) {
        console.error( 'The solution is not exists.' );
        process.exit( 0 );
    }

    if ( ! fs.existsSync( data_solutions[options.name] ) ) {
        console.error( 'The solution management file is not exists.' );
        process.exit( 0 );
    }

    options.item = tools.load_by( data_solutions[options.name] );

    if ( options.out_path ) {
        options.item.release_path = options.out_path;
    }
}

exports.release = function() {
    let res = each( options.item.path, options.item.sub_folder, function( info, old_hash ) {

        if ( options.item.ignore && options.item.ignore instanceof Array ) {
            // override ignore folders and files
            for ( let idx in options.item.ignore ) {
                if ( new RegExp( options.item.ignore[idx], 'i' ).test( info.name + info.ext ) ) {
                    return true;
                }
            }
        }

        if ( info.isDirectory ) {
            // override release folder
            if ( options.item.release_path == info.path ) {
                return true;
            }
        }

        if ( info.isDirectory ) {
            info.new_path = info.path.replace( options.item.path, options.item.release_path );
            require( __dirname + '/assert/directory.js' ).compile( info, options );
        }

        if ( info.isFile ) {
            switch( info.name + info.ext ) {
                case 'solution.json':
                    return true;
            }
            info.new_path = info.path.replace( options.item.path, options.item.release_path );
            switch( info.ext ) {
                case '.htm':
                case '.html':
                case '.shtml':
                    require( __dirname + '/assert/html.js' ).compile( info, options );
                    break;

                case '.css':
                    require( __dirname + '/assert/css.js' ).compile( info, options );
                    break;

                case '.less':
                    break;

                case '.js':
                    if ( ( ! options.absolute ) && old_hash !== null && info.hash == old_hash ) {
                        return true;
                    }
                    require( __dirname + '/assert/js.js' ).compile( info, options );
                    break;

                case '.json':
                    require( __dirname + '/assert/json.js' ).compile( info, options );
                    break;

                case '.jpg':
                case '.jpeg':
                case '.png':
                case '.gif':
                case '.svg':
                    if ( ( ! options.absolute ) && old_hash !== null && info.hash == old_hash ) {
                        return true;
                    }
                    require( __dirname + '/assert/image.js' ).compile( info, options );
                    break;

                case '.eot':
                case '.ttf':
                case '.woff':
                case '.woff2':
                    if ( ( ! options.absolute ) && old_hash !== null && info.hash == old_hash ) {
                        return true;
                    }
                    require( __dirname + '/assert/font.js' ).compile( info, options );
                    break;
                default :
                    return true;
            }
        }
    } );

    options.item.sub_folder = res;
    tools.save_as( data_solutions[options.name], options.item );
}

var each = function( path, old_folder, callback ) {
    let res = {};

    tools.each( path, ( info ) => {
        if ( info.isDirectory ) {
            let _old = old_folder ? old_folder[ info.name ] : {};

            if ( ! callback( info, null ) ) {
                res[info.name] = each( info.path, _old, callback );
            }
            return true;
        }

        if ( info.isFile ) {
            let _old = old_folder ? old_folder[ info.name + info.ext ] : null;

            if ( _old ) {
                res[info.name + info.ext] = _old;
            }

            if ( ! callback( info, _old ) ) {
                res[info.name + info.ext] = info.hash;
            }
        }
    } );

    return res;
}

