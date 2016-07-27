
const $ = require( __dirname + '/../js/inc.js' );
const assert = require( 'assert' );
const fs = require( 'fs' );
var html = require( __dirname + '/../js/assert/html2.js' );
var html_analyze = require( __dirname + '/../js/lib/html-analyze.js' );

exports = module.exports = test_compile;

function test_compile () {
    var _h = new html( {}, {}, {} );
    var _ana = new html_analyze();

    for ( var i in test_compile.cases ) {
        var stm = _ana.load_by_string( test_compile.cases[i].input );

        var actual = test_compile.cases[i].output;
        _h.compile( {}, stm, ( expected ) => {
            if ( ! $.deepsEqual( actual, expected, ( a, b ) => {
                if ( typeof a == 'function' || typeof b == 'function' ) {
                    return true;
                }
                return a == b;
            } ) ) {
                console.log( "Parse assert not pass No.: " + ( 1 + parseInt( i ) ) );
                console.log( actual );
                console.log( expected );
            }
        } );

    }
}

test_compile.__proto__ = {
    cases : [ {
        input : "",
        output : "",
    } ],

    test_compile : function() {
    },
};

