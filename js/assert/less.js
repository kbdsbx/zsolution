"use strict"

const fs = require( 'fs' );
const less = require( 'less' );
const path = require( 'path' );

var _catch = [];

exports.compile = function( info, options ) {

    info.path = path.normalize( info.path );

    if ( _catch.indexOf( info.path ) == -1 ) {
        _catch.push( info.path );
    } else {
        return;
    }
 
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
