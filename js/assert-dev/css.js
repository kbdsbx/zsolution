"use strict"

const fs = require( 'fs' );
const path = require( 'path' );
const $ = require( __dirname + '/../inc.js' );

exports = module.exports = css_compile;

function css_compile( options ) {
    this.options = $.extending( this.options, options );
    return this;
}

css_compile.__proto__ = {
    _catch : [],

    compile: function( options, callback ) {
        var _self = new css_compile( options );
        return _self.compile( callback );
    }
}

css_compile.prototype = {
    options : {
        path : null,
        new_path : null,
        compress : false,
    },

    compile : function( callback ) {
        var _self = this;
        _self.options.path = path.normalize( _self.options.path );
        _self.options.new_path = path.normalize( _self.options.new_path );

        if ( css_compile._catch.indexOf( _self.options.path ) === -1 ) {
            css_compile._catch.push( _self.options.path );
        } else {
            return;
        }

        // TODO: if compression is setting

        fs.readFile( _self.options.path, 'utf8', ( err, contents ) => {
            if ( err ) {
                console.error( err );
                return;
            }

            fs.writeFile( _self.options.new_path, contents, { encoding: 'utf8', flag: "w+" }, ( err ) => {
                if ( err ) {
                    console.log( err );
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

