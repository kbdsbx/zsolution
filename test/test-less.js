
const $ = require( __dirname + '/../js/inc.js' );
const assert = require( 'assert' );
const fs = require( 'fs' );
var less_compile = require( __dirname + '/../js/assert-dev/less.js' );

exports = module.exports = test_less;

function test_less () {
    test_less.test_less_compile();
}

test_less.__proto__ = {
    test_less_compile : function() {
        var opt = {
            path : __dirname + '/data/test-less.less',
            new_path : __dirname + '/data/test-less-output.css',
            base_path : __dirname + '/data',
            compress : false,
            map : false,
        }

        less_compile.compile( opt, function() {
            var _nf_info = $.get_info( __dirname + '/data/test-less-output.css' );
            assert.ok( _nf_info );
            assert.equal( _nf_info.size, 35128 );
        } );

        less_compile._catch = [];

        opt.compress = true;
        opt.new_path = __dirname + '/data/test-less-output.min.css';

        less_compile.compile( opt, function() {
            var _nf_info = $.get_info( __dirname + '/data/test-less-output.min.css' );
            assert.ok( _nf_info );
            assert.equal( _nf_info.size, 26589 );
        } );
    }
};



