
const $ = require( __dirname + '/../js/inc.js' );
const assert = require( 'assert' );
const fs = require( 'fs' );
var js_compile = require( __dirname + '/../js/assert-dev/js.js' );

exports = module.exports = test_js;

function test_js () {
    test_js.test_js_compile();
}

test_js.__proto__ = {
    test_js_compile : function() {
        var opt = {
            path : __dirname + '/data/test-js.js',
            new_path : __dirname + '/data/test-js-output.js',
            base_path : __dirname + '/data',
            compress : false,
            map : false,
        }

        js_compile.compile( opt, function() {
            var _nf_info = $.get_info( __dirname + '/data/test-js-output.js' );
            assert.ok( _nf_info );
            assert.equal( $.sha256_file( __dirname + '/data/test-js.js' ), $.sha256_file( __dirname + '/data/test-js-output.js' ) );
        } );

        js_compile._catch = [];

        opt.compress = true;
        opt.new_path = __dirname + '/data/test-js-output.min.js';

        js_compile.compile( opt, function() {
            var _nf_info = $.get_info( __dirname + '/data/test-js-output.min.js' );
            assert.ok( _nf_info );
            assert.equal( _nf_info.size, 1012 );
        } );
    }
};




