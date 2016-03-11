"use strict"

const tools = require( __dirname + "/../inc.js" );
const path = require( 'path' );
const fs = require( 'fs' );
const crypto = require( 'crypto' );

var less_pattern = /<link.+?href=['|"](.*?\.less\??[^\/^\?]*?)['|"].*?>/g;
var less_js_pattern = /<script.+?src=['|"].*?\/less\.(min\.)?js[^'^"]*?['|"][^>]*?>.*?<\/script>/g

/**
 * info = {
 *     path,        // absolute path
 *     new_path,    // absolute path
 *     isDirectory, // bool
 *     isFile,      // bool
 *     dir,
 *     root,
 *     ext,         // including '.'
 *     name,
 *     size,        // byte
 *     accessed_time,
 *     modified_time,
 *     changed_time,
 *     created_time,
 * }
 *
 * item = {
 * }
 */
exports.compile = function( info, options ) {
    fs.readFile( info.path, "utf8", ( err, contents ) => {
        if ( err ) { console.log( err ); return; }

        let result = contents;

        let less_match;
        while ( ( less_match = less_pattern.exec( contents ) ) !== null ) {
            if ( less_match[1] ) {
                let less_file_path = path.isAbsolute( less_match[1] ) ? options.item.path + less_match[1].replace( /\//g, '\\' ) : info.dir + '\\' + less_match[1].replace( /\//g, '\\' );
                let less_info = tools.get_info( less_file_path );
                let sha256 = crypto.createHash( 'sha256' ).update( less_info.changed_time.toString() ).digest( 'hex' ).substr( 32 );
                less_info.new_path = less_info.path
                    .replace( options.item.path, options.item.release_folder )
                    .replace( /\.less$/g, '.css' );

                require( './less.js' ).compile( less_info, options );

                let less_link = less_match[0]
                    .replace( /\.less/g, '.css?guid=' + sha256 )
                    .replace( /stylesheet\/less/i, 'stylesheet' );
                result = result.replace( less_match[0], less_link );
            }
        }

        result = result.replace( less_js_pattern, '' );

        fs.writeFile( info.new_path, result, { flag: 'w+' }, ( err ) => {
            if ( err ) { console.log( err ); return; }

            console.log( info.new_path + ' compiled.' );
        } );
    } );
}
