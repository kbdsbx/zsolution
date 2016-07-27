
const $ = require( __dirname + '/../js/inc.js' );
const assert = require( 'assert' );
const fs = require( 'fs' );
var binary_compile = require( __dirname + '/../js/assert-dev/binary.js' );

exports = module.exports = test_binary;

function test_binary () {
    test_binary.test_binary_compile();
}

test_binary.__proto__ = {
    test_binary_compile : function() {
        var opt = {
            path : __dirname + '/data/test-binary.jpg',
            new_path : __dirname + '/data/test-binary-output.jpg',
            compress : false,
        }

        binary_compile.compile( opt, function() {
            var _nf_info = $.get_info( __dirname + '/data/test-binary-output.jpg' );
            assert.ok( _nf_info );
            assert.equal( $.sha256_file( __dirname + '/data/test-binary.jpg' ), $.sha256_file( __dirname + '/data/test-binary-output.jpg' ) );
        } );
    }
};



