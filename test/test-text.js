
const $ = require( __dirname + '/../js/inc.js' );
const assert = require( 'assert' );
const fs = require( 'fs' );
var text_compile = require( __dirname + '/../js/assert-dev/text.js' );

exports = module.exports = test_text;

function test_text () {
    test_text.test_text_compile();
}

test_text.__proto__ = {
    test_text_compile : function() {
        var opt = {
            path : __dirname + '/data/test-text.json',
            new_path : __dirname + '/data/test-text-output.json',
            compress : false,
        }

        text_compile.compile( opt, function() {
            var _nf_info = $.get_info( __dirname + '/data/test-text-output.json' );
            assert.ok( _nf_info );
            assert.equal( $.sha256_file( __dirname + '/data/test-text.json' ), $.sha256_file( __dirname + '/data/test-text-output.json' ) );
        } );
    }
};


