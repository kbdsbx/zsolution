"use strict"

const tools = require( __dirname + "/../inc.js" );
const path = require( 'path' );
const fs = require( 'fs' );
const crypto = require( 'crypto' );
const util = require( 'util' );
const beautify_html = require( 'js-beautify' ).html;

var options = {};

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
 */
exports.compile = function( info, opt ) {
    options = opt;
    fs.readFile( info.path, "utf8", ( err, contents ) => {
        if ( err ) { console.log( err ); return; }

        let result = contents;

        result = less_compile( result, info.dir );

        result = import_compile( result, info.dir );

        fs.writeFile( info.new_path, beautify_html( result ), { flag: 'w+' }, ( err ) => {
            if ( err ) { console.log( err ); return; }

            console.log( info.new_path + ' compiled.' );
        } );
    } );
}

/**
 * less
 */
var less_compile = function( contents, dir ) {
    let result = contents;

    var less_pattern = /<link.+?href=['|"](.*?\.less\??[^\/^\?]*?)['|"].*?>/g;
    var less_js_pattern = /<script.+?src=['|"].*?\/less\.(min\.)?js[^'^"]*?['|"][^>]*?>.*?<\/script>/g
    
    let less_match;
    while ( ( less_match = less_pattern.exec( contents ) ) !== null ) {
        if ( less_match[1] ) {
            let less_file_path = path.isAbsolute( less_match[1] ) ? options.item.path + less_match[1].replace( /\//g, '\\' ) : dir + '\\' + less_match[1].replace( /\//g, '\\' );
            let less_info = tools.get_info( less_file_path );

            if ( ! less_info ) {
                continue;
            }

            let sha256 = less_info.hash;

            let old_sha = tools.xpath( options.item.sub_folder, path.relative( options.item.path, less_file_path ) );

                require( './less.js' ).compile( less_info, options );
            if ( ( ! options.absolute ) && old_sha != sha256 || old_sha == '' ) {
            }

            less_info.new_path = less_info.path
                .replace( options.item.path, options.item.release_folder )
                .replace( /\.less$/g, '.css' );

            let less_link = less_match[0]
                .replace( /\.less/g, '.css?guid=' + sha256 )
                .replace( /stylesheet\/less/i, 'stylesheet' );

            result = result.replace( less_match[0], less_link );
        }
    }

    result = result.replace( less_js_pattern, '' )

    return result;
}

/**
 * link[rel="import"]
 */
var import_compile = function( contents, dir ) {
    let result = contents;

    var import_pattern = /<link.+?rel=['|"]import['|"].*?>/g;
    var import_js_pattern = /<script.+?src=['|"].*?\/import\.(min\.)?js[^'^"]*?['|"][^>]*?>.*?<\/script>/g

    let import_match;
    while( ( import_match = import_pattern.exec( contents ) ) != null ) {
        let import_href = /href=['|"](.+?)['|"]/i.exec( import_match[0] );

        if ( import_href[1] ) {
            let import_file_path = path.isAbsolute( import_href[1] ) ? options.item.path + less_match[1].replace( /\//g, '\\' ) : dir + '\\' + import_href[1].replace( /\//g, '\\' );
            let import_file_info = tools.get_info( import_file_path );
            let sha256 = tools.sha256( import_file_info.changed_time.toString() ).substr( 32 );

            let import_content = fs.readFileSync( import_file_path );

            import_content = util.format( "<!-- [%s] v.[%s] -->", import_href[1], sha256 ) + import_content + util.format( "<!-- #[%s] -->", import_href[1] );

            // compile recursive
            import_content = import_compile( import_content, import_file_info.dir );

            result = result.replace( import_match[0], import_content );
        }
    }

    result = result.replace( import_js_pattern, '' )

    return result;
}

