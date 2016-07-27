"use strict"

const fs = require( 'fs' );
const path = require( 'path' );
const uglify = require( 'uglify-js2' );
const $ = require( __dirname + '/../inc.js' );

exports = module.exports = js_compile;

function js_compile( options ) {
    this.options = $.extending( this.options, options );
    return this;
}

js_compile.__proto__ = {
    _catch : [],

    compile: function( options, callback ) {
        var _self = new js_compile( options );
        return _self.compile( callback );
    }
}

js_compile.prototype = {
    options : {
        path: null,
        new_path : null,
        compress : false,
    },

    compile : function( callback ) {
        var _self = this;
         _self.options.path = path.normalize( _self.options.path );
        _self.options.new_path = path.normalize( _self.options.new_path );

        if ( js_compile._catch.indexOf( _self.options.path ) === -1 ) {
            js_compile._catch.push( _self.options.path );
        } else {
            return;
        }

        fs.readFile( _self.options.path, 'utf8', ( err, contents ) => {
            if ( err ) {
                console.error( err );
                return;
            }

            if ( _self.options.compress ) {
                var minified = uglify.minify( contents, {
                    fromString: true,
                } );
                contents = minified.code;
            }

            fs.writeFile( _self.options.new_path, contents, { encoding: "utf8", flag: "w+" }, ( err ) => {
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

