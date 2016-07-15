"use strict"

const fs = require( 'fs' );
const $ = require( __dirname + '/inc.js' );


exports = module.exports = test;

function test( opt ) {
    let _self = test;

    $.extend( _self.options, opt );

    if ( _self.options.name ) {
        let _test_js = __dirname + '/../test/test-' + _self.options.name + '.js';
        if ( fs.existsSync( _test_js ) ) {
            let testing = require( _test_js );
            testing();
        }
    } else {
        let _test_dir = __dirname + '/../test';
        $.each( _test_dir, function( f_info ) {
            if ( f_info.isFile ) {
                if ( /^test-(.+?)\.js$/i.test( f_info.name + f_info.ext ) ) {
                    let testing = require( f_info.path );
                    testing();
                }
            }
        } );
    }
}

test.__proto__ = {
    options : {
        name : null,
    },
}

