"use strict"

const fs = require( 'fs' );
const rl = require( 'readline-sync' );
const tools = require( __dirname + '/inc.js' );
const data_file = __dirname + '/../data/data.json';

var data_solutions;

var options = {
    name: '',
    out_path: '',
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

    options.items = tools.load_by( data_solutions[options.name] );

    if ( ! options.out_path ) {
        options.out_path = options.items.release_folder || process.cwd();
    }
}

exports.compile = function() {
    tools.each( options.items.path, function( err, info ) {
        if ( err ) { console.log( err ); }

        if ( info.isDirectory ) {
            // stop to process release directory
            switch( info.name ) {
                case 'release':
                    return true;
            }
        }

        if ( info.isFile ) {
            var new_path = info.path.replace( options.items.path, options.items.release_folder );

            switch( info.ext ) {
                case '.htm':
                case '.html':
                case '.shtml':
                    fs.readFile( info.path, "utf8", ( err, contents ) => {
                        // to process less;
                        var less_pattern = /<link.+?href=['|"](.*?\.less[^\/]*?)['|"].*?>/g;
                        var match;
                        while( ( match = less_pattern.exec( contents ) ) !== null ) {
                        }
                    } );
                    break;

                case '.css':
                    break;

                case '.less':
                    break;

                case '.js':
                    break;

                case '.json':
                    break;

                case '.jpg':
                case '.jpeg':
                case '.png':
                case '.gif':
                case '.svg':
                    break;
            }
        }
    } )
}

