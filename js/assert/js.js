"use strict"

const fs = require( 'fs' );

exports.compile = function( info, options ) {
    fs.readFile( info.path, "utf8", ( err, contents ) => {
        if ( err ) { console.log( err ); return; }

        fs.writeFile( info.new_path, contents, { encoding: "utf8", flag: "w+" }, ( err ) => {
            if ( err ) { console.log( err ); return; }

            console.log( info.new_path + ' created.' );
        } );
    } )
}


