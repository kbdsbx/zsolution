"use strict"

const fs = require( 'fs' );
const path = require( 'path' );

var _catch = [];

exports.compile = function( info, options ) {
    
    if ( _catch.indexOf( info.path ) == -1 ) {
        _catch.push( info.path );
    } else {
        return;
    }

    fs.readFile( info.path, "utf8", ( err, contents ) => {
        if ( err ) { console.log( err ); return; }

        fs.writeFile( info.new_path, contents, { encoding: "utf8", flag: "w+" }, ( err ) => {
            if ( err ) { console.log( err ); return; }

            console.log( info.new_path + ' created.' );
        } );
    } )
}



