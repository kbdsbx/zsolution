
const $ = require( __dirname + '/../js/inc.js' );
const assert = require( 'assert' );
const fs = require( 'fs' );
var directory_compile = require( __dirname + '/../js/assert-dev/directory.js' );

exports = module.exports = test_directory;

function test_directory () {
    test_directory.test_directory_compile();
}

test_directory.__proto__ = {
    test_directory_compile : function() {
        var opt = {
            path : __dirname + '/data/test-directory',
            new_path : __dirname + '/data/test-directory-output',
            compress : false,
        }

        directory_compile.compile( opt, function() {
            var _nf_info = $.get_info( __dirname + '/data/test-directory-output' );
            assert.ok( _nf_info );
        } );

        opt.compress = true;
        opt.new_path = __dirname + '/data/test-directory-output-empty';

        directory_compile.compile( opt, function() {
            var _nf_info = $.get_info( __dirname + '/data/test-directory-output-empty' );
            assert.ok( ! _nf_info );
        } );
    }
};




