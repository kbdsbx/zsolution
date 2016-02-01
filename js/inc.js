"use strict"

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
    try {
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
                    console.log( err );
                } );
            }
        } );
    } catch ( err ) {
        return callback( err );
    }
}

