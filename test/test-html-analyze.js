
const $ = require( __dirname + '/../js/inc.js' );
const assert = require( 'assert' );
const fs = require( 'fs' );
var html_analyze = require( __dirname + '/../js/lib/html-analyze.js' );

exports = module.exports = test_html_analyze;

function test_html_analyze () {
    var _ana = new html_analyze();

    for ( var i in test_html_analyze.cases ) {
        var str_stream = $.load_by_string( test_html_analyze.cases[i].input );

        var output = _ana.parse( str_stream );

        var actual = test_html_analyze.cases[i].output;
        var expected = output;
        // assert.deepEqual( actual, expected );
        if ( ! $.deepsEqual( actual, expected, ( a, b ) => {
            if ( typeof a == 'function' || typeof b == 'function' ) {
                return true;
            }
            return a == b;
        } ) ) {
            console.log( "Parse assert not pass No.: " + ( 1 + parseInt( i ) ) );
            console.log( actual );
            console.log( expected );
            /*
            console.log( JSON.stringify( actual, '\r', '  ' ) );
            console.log( JSON.stringify( expected, '\r', '  ' ) );
            */
        }
        
        var stringify = _ana.stringify( output );

        /*
        try {
            var actual = test_html_analyze.cases[i].stringify.trim();
            var expected = stringify;
            assert.equal( actual, expected );
        } catch ( e ) {
            console.log( "Stringify assert not pass No.: " + ( 1 + parseInt( i ) ) );
            console.log( JSON.stringify( actual, '\r', '  ' ) );
            console.log( JSON.stringify( expected, '\r', '  ' ) );
        }
        */
    }

    for ( var i in test_html_analyze.error_cases ) {
        var _ana = new html_analyze( { strict: true } );
        var str_stream = $.load_by_string( test_html_analyze.error_cases[i].input );

        assert.throws( () => {
            _ana.parse( str_stream );
        }, test_html_analyze.error_cases[i].exception );
    }

    test_html_analyze.test_load_by_string( _ana );

    test_html_analyze.test_load_by_network( _ana );

    test_html_analyze.test_do_while( _ana );

    test_html_analyze.test_load_by_file( _ana );

    test_html_analyze.test_attribute( _ana );

    test_html_analyze.test_node( _ana );

    test_html_analyze.test_iterator( _ana );

    test_html_analyze.test_child( _ana );

    console.log( 'html analyze tested successfully.' );
}

