
const $ = require( __dirname + '/../js/inc.js' );
const assert = require( 'assert' );
const fs = require( 'fs' );
var css_compile = require( __dirname + '/../js/assert-dev/css.js' );

exports = module.exports = test_css;

function test_css () {
    test_css.test_css_compile();
}

test_css.__proto__ = {
    test_css_compile : function() {
        var opt = {
            path : __dirname + '/data/test-css.css',
            new_path : __dirname + '/data/test-css-output.css',
            compress : false,
        }

        css_compile.compile( opt, function() {
            var _nf_info = $.get_info( __dirname + '/data/test-css-output.css' );
            assert.ok( _nf_info );
            assert.equal( $.sha256_file( __dirname + '/data/test-css.css' ), $.sha256_file( __dirname + '/data/test-css-output.css' ) );
        } );

        css_compile._catch = [];

        opt.compress = true;
        opt.new_path = __dirname + '/data/test-css-output.min.css';

        css_compile.compile( opt, function() {
            var _nf_info = $.get_info( __dirname + '/data/test-css-output.min.css' );
            assert.ok( _nf_info );
            assert.equal( _nf_info.size, 26589 );
        } );
    }
};




