"use strict"

const fs = require( 'fs' );
const rl = require( 'readline-sync' );
const cr = require( 'crypto' );
const cp = require( 'child_process' );
const $ = require( __dirname + '/inc.js' );

exports = module.exports = dc;

function dc( opt ) {
    dc.options = $.extend( dc.options, opt );
}

dc.__proto__ = {
    options : {
        // folder path
        path: '',
        // clean sub-folder
        deep: false,
        // remove all of repeated files
        remove: false,
    },

    deep_cleaning : function() {
        var res = new Object();
        $.each( dc.options.path, function( file ) {
            var sha = $.sha256_file( file.path );

            console.log( `${file.path} computing...` );
            if ( res[sha] ) {
                console.log( `\n[${file.path}]\n samed as \n[${res[sha]}].` );

                if ( dc.options.remove ) {
                    fs.unlinkSync( file.path );
                } else {
                    var _selected;
                    do {
                        switch( _selected = rl.question( 'How to deal with? 1: ignore; 2: delete first; 3: delete last; 4: view both; (1)' ) ) {
                        default:
                            break;
                        case '2':
                            fs.unlinkSync( file.path );
                            break;
                        case '3':
                            fs.unlinkSync( res[sha] );
                            break;
                        case '4':
                            cp.exec( file.path );
                            cp.exec( res[sha] );
                            break;
                        }
                    } while ( _selected == '4' );
                }
            } else {
                res[sha] = file.path;
            }
        } );
    },
};

