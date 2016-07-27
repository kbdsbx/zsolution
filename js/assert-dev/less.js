"use strict"

const fs = require( 'fs' );
const less = require( 'less' );
const path = require( 'path' );
const $ = require( __dirname + '/../inc.js' );

exports = module.exports = less_compile;

function less_compile( options ) {
    this.options = $.extending( this.options, options );

    return this;
}

less_compile.__proto__ = {
    _catch : [],

    compile : function( options, callback ) {
        var _self = new less_compile( options );
        return _self.compile( callback );
    }
};

less_compile.prototype = {
    options : {
        path : null,
        new_path : null,
        base_path : null,
        compress : false,
        map : false,
    },

    compile : function( callback ) {
        var _self = this;
        _self.options.path = path.normalize( _self.options.path );
        _self.options.new_path = path.normalize( _self.options.new_path );

        if ( less_compile._catch.indexOf( _self.options.path ) === -1 ) {
            less_compile._catch.push( _self.options.path );
        } else {
            return;
        }

        fs.readFile( _self.options.path, 'utf8', ( err, contents ) => {
            if ( err ) {
                console.error( err );
                return;
            }

            less.render( contents, {
                paths : [ '.', _self.options.base_path ],
                filename : _self.options.path,
                compress : _self.options.compress,
                sourceMap : {},
            }, ( err, output ) => {
                if ( err ) {
                    console.error( err );
                    return;
                }

                fs.writeFile( _self.options.new_path, output.css, { flag : 'w+' }, ( err ) => {
                    if ( err ) {
                        console.error( err );
                        return;
                    }

                    console.log( _self.options.new_path + ' compiled.' );

                    if ( callback ) {
                        callback.call( output.css );
                    }
                } );

                if ( _self.options.map ) {
                    fs.writeFile( _self.options.new_path + '.map', output.map, { flag : 'w+' }, ( err ) => {
                        if ( err ) {
                            console.error( err );
                            return;
                        }

                        console.log( _self.options.new_path + '.map writed.' );
                    } );
                }
            } );
        } );

        return _self;
    },
};

