"use strict"

const fs = require( 'fs' );
const path = require( 'path' );
const $ = require( __dirname + '/../inc.js' );

exports = module.exports = binary_compile;

function binary_compile ( options ) {
    this.options = $.extending( this.options, options );
    return this;
}

binary_compile.__proto__ = {
    _catch : [],

    compile : function( options, callback ) {
        var _self = new binary_compile( options );
        return _self.compile( callback );
    }
}

binary_compile.prototype = {
    options : {
        path : null,
        new_path : null,
    },

    compile : function ( callback ) {
        var _self = this;
        _self.options.path = path.normalize( _self.options.path );
        _self.options.new_path = path.normalize( _self.options.new_path );

        if ( binary_compile._catch.indexOf( _self.options.path ) === -1 ) {
            binary_compile._catch.push( _self.options.path );
        } else {
            return;
        }

        fs.readFile( _self.options.path, 'binary', ( err, contents ) => {
            if ( err ) {
                console.error( err );
                return;
            }

            fs.writeFile( _self.options.new_path, contents, { encoding: 'binary', flag: 'w+' }, ( err ) => {
                if ( err ) {
                    console.error( err );
                    return;
                }

                if ( callback ) {
                    callback.call( contents );
                }

                console.log( _self.options.new_path + ' writed.' );
            } );
        } );
    }
}



