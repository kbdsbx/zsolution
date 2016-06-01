"use strict"

const fs = require( 'fs' );
const uglify = require( 'uglify-js2' );

exports.compile = function( info, options ) {
    fs.readFile( info.path, "utf8", ( err, contents ) => {
        if ( err ) { console.error( err ); return; }

        if ( options.compress ) {
            let minified = uglify.minify( contents, {
                fromString: true,
            } );
            contents = minified.code;
        }

        fs.writeFile( info.new_path, contents, { encoding: "utf8", flag: "w+" }, ( err ) => {
            if ( err ) { console.log( err ); return; }

            console.log( info.new_path + ' created.' );
        } );
    } )
}


