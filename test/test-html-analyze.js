
const assert = require( 'assert' );
var html_analyze = require( __dirname + '/../js/lib/html-analyze.js' );

exports = module.exports = test_html_analyze;

function test_html_analyze () {
    var _ana = html_analyze( {
        strict: true,
    } );

    for ( var i in test_html_analyze.cases ) {
        var str_stream = _ana.load_by_string( test_html_analyze.cases[i].input );
        var output = _ana.analyzing( str_stream );

        try {
            var actual = test_html_analyze.cases[i].output;
            var expected = output
            assert.deepEqual( actual, expected );
        } catch( e ) {
            console.log( JSON.stringify( actual, null, '\t' ) );
            console.log( JSON.stringify( expected, null, '\t' ) );
        }
    }

    test_html_analyze.test_load_by_string( _ana );

    test_html_analyze.test_do_while( _ana );
}

test_html_analyze.__proto__ = {
    cases : [
        {
            input : '',
            output : [],
        },
        {
            // comment
            input: '<!---------------->',
            output: [ {
                nodeType : 'comment',
                nodeName : '#comment',
                nodeValue : '------------',
            } ],
        },
        {
            // doctype html5
            input: '<!DOCTYPE html>',
            output: [ {
                nodeType : 'document_type',
                nodeName : 'DOCTYPE',
                name : 'html',
            } ],
        },
        {
            // doctype html5
            input: '<!DOCTYPE html >',
            output: [ {
                nodeType : 'document_type',
                nodeName : 'DOCTYPE',
                name : 'html',
            } ],
        },
        {
            // doctype xhtml 1.0 with public dtd
            input: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" >',
            output: [ {
                nodeType : 'document_type',
                nodeName : 'DOCTYPE',
                name : 'html',
                publicId : "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd",
                fpi: "-//W3C//DTD XHTML 1.0 Transitional//EN",
            } ],
        },
        {
            // doctype html with system dtd
            input: '<!DOCTYPE html SYSTEM "../xhtml1-transitional.dtd">',
            output: [ {
                nodeType : 'document_type',
                nodeName : 'DOCTYPE',
                name : 'html',
                systemId : "../xhtml1-transitional.dtd",
            } ],
        },
        {
            input: '<?xml version="1.0" encoding="UTF-8"?>',
            output: [ {
                nodeType : 'document_type',
                nodeName : 'xml',
                attributes : [ {
                    prefix : null,
                    localName : 'version',
                    name : 'version',
                    value : '1.0',
                }, {
                    prefix : null,
                    localName : 'encoding',
                    name : 'encoding',
                    value : 'UTF-8',
                } ],
            } ],
        },
        {
            input : '<a href="#" class="class1 class2 class3"></a>',
            output: [ {
                prefix : null,
                localName : 'a',
                tagName : 'a',
                nodeType : 'element',
                nodeName : 'a',
                childNodes : [],
                attributes : [ {
                    prefix : null,
                    localName : 'href',
                    name : 'href',
                    value : '#',
                }, {
                    prefix : null,
                    localName : 'class',
                    name : 'class',
                    value : 'class1 class2 class3',
                } ],
            } ],
        },
        {
            input : '<div class="first-class last-class" id = "div"><a href="#" class="class2 class3 class4"></a></div>',
            output : [ {
                prefix : null,
                localName : 'div',
                tagName : 'div',
                nodeType : 'element',
                nodeName : 'div',
                childNodes : [ {
                    prefix : null,
                    localName : 'a',
                    tagName : 'a',
                    nodeType : 'element',
                    nodeName : 'a',
                    childNodes : [],
                    attributes : [ {
                        prefix : null,
                        localName : 'href',
                        name : 'href',
                        value : '#',
                    }, {
                        prefix : null,
                        localName : 'class',
                        name : 'class',
                        value : 'class2 class3 class4',
                    } ],
                } ],
                attributes : [ {
                    prefix : null,
                    localName : 'class',
                    name : 'class',
                    value : 'first-class last-class',
                }, {
                    prefix : null,
                    localName : 'id',
                    name : 'id',
                    value : 'div',
                } ],
            } ],
        },
        {
            input : '<html:input xml:tag="input" type ="file" data:input= "data" contenteditable value="null"></html:input><br>',
            output : [ {
                prefix: 'html',
                localName : 'input',
                tagName : 'html:input',
                nodeType : 'element',
                nodeName : 'html:input',
                childNodes : [],
                attributes : [ {
                    prefix : 'xml',
                    localName : 'tag',
                    name : 'xml:tag',
                    value : 'input',
                }, {
                    prefix : null,
                    localName : 'type',
                    name : 'type',
                    value : 'file',
                }, {
                    prefix : 'data',
                    localName : 'input',
                    name : 'data:input',
                    value : 'data',
                }, {
                    prefix : null,
                    localName : 'contenteditable',
                    name : 'contenteditable',
                    value : null,
                }, {
                    prefix : null,
                    localName : 'value',
                    name : 'value',
                    value : 'null',
                } ],
            }, {
                prefix: null,
                localName : 'br',
                tagName : 'br',
                nodeType : 'element',
                nodeName : 'br',
                attributes : [],
            } ],
        },
        {
            input : '<area ><base/><br /><col><embed class="class2"><img class="class2"/><input class="class2" />',
            output : [ {
                prefix: null,
                localName : 'area',
                tagName : 'area',
                nodeType : 'element',
                nodeName : 'area',
                attributes : [],
            }, {
                prefix: null,
                localName : 'base',
                tagName : 'base',
                nodeType : 'element',
                nodeName : 'base',
                attributes : [],
            }, {
                prefix: null,
                localName : 'br',
                tagName : 'br',
                nodeType : 'element',
                nodeName : 'br',
                attributes : [],
            }, {
                prefix: null,
                localName : 'col',
                tagName : 'col',
                nodeType : 'element',
                nodeName : 'col',
                attributes : [],
            }, {
                prefix: null,
                localName : 'embed',
                tagName : 'embed',
                nodeType : 'element',
                nodeName : 'embed',
                attributes : [ {
                    prefix : null,
                    localName : 'class',
                    name : 'class',
                    value : 'class2',
                } ],
            }, {
                prefix: null,
                localName : 'img',
                tagName : 'img',
                nodeType : 'element',
                nodeName : 'img',
                attributes : [ {
                    prefix : null,
                    localName : 'class',
                    name : 'class',
                    value : 'class2',
                } ],
            }, {
                prefix: null,
                localName : 'input',
                tagName : 'input',
                nodeType : 'element',
                nodeName : 'input',
                attributes : [ {
                    prefix : null,
                    localName : 'class',
                    name : 'class',
                    value : 'class2',
                } ],
            } ],
        },
        {
            input : '<a href="#">This is test text tag</a>',
            output : [{
                prefix : null,
                localName : 'a',
                tagName : 'a',
                nodeType : 'element',
                nodeName : 'a',
                attributes : [ {
                    prefix : null,
                    localName : 'href',
                    name : 'href',
                    value : '#',
                } ],
                childNodes : [ {
                    nodeType : 'text',
                    nodeName : '#text',
                    nodeValue : 'This is test text tag',
                } ],
            }],
        },

        /*
        */
    ],

    test_load_by_string : function( ana ) {
        var str_stream = ana.load_by_string( 'Text' );

        assert( str_stream.read( 1 ), 'T' );

        str_stream.unshift( 'T' );

        assert( str_stream.read( 4 ), 'Test' );

        str_stream.unshift( 'Test of new string.' );

        str_stream.read( 5 );

        var ck;
        str_stream.on( 'readable', () => {
            var _ck;
            while( null !== ( _ck = str_stream.read() ) ) {
                ck += _ck;
            }
        } ).on( 'end', () => {
            assert( ck, 'of new string.' );
        } );
    },

    test_do_while : function( ana ) {
        var str_stream = ana.load_by_string( '<!DOCTYPE html>' );
        var idx;

        idx = ana._do_while( str_stream, "<", "!", "\\w", " " );

        assert( idx, { chunk: "", reg: "<", data : "<" } );

        idx = ana._do_while( str_stream, "<", "!", "\\w", " " );

        assert( idx, { chunk: "", reg: "!", data : "!" } );

        idx = ana._do_while( str_stream, "<", "!", " " );

        assert( idx, { chunk: "DOCTYPE", reg: " ", data : " " } );

        idx = ana._do_while( str_stream, "<", "!", " ", ">" );

        assert( idx, { chunk: "html", reg: ">", data : ">" } );

        idx = ana._do_while( str_stream, "<", "!", " ", ">" );

        assert( ! idx );
    },
};

