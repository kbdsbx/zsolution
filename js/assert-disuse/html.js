"use strict"

const tools = require( __dirname + "/../inc.js" );
const path = require( 'path' );
const fs = require( 'fs' );
const crypto = require( 'crypto' );
const util = require( 'util' );
const beautify_html = require( 'js-beautify' ).html;

var options = {};
var solution = {};

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
exports.compile = function( info, opt, sol ) {
    options = opt;
    solution = sol;

    fs.readFile( info.path, "utf8", ( err, contents ) => {
        if ( err ) { console.log( err ); return; }

        let result = contents;

        result = css_move( result, info.dir, solution );

        result = js_move( result, info.dir, solution );

        result = less_compile( result, info.dir, solution );

        result = import_compile( result, info.dir, solution );

        fs.writeFile( info.new_path, beautify_html( result ), { flag: 'w+' }, ( err ) => {
            if ( err ) { console.log( err ); return; }

            console.log( info.new_path + ' compiled.' );
        } );
    } );
}

/**
 * less
 */
var less_compile = function( contents, dir, solution ) {
    let result = contents;

    var less_pattern = /<link.+?href=['|"](.*?\.less\??[^\/^\?]*?)['|"].*?>/g;
    var less_js_pattern = /<script.+?src=['|"].*?\/less\.(min\.)?js[^'^"]*?['|"][^>]*?>.*?<\/script>/g
    
    let less_match;
    while ( ( less_match = less_pattern.exec( contents ) ) !== null ) {
        if ( less_match[1] ) {
            let less_file_path = path.normalize( path.isAbsolute( less_match[1] ) ? solution.path + less_match[1] : dir + '/' + less_match[1] );
            let less_info = tools.get_info( less_file_path );

            if ( ! less_info ) {
                continue;
            }

            let sha256 = less_info.hash;

            let old_sha = tools.xpath( solution.new_folder, path.relative( solution.path, less_file_path ) );

            if ( ( ! options.absolute ) && old_sha != sha256 || old_sha === null ) {
                require( './less.js' ).compile( less_info, options );
            }

            less_info.new_path = less_info.path
                .replace( solution.path, solution.output_path )
                .replace( /\.less$/g, '.css' );

            let less_link = less_match[0]
                .replace( /\.less/g, '.css' )
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
var import_compile = function( contents, dir, solution ) {
    let result = contents;

    var import_pattern = /<link.+?rel=['|"]import['|"].*?>/g;
    var import_js_pattern = /<script.+?src=['|"].*?\/import\.(min\.)?js[^'^"]*?['|"][^>]*?>.*?<\/script>/g

    let import_match;
    while( ( import_match = import_pattern.exec( contents ) ) != null ) {
        let import_href = /href=['|"](.+?)['|"]/i.exec( import_match[0] );

        if ( import_href[1] ) {
            let import_file_path = path.normalize( path.isAbsolute( import_href[1] ) ? solution.path + less_match[1] : dir + '/' + import_href[1] );
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

/**
 * js file
 */
var js_move = function( contents, dir, solution ) {
    let result = contents;

    let js_pattern = /<script.+?src=['|"](.+?)['|"][^>]*?>.*?<\/script>/g;
    let js_match;

    while ( ( js_match = js_pattern.exec( contents ) ) != null ) {
        if ( js_match[1] && ( ! /^(https?|ftp|cdn)/i.test( js_match[1] ) ) ) {
            let js_path = path.normalize( path.isAbsolute( js_match[1] ) ? solution.path + js_match[1] : dir + '/' + js_match[1] );

            if ( ! fs.existsSync( js_path ) ) {
                continue;
            }

            let js_info = tools.get_info( js_path );
            let js_sha256 = tools.sha256_file( js_path );

            js_info.new_path = js_info.path
                .replace( solution.path, solution.output_path );

            require( './js.js' ).compile( js_info, options );

            let js_src = js_match[1]
                .replace( /\.js/g, '.js' );

            result = result.replace( js_match[1], js_src );
        }
    }

    return result;
}

/**
 * css file
 */
var css_move = function( contents, dir, solution ) {
    let result = contents;

    let css_pattern = /<link.+?href=['|"](.*?\.css\??[^\/^\?]*?)['|"].*?>/g;
    let css_match;

    while ( ( css_match = css_pattern.exec( contents ) ) != null ) {
        if ( css_match[1] ) {
            let css_path = path.normalize( path.isAbsolute( css_match[1] ) ? solution.path + css_match[1] : dir + '/' + css_match[1] );

            if ( ! fs.existsSync( css_path ) ) {
                continue;
            }

            let css_info = tools.get_info( css_path );
            let css_sha256 = tools.sha256_file( css_path );

            css_info.new_path = css_info.path
                .replace( solution.path, solution.output_path );

            require( './css.js' ).compile( css_info, options );

            let css_src = css_match[1]
                .replace( /\.css/g, '.css' );

            result = result.replace( css_match[1], css_src );
        }
    }

    return result;
}

