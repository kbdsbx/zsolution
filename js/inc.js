"use strict"

/* Global variables */

const url_pattern = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/ig;

// path separator
const separator = process.platform == "win32" ? '\\' : '/';

const fs = require( 'fs' );
const http = require( 'http' );
const https = require( 'https' );
const path = require( 'path' );
const crypto = require( 'crypto' );

exports.load_by = function( path ) {
    try {
        return JSON.parse( fs.readFileSync( path ) );
    } catch( e ) {
        return null;
    }
}

exports.save_as = function( src, data ) {
    fs.writeFile( src, JSON.stringify( data, null, '  ' ), ( err ) => {
        if ( err ) { throw err; }
    } );
}

exports.get = function( url, encoding, callback ) {
    let _http = /https:.+?/i.test( url ) ? https : http;
    _http.get( url, ( res ) => {
        if ( res.statusCode == 200 ) {
            var data = '';
            if ( encoding ) {
                res.setEncoding( encoding );
            }
            res.on( 'data', function( chunk ) {
                data += chunk;
            } );

            res.on( 'end', function() {
                res.resume();
                return callback( null, data );
            } );

            res.on( 'error', function( err ) {
                callback( err );
            } );
        }
    } ).on( 'error', ( err ) => {
        callback( err );
    } );
}

exports.get_info = function( file_path ) {
    if ( ! fs.existsSync( file_path ) ) {
        return null;
    }

    let stat = fs.statSync( file_path );
    let file_info = path.parse( file_path );

    let opt = {
        path: file_path,
        isDirectory: stat.isDirectory(),
        isFile: stat.isFile(),
        dir: file_info.dir,
        root: file_info.root,
        ext: file_info.ext,
        name: file_info.name,
        size: stat.size,
        accessed_time: stat.atime,
        modified_time: stat.mtime,
        changed_time: stat.ctime,
        created_time: stat.birthtime,
    };

    return opt;
}

exports.each = function ( folder, callback ) {
    fs.readdir( folder, function( err, files ) {
        if ( err ) { callback( err ); }

        files.forEach( function( f ) {
            let file_path = folder + separator + f;

            let file_info = exports.get_info( file_path );

            if ( file_info.isDirectory ) {
                if ( ! callback( null, file_info ) ) {
                    exports.each( file_path, callback );
                }
            } else {
                callback( null, file_info );
            }
        } );
    } );
}

exports.isurl = function ( url ) {
    return url_pattern.test( url );
}

exports.xpath = function ( obj, folder ) {
    let _path = folder.split( '\\' );
    let _t = obj;

    for ( let i = 0; i < folder.length; i++ ) {
        _t = obj[ folder[i] ];
    }

    return _t;
}

exports.sha256 = function ( str ) {
    return crypto.createHash( 'sha256' ).update( str ).digest( 'hex' );
}

exports.rmdir = function( path ) {
    var files = fs.readdirSync( path );

    for ( var i = 0; i < files.length; i++ ) {
        var f = path + '\\' + files[i];

        if ( fs.statSync( f ).isDirectory() ) {
            exports.rmdir( f );
        } else {
            fs.unlinkSync( f );
        }
    }

    fs.rmdirSync( path );
}
