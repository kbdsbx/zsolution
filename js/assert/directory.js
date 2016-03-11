"use strict"

const fs = require( 'fs' );

exports.compile = function ( info, options ) {
    if ( ! fs.existsSync( info.new_path ) )
        fs.mkdirSync( info.new_path );
    console.log( info.new_path + ' created.' );
}
