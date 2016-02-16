"use strict"

/* Global variables */

// path separator
const separator = process.platform == "win32" ? '\\' : '/';

const fs = require( 'fs' );
const http = require( 'http' );

exports.load_by = function( path ) {
    try {
        return JSON.parse( fs.readFileSync( path ) );
    } catch( e ) {
        return new Object();
    }
}

exports.save_as = function( path, data ) {
    fs.writeFile( path, JSON.stringify( data, null, '  ' ), ( err ) => {
        if ( err ) { throw err; }
    } );
}

exports.get = function( url, encoding, callback ) {
    http.get( url, ( res ) => {
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

exports.each = function ( folder, callback ) {
    fs.readdir( folder, function( err, files ) {
        if ( err ) { callback( err ); }

        var file_path = folder + separator + f;

        files.forEach( function( f ) {
            
            fs.stat( file_path, function( err, stat ) {
                if ( err ) { callback( err ); }

                var file_info = path.parse( file_path );
                var opt = {
                    path: file_path,
                    isDirectory: stat.isDirectory(),
                    isFile: stat.isFile(),
                    root: file_info.root,
                    ext: file_info.ext,
                    name: file_info.name,
                    size: stat.size,
                    accessed_time: stat.atime,
                    modified_time: stat.mtime,
                    changed_time: stat.ctime,
                    created_time: stat.birthtime,
                };

                if ( opt.isDirectory ) {
                    if ( ! callback( null, opt ) ) {
                        exports.each( file_path, callback );
                    }
                } else {
                    callback( null, opt );
                }
            } );
        } );

    } );
}

