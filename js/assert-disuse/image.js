"use strict"

const fs = require( 'fs' );

exports.compile = function( info, options ) {
    fs.readFile( info.path, "binary", ( err, contents ) => {
        if ( err ) { console.log( err ); return; }

        fs.writeFile( info.new_path, contents, { encoding: "binary", flag: "w+" }, ( err ) => {
            if ( err ) { console.log( err ); return; }

            console.log( info.new_path + ' created.' );
        } );
    } )
}

