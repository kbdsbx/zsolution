"use strict"

const fs = require( 'fs' );
const less = require( 'less' );

exports.compile = function( info, options ) {
    
    fs.readFile( info.path, 'utf8', ( err, contents ) => {
        if ( err ) { console.error( err ); return; }

        less.render( contents, {
            paths: [ info.dir ],
            filename: info.path,
            compress: options.compress,
        }, ( err, output ) => {
            if ( err ) { console.error( err ); return; }

            fs.writeFile( info.new_path, output.css, { flag : 'w+' }, ( err ) => {
                if ( err ) { console.error( err ); return; }

                console.log( info.new_path + ' compiled.' );
            } );
        } );
    } );
}
