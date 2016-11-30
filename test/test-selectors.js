const $ = require( __dirname + '/../js/inc.js' );
const assert = require( 'assert' );
var query_selector = require( __dirname + '/../js/lib/selector.js' );

exports = module.exports = test_selectors;

function test_selectors () {
    var _query = new query_selector();

    for ( var i in test_selectors.cases ) {
        var _stm = $.load_by_string( test_selectors.cases[i].input );
        var expected = _query.parse( _stm );
        var actual = test_selectors.cases[i].output;

        // assert.deepEqual( actual, expected );
        if ( ! $.deepsEqual( actual, expected, ( a, b ) => {
            if ( typeof a === 'function' || typeof b === 'function' ) {
                return true;
            }
            return a == b;
        } ) ) {
            console.log( "Parse assert not pass No.: " + ( 1 + parseInt( i ) ) );
            /*
            console.log( actual );
            console.log( expected );
            */
            console.log( JSON.stringify( actual, '\r', '  ' ) );
            console.log( JSON.stringify( expected, '\r', '  ' ) );
            return;
        }
    }
}

test_selectors.__proto__ = {
    cases : [
        {
            input : '*',
            output : [],
        },
        {
            input : 'a',
            output : [ {
                p_name : 'a',
            } ],
        },
        {
            input : 'input.new_class.old_class',
            output : [ {
                p_name : 'input',
                p_attrs : {
                    'class' : [
                        `\bnew_class\b`,
                        `\bold_class\b`,
                    ],
                }
            } ],
        },
        {
            input : 'div#myid.class',
            output : [ {
                p_name : 'div',
                p_attrs : {
                    'class' : [
                        `\bclass\b`,
                    ],
                    'id' : [
                        `^myid$`,
                    ],
                },
            } ],
        },
        {
            input : `[foo="bar"][foo1][foo2~="bar2"][foo3^="bar3"][foo4$=bar4][foo5*=bar5][foo6|=bar6]`,
            output : [ {
                p_attrs : {
                    'foo' : [
                        `^bar$`,
                    ],
                    'foo1' : [
                    ],
                    'foo2' : [
                        `\bbar2\b`,
                    ],
                    'foo3' : [
                        `^bar3`,
                    ],
                    'foo4' : [
                        `bar4$`,
                    ],
                    'foo5' : [
                        `.*?bar5.*?`,
                    ],
                    'foo6' : [
                        `\bbar6-.*?\b`,
                    ],
                },
            } ],
        },
        {
            input : `html:not(:root):matches(:empty):has(:blank) body:blank`,
            output : [ {
                p_name : 'html',
                p_not : [ {
                    p_root : true,
                } ],
                p_matches : [ {
                    p_empty : true,
                } ],
                p_has : [ {
                    p_blank: true,
                } ],
                far_selector : {
                    p_name : 'body',
                    p_blank : true,
                },
            } ],
        },
        {
            input : `:dir(ltr):dir(xx):lang(zh)`,
            output : [ {
                p_attrs : {
                    'dir' : [
                        `^ltr$`,
                    ],
                    'lang' : [
                        `^zh(-.*?)?$`
                    ],
                },
            } ],
        },
        {
            input : `:root:empty:blank`,
            output : [ {
                p_root : true,
                p_empty : true,
                p_blank : true,
            } ],
        },
        {
            input : `:nth-child(odd):nth-last-child(odd):first-child:last-child:only-child`,
            output : [ {
                p_nth_child : [ 'odd', '1' ],
                p_nth_last_child : [ 'odd', '1' ],
            } ],
        },
        {
            input : `:nth-child(odd):first-child`,
            output : [ {
                p_nth_child : [ 'odd', '1' ],
            } ],
        },
        {
            input : `:nth-of-type(even):nth-last-of-type(even):first-of-type:last-of-type:only-of-type`,
            output : [ {
                p_nth_of_type: [ 'even', '1' ],
                p_nth_last_of_type : [ 'even', '1' ],
            } ],
        },
        {
            input : `:nth-last-of-type(even):first-of-type`,
            output : [ {
                p_nth_of_type: [ '1' ],
                p_nth_last_of_type : [ 'even' ],
            } ],
        },
        {
            input : `html >> body > div.main .contents + .footer ~ #copyright`,
            output : [ {
                p_name : 'html',
                far_selector : {
                    p_name : 'body',
                    child_selector : {
                        p_name : 'div',
                        p_attrs : {
                            'class' : `\bmain\b`,
                        },
                        far_selector : {
                            p_attrs : {
                                'class' : `\bcontents\b`,
                            },
                            immediately_preced_selector : {
                                p_attrs : {
                                    'class' : `\bfooter\b`,
                                },
                                preced_selector : {
                                    p_attrs : {
                                        'id' : `^copyright$`,
                                    },
                                }
                            },
                        }
                    },
                },
            } ],
        },
        {
            input : `:not( html, body, :root )`,
            output : [ {
                p_not : [ {
                    p_name : 'html',
                }, {
                    p_name : 'body',
                }, {
                    p_root : true,
                } ],
            } ],
        },
        {
            input : `a, b, c`,
            output : [ {
                p_name : 'a',
            }, {
                p_name : 'b',
            }, {
                p_name : 'c',
            } ],
        },
    ],
};