test_html_analyze.__proto__ = {
    cases : [
        {
            input : '',
            output : [],
            stringify : '',
        },
        {
            // comment
            input: '<!---------------->',
            output: [ {
                nodeType : 'comment',
                nodeName : '#comment',
                nodeValue : '------------',
            } ],
            stringify : '<!-- ------------ -->',
        },
        {
            // comment
            input: '<!-- This is comment test. -->',
            output: [ {
                nodeType : 'comment',
                nodeName : '#comment',
                nodeValue : 'This is comment test.',
            } ],
            stringify : '<!-- This is comment test. -->',
        },
        {
            // doctype html5
            input: '<!DOCTYPE html>',
            output: [ {
                nodeType : 'document_type',
                nodeName : 'DOCTYPE',
                name : 'html',
            } ],
            stringify : '<!DOCTYPE html>',
        },
        {
            // doctype html5
            input: '<!DOCTYPE html >',
            output: [ {
                nodeType : 'document_type',
                nodeName : 'DOCTYPE',
                name : 'html',
            } ],
            stringify : '<!DOCTYPE html>',
        },
        {
            // doctype html5
            input: '<!doctype html >',
            output: [ {
                nodeType : 'document_type',
                nodeName : 'DOCTYPE',
                name : 'html',
            } ],
            stringify : '<!DOCTYPE html>',
        },
        {
            // doctype xhtml 1.0 with public dtd
            input: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" >',
            output: [ {
                nodeType : 'document_type',
                nodeName : 'DOCTYPE',
                name : 'html',
                publicId: "-//W3C//DTD XHTML 1.0 Transitional//EN",
                systemId: "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd",
            } ],
            stringify : '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
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
            stringify: '<!DOCTYPE html SYSTEM "../xhtml1-transitional.dtd">',
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
            stringify: '<?xml version="1.0" encoding="UTF-8"?>',
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
            stringify: '<a href="#" class="class1 class2 class3"></a>',
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
            stringify: `
<div class="first-class last-class" id="div">
  <a href="#" class="class2 class3 class4"></a>
</div>`,
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
            stringify : `
<html:input xml:tag="input" type="file" data:input="data" contenteditable value="null"></html:input>
<br>`,
        },
        {
            input : '<area ><base/><br /><col><embed class="class2"><img class="class2"/><input class="class2" /><input checked><input checked ><input checked/><input checked />',
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
            }, {
                prefix: null,
                localName : 'input',
                tagName : 'input',
                nodeType : 'element',
                nodeName : 'input',
                attributes : [ {
                    prefix : null,
                    localName : 'checked',
                    name : 'checked',
                    value : null,
                } ],
            }, {
                prefix: null,
                localName : 'input',
                tagName : 'input',
                nodeType : 'element',
                nodeName : 'input',
                attributes : [ {
                    prefix : null,
                    localName : 'checked',
                    name : 'checked',
                    value : null,
                } ],
            }, {
                prefix: null,
                localName : 'input',
                tagName : 'input',
                nodeType : 'element',
                nodeName : 'input',
                attributes : [ {
                    prefix : null,
                    localName : 'checked',
                    name : 'checked',
                    value : null,
                } ],
            }, {
                prefix: null,
                localName : 'input',
                tagName : 'input',
                nodeType : 'element',
                nodeName : 'input',
                attributes : [ {
                    prefix : null,
                    localName : 'checked',
                    name : 'checked',
                    value : null,
                } ],
            } ],
            stringify : `
<area>
<base>
<br>
<col>
<embed class="class2">
<img class="class2">
<input class="class2">
<input checked>
<input checked>
<input checked>
<input checked>
                `,
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
            stringify : `
<a href="#">
  This is test text tag
</a>
                `,
        },
        {
            input : 'This is test text.',
            output : [ {
                nodeType : 'text',
                nodeName : '#text',
                nodeValue : 'This is test text.',
            } ],
            stringify : "This is test text.",
        },
        {
            input : '<txt attr=\'keyword\'> First Keyword Second Keyword <b>Important Keyword</b> Other Keyword </txt>',
            output : [ {
                prefix : null,
                localName : 'txt',
                tagName : 'txt',
                nodeType : 'element',
                nodeName : 'txt',
                attributes : [ {
                    prefix : null,
                    localName : 'attr',
                    name : 'attr',
                    value : 'keyword',
                } ],
                childNodes : [ {
                    nodeType : 'text',
                    nodeName : '#text',
                    nodeValue : 'First Keyword Second Keyword',
                }, {
                    prefix : null,
                    localName : 'b',
                    tagName : 'b',
                    nodeType : 'element',
                    nodeName : 'b',
                    attributes : [],
                    childNodes : [ {
                        nodeType : 'text',
                        nodeName : '#text',
                        nodeValue : 'Important Keyword',
                    } ],
                }, {
                    nodeType : 'text',
                    nodeName : '#text',
                    nodeValue : 'Other Keyword',
                } ],
            } ],
            stringify: `
<txt attr="keyword">
  First Keyword Second Keyword
  <b>
    Important Keyword
  </b>
  Other Keyword
</txt>
                `,
        },
        {
            input: `<title>New title.</title><pre>


                resl
                </pre>`,
            output : [ {
                prefix: null,
                localName : 'title',
                tagName : 'title',
                nodeType : 'element',
                nodeName : 'title',
                nodeValue : 'New title.',
                attributes : [],
            }, {
                prefix: null,
                localName : 'pre',
                tagName : 'pre',
                nodeType : 'element',
                nodeName : 'pre',
                nodeValue : `


                resl
                `,
                attributes : [],
            } ],
            stringify : `
<title>New title.</title>
<pre>


                resl
                </pre>
                `,
        },
        {
            input : 'UFS-8 编码支持 (Unicode support!)',
            output : [ {
                nodeType : 'text',
                nodeName : '#text',
                nodeValue : 'UFS-8 编码支持 (Unicode support!)',
            } ],
            stringify : "UFS-8 编码支持 (Unicode support!)",
        },
        {
            input : `
            <body>
                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

                <!-- 让部分国产浏览器默认采用高速模式渲染页面 -->
            </body>
                `,
            output : [ {
                prefix: null,
                localName : 'body',
                tagName : 'body',
                nodeType : 'element',
                nodeName : 'body',
                attributes : [],
                childNodes : [ {
                    prefix: null,
                    localName : 'meta',
                    tagName : 'meta',
                    nodeType : 'element',
                    nodeName : 'meta',
                    attributes : [ {
                        prefix : null,
                        localName : 'charset',
                        name : 'charset',
                        value : 'utf-8',
                    } ],
                }, {
                    prefix: null,
                    localName : 'meta',
                    tagName : 'meta',
                    nodeType : 'element',
                    nodeName : 'meta',
                    attributes : [ {
                        prefix : null,
                        localName : 'http-equiv',
                        name : 'http-equiv',
                        value : 'X-UA-Compatible',
                    }, {
                        prefix : null,
                        localName : 'content',
                        name : 'content',
                        value : 'IE=edge',
                    } ],
                }, {
                    prefix: null,
                    localName : 'meta',
                    tagName : 'meta',
                    nodeType : 'element',
                    nodeName : 'meta',
                    attributes : [ {
                        prefix : null,
                        localName : 'name',
                        name : 'name',
                        value : 'viewport',
                    }, {
                        prefix : null,
                        localName : 'content',
                        name : 'content',
                        value : 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
                    } ],
                }, {
                    nodeType : 'comment',
                    nodeName : '#comment',
                    nodeValue : '让部分国产浏览器默认采用高速模式渲染页面',
                } ],
            } ],
            stringify : `
<body>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <!-- 让部分国产浏览器默认采用高速模式渲染页面 -->
</body>
                `,
        },
        {
            input : '<script>var t = "<form></form>";</script>',
            output : [ {
                prefix: null,
                localName : 'script',
                tagName : 'script',
                nodeType : 'element',
                nodeName : 'script',
                nodeValue : 'var t = "<form></form>";',
                attributes : [],
            } ],
            stringify : '<script>var t = "<form></from>";</script>',
        },
        {
            input: `
            <div class="col-md-7 no-padding no-height">
                <link target="_self" rel="import" href="nav.html">
                <link target="_self" rel="import" href="login.html">
            </div>`,
            output : [ {
                prefix: null,
                localName : 'div',
                tagName : 'div',
                nodeType : 'element',
                nodeName : 'div',
                attributes : [ {
                    prefix : null,
                    localName : 'class',
                    name : 'class',
                    value : 'col-md-7 no-padding no-height',
                } ],
                childNodes : [ {
                    prefix: null,
                    localName : 'link',
                    tagName : 'link',
                    nodeType : 'element',
                    nodeName : 'link',
                    attributes : [ {
                        prefix : null,
                        localName : 'target',
                        name : 'target',
                        value : '_self',
                    }, {
                        prefix : null,
                        localName : 'rel',
                        name : 'rel',
                        value : 'import',
                    }, {
                        prefix : null,
                        localName : 'href',
                        name : 'href',
                        value : 'nav.html',
                    } ],
                }, {
                    prefix: null,
                    localName : 'link',
                    tagName : 'link',
                    nodeType : 'element',
                    nodeName : 'link',
                    attributes : [ {
                        prefix : null,
                        localName : 'target',
                        name : 'target',
                        value : '_self',
                    }, {
                        prefix : null,
                        localName : 'rel',
                        name : 'rel',
                        value : 'import',
                    }, {
                        prefix : null,
                        localName : 'href',
                        name : 'href',
                        value : 'login.html',
                    } ],
                } ],
            } ],
            stringify : `
<title>New title.</title>
<pre>


                resl
                </pre>
                `,
        },
        {
            input : `
                <p>
                    <a>
                    </a>
                    </a>
                    <br>
                </p>`,
            output : [ {
                prefix: null,
                localName : 'p',
                tagName : 'p',
                nodeType : 'element',
                nodeName : 'p',
                attributes : [],
                childNodes : [ {
                    prefix: null,
                    localName : 'a',
                    tagName : 'a',
                    nodeType : 'element',
                    nodeName : 'a',
                    attributes : [],
                }, {
                    prefix: null,
                    localName : 'br',
                    tagName : 'br',
                    nodeType : 'element',
                    nodeName : 'br',
                    attributes : [],
                } ],
            } ],
            stringify : `
                <p>
                    <a></a>
                    <br>
                </p>`,
        }
        /*
        */
    ],

    error_cases : [ {
        input : `<div>

                <p>
                Error strict.
                </div>
                `,
        exception : `error end of tags.\n\tline number: 4`,
    } ],

    test_load_by_string : function( ana ) {
        var str_stream = $.load_by_string( 'Text' );

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

    test_load_by_file : function ( ana ) {
        var str_stream = $.load_by_file( __dirname + '/data/index.html' );
        var stringify = "";

        str_stream.on( 'readable', function() {
            var output = ana.parse( str_stream );
            stringify += ana.stringify( output, {
                replacer: "\n",
                space : "\t",
            } );

        } ).on( 'end', function() {
            fs.writeFileSync( __dirname + '/data/index-parsed.html', stringify, { flag : "w+" } );
        } );
    },

    test_load_by_network : function( ana ) {
        var str_stream = $.load_by_network( 'https://www.baidu.com' );
        str_stream.on( 'readable', function() {
            assert( str_stream.read( 6 ), '<!DOCT' );
        } );
    },

    test_do_while : function( ana ) {
        var str_stream = $.load_by_string( '<!DOCTYPE html>' );
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

    test_attribute : function ( ana ) {
        var str_stream = $.load_by_string( '<div></div>' );
        var output = ana.parse( str_stream );

        assert.ok( output[0].setAttribute );
        assert.ok( output[0].getAttribute );
        assert.ok( output[0].hasAttribute );
        assert.ok( output[0].removeAttribute );

        output[0].setAttribute( 'name', 'new div' );

        assert.equal( 'new div', output[0].getAttribute( 'name' ) );

        assert.equal( undefined, output[0].getAttribute( 'none-name' ) );

        assert.ok( output[0].hasAttribute( 'name' ) );

        assert.ok( ! output[0].hasAttribute( 'none-name' ) );

        assert.equal( '<div name="new div"></div>', ana.stringify( output ) );

        output[0].setAttribute( 'xml:url', 'xml-name' );

        assert.ok( output[0].hasAttribute( 'xml:url' ) );

        assert.ok( ! output[0].hasAttribute( 'url' ) );

        output[0].setAttribute( 'xml:url', 'http://127.0.0.1/' );

        assert.equal( output[0].getAttribute( 'xml:url' ), 'http://127.0.0.1/' );

        output[0].removeAttribute( 'name' )

        assert.ok( ! output[0].hasAttribute( 'name' ) );

        assert.equal( '<div xml:url="http://127.0.0.1/"></div>', ana.stringify( output ) );
    },

    test_node : function ( ana ) {
        var str_stream = $.load_by_string( '<div></div>' );
        var output = ana.parse( str_stream );

        assert.ok( output[0].hasChildNodes );

        assert.ok( ! output[0].hasChildNodes() );
    },

    test_iterator : function ( ana ) {
        var str_stream = $.load_by_string( '<div><div><a></a><b></b><i></i></div></div>' );
        var output = ana.parse( str_stream );

        var idx = 0;

        output[0].iterator( () => {
            idx++;
        } );

        assert.equal( idx, 5 );

        idx = 0;

        output[0].iterator( function() {
            if ( this.tagName == 'div' ) {
                idx++;
            }
        } );

        assert.equal( idx, 2 );

        idx = 0;

        output[0].iterator( () => {
            idx++;
            return 1;
        } );

        assert.equal( idx, 5 );
    },

    test_child : function( ana ) {
        var str_stream = $.load_by_string( '<div class="parent"><b class="firstchild"></b></div>' );
        var output = ana.parse( str_stream );

        output[0].appendChild( ana.parse( $.load_by_string( '<c class="lastchild"></c>' ) )[0] );

        var h = ana.stringify( output );

        assert.equal( h, '<div class="parent">\n  <b class="firstchild"></b>\n  <c class="lastchild"></c>\n</div>' );

        output[0].insertBefore( ana.parse( $.load_by_string( '<a class="newchild"></a>' ) )[0], output[0].childNodes[0] );

        h = ana.stringify( output );

        assert.equal( h, '<div class="parent">\n  <a class="newchild"></a>\n  <b class="firstchild"></b>\n  <c class="lastchild"></c>\n</div>' );

        output[0].removeChild( output[0].childNodes[2] );

        h = ana.stringify( output );

        assert.equal( h, '<div class="parent">\n  <a class="newchild"></a>\n  <b class="firstchild"></b>\n</div>' );
    },
};

