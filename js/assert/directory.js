"use strict"

const path = require( 'path' );
const fs = require( 'fs' );
const $ = require( __dirname + "/../inc.js" );

exports = module.exports = directory_compile;

function directory_compile( options ) {
    this.options = $.extending( this.options, options );
    return this;
}

directory_compile.__proto__ = {
    compile : function( options, callback ) {
        var _self = new directory_compile( options );
        return _self.compile( callback );
    }
}

directory_compile.prototype = {
    options : {
        path : null,
        new_path : null,
        compress : false,
    },
    
    compile : function( callback ) {
        var _self = this;
        _self.options.path = path.normalize( _self.options.path );
        _self.options.new_path = path.normalize( _self.options.new_path );

        // filtering empty directory.
        if ( _self.options.compress ) {
            if ( ! fs.existsSync( _self.options.path ) || fs.readdirSync( _self.options.path ).length === 0 ) {
                if ( callback ) {
                    callback.call( _self.options.path );
                }
                return;
            }
        }

        if ( ! fs.existsSync( _self.options.new_path ) ) {
            fs.mkdirSync( _self.options.new_path );

            console.log( _self.options.new_path + ' created.' );
        }
        
        if ( callback ) {
            callback.call( _self.options.new_path );
        }
    }
}
