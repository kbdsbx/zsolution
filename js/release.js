"use strict"

const fs = require( 'fs' );
const tools = require( __dirname + '/inc.js' );
const data_file = __dirname + '/../data/data.json';

var data_solutions;

var options = {
    name: '',
    out_path: '',
    compress: false,
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
        options.item.release_folder = options.out_path;
    }
}

exports.release = function() {
    tools.each( options.item.path, function( err, info ) {
        if ( err ) { console.log( err ); return; }

        if ( info.isDirectory ) {
            // stop to process release folder
            switch( info.name ) {
                case 'release':
                    return true;
            }

            if ( /^\..+?$/i . test( info.name ) ) {
                return true;
            }
        }

        if ( info.isDirectory ) {
            info.new_path = info.path.replace( options.item.path, options.item.release_folder );
            require( __dirname + '/assert/directory.js' ).compile( info, options );
        }

        if ( info.isFile ) {
            info.new_path = info.path.replace( options.item.path, options.item.release_folder );
            switch( info.ext ) {
                case '.htm':
                case '.html':
                case '.shtml':
                    require( __dirname + '/assert/html.js' ).compile( info, options );
                    break;

                case '.css':
                    break;

                case '.less':
                    break;

                case '.js':
                    require( __dirname + '/assert/js.js' ).compile( info, options );
                    break;

                case '.json':
                    break;

                case '.jpg':
                case '.jpeg':
                case '.png':
                case '.gif':
                case '.svg':
                    require( __dirname + '/assert/image.js' ).compile( info, options );
                    break;
            }
        }
    } )
}

