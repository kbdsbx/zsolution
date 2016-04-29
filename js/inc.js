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
const data_file = __dirname + '/../data/data.json';

// load json from file system;
exports.load_by = function( path ) {
    try {
        return JSON.parse( fs.readFileSync( path ) );
    } catch( e ) {
        return null;
    }
}

// save json file
exports.save_as = function( src, data ) {
    fs.writeFile( src, JSON.stringify( data, null, '  ' ), ( err ) => {
        if ( err ) { throw err; }
    } );
}

// get web page with http[s]
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

// get file info
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

        hash: exports.sha256( file_info.name + file_info.ext + stat.ctime.toString() ),
    };

    return opt;
}

// each every file and folder
exports.each = function ( folder, callback ) {
    let files = fs.readdirSync( folder );

    files.forEach( function( f ) {
        let file_path = folder + separator + f;
        let file_info = exports.get_info( file_path );
        if ( file_info.isDirectory ) {
            if ( ! callback( file_info ) ) {
                exports.each( file_path, callback );
            }
        } else {
            callback( file_info );
        }
    } );
}

exports.isurl = function ( url ) {
    return url_pattern.test( url );
}

exports.xpath = function ( obj, folder ) {
    let _path = folder.split( '\\' );
    let _t = obj;

    for ( let i = 0; i < _path.length; i++ ) {
        _t = _t[ _path[i] ];
    }

    return _t;
}

// encoding str with sha256
exports.sha256 = function ( str ) {
    return crypto.createHash( 'sha256' ).update( str ).digest( 'hex' );
}

// remove directory cleanly
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
