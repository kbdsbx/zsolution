"use strict"

const stream = require( 'stream' );
const buffer = require( 'buffer' );
const $ = require( __dirname + '/../inc.js' );

exports = module.exports = html_analyze;

function html_analyze ( opt ) {
    var _self = html_analyze;
    _self.options = $.extend( _self.options, opt );

    return _self;
}

/**
 * Base node;
 */

function node() {
    return this;
}

node.prototype = {
    // element, 
    // text, 
    // processing instruction,
    // comment,
    // document,
    // document type,
    // document fragment
    nodeType: null,

    // element name,
    // #text,
    // its target,
    // #comment,
    // #document,
    // document type name,
    // #document-fragment
    nodeName: null,

    // text,
    // comment,
    // context object in processing instruction
    // null for any other node.
    nodeValue: null,

    childNodes: [],
};

/**
 * Element
 */

function element( prefix, localName ) {
    this.prefix = prefix;
    this.localName = localName;
    this.tagName = prefix ? prefix + ":" + localName : localName;

    this.nodeType = 'element';
    this.nodeName = this.tagName;

    return this;
}

element.prototype = $.extend( new node(), {
    // before ":" in nodeName
    prefix : null,
    // after ":" in nodeName
    localName : null,

    // [prefix:localName] or [localName] if prefix is null
    tagName : null,

    attributes : [],

    getAttribute : function( name ) {
    },

    setAttribute : function( name ) {
        // coming soon;
    },

    hasAttribute : function( name ) {
    },
} );


/**
 * Attribute
 */

function attribute( prefix, localName, value ) {
    this.prefix = prefix;
    this.localName = localName;
    this.name = prefix ? prefix + ":" + localName : localName;
    this.value = value;

    return this;
}

attribute.prototype = {
    // namespace prefix that before ":" in attribute name
    prefix : null,
    // localname that after ":" in attribute name
    localName : null,
    name : null,
    value : null,
};


/**
 * Document type
 */

function doctype( nodeName ) {
    this.nodeType = 'document_type';
    this.nodeName = nodeName;

    return this;
}

doctype.prototype = $.extend( new node(), {
    publicId : null,
    systemId : null,
    fpi : null,
} );


/**
 * Xml head
 */

function xml() {
    this.nodeType = 'document_type';
    this.nodeName = 'xml';
    return this;
}

xml.prototype = $.extend( new node(), {
    version : null,
    encoding : null,
} );


/**
 * Text
 */

function text ( textValue ) {
    this.nodeType = 'text';
    this.nodeName = '#text';
    this.nodeValue = textValue;

    return this;
}

text.prototype = $.extend( new node(), {
} );


/**
 * Comment
 */

function comment ( nodeValue ) {
    this.nodeType = 'comment';
    this.nodeName = '#comment';

    return this;
}

comment.prototype = $.extend( new node(), {
} );


html_analyze.__proto__ = {
    options : {
        strict: false,
    },

    load_by_string : function( text ) {
        var bf = new Buffer( text );
        var rb = new stream.Readable( {
            encoding: 'utf8',
            objectMode: false,
        } );
        rb._read = function _read( size ) {
        };

        rb.push( bf );

        return rb;
    },

    load_by_file : function( path ) {
    },

    analyzing : function( stm ) {
        return this._dom_start( stm );
    },

    /**
     * stm : readstream
     * regs : array or string
     * <more> : string
     *
     * e.g.
     *   _do_while( stream, "reg1", "reg2", "reg3" );
     *   _do_while( stream, [ "reg1", "reg2", "reg3" ] );
     */
    _do_while( stm, regs /* ... */ ) {
        var _data, _chunk = "";
        var _regs = [];

        if ( regs instanceof Array ) {
            _regs = regs;
        } else {
            for ( var idx = 0; idx < arguments.length; idx++ ) {
                _regs[idx] = arguments[idx];
            }
        }
      
        while ( _data = stm.read( 1 ) ) {
            for ( var idx = 1; idx < _regs.length; idx++ ) {
                if ( RegExp( _regs[idx], 'i' ).test( _data ) ) {
                    return { chunk : _chunk, reg : _regs[idx], data: _data };
                }
            }

            _chunk += _data;
        }

        return null;
    },

    _dom_start : function( stm ) {
        var next = null;

        while ( next = this._do_while( stm, "\\S" ) ) {
            stm.unshift( next.data );
            return this._node_start( stm );
        }

        return [];
    },

    /**
     * node start
     */
    _node_start : function( stm ) {
        var _nodes = [];
        var _node = null;
        var next = null;

        while ( next = this._do_while( stm, "<", "[^\\s<]" ) ) {
            if ( next.reg == "<" ) {
                var _n = stm.read( 1 );
                if ( _n == '/' ) {
                    if ( _node ) {
                        _n = this._do_while( stm, ">" );
                        if ( _node.tagName == _n.chunk ) {
                            // end tag in current elemenet
                            _node = null;
                            continue;
                        } else {
                            // error end of tags.
                            throw "error end of tags";
                        }
                        break;
                    } else {
                        stm.unshift( next.data + _n );
                        return _nodes;
                    }
                } else {
                    stm.unshift( _n );
                }
                _node = new node();
                this._tag_start( stm, _node );
                _nodes.push( _node );
            } else if ( next.reg == "[^\\s<]" ) {
                if ( next.data.trim().length > 0 ) {
                    stm.unshift( next.data );

                    _node = new text();
                    this._text_start( stm, _node );
                    _nodes.push( _node );
                    _node = null;
                }
            }
        }

        return _nodes;
    },

    _tag_start : function( stm, _node ) {
        var next = null;

        while ( next = this._do_while( stm, "!", "\\?", " ", ">", "\\/" ) ) {
            switch ( next.reg ) {
            case " ":
            case ">":
            case "\\/":
                // tag name
                if ( ! _node.nodeName ) {
                    var _n = next.chunk.toLowerCase().trim();
                    if ( _n.length > 0 ) {
                        var _pn = _n.split( ":" );

                        if ( _pn.length != 2 ) {
                            element.call( _node, null, _n );
                        } else {
                            element.call( _node, _pn[0], _pn[1] );
                        }

                        if ( next.reg == " " ) {
                            _node.attributes = this._attribute_start( stm, _node );
                        } else {
                            _node.attributes = [];
                        }
                    }
                }

                // tag end
                if ( next.reg == '>' && _node.nodeName ) {
                    // html only
                    // void elememts list, from [https://www.w3.org/TR/html/syntax.html#void-elements]
                    var _end_tag_forbidden = [ 'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr' ];
                    if ( _end_tag_forbidden.indexOf( _node.tagName ) != -1 ) {
                    } else {
                        // recursive into child node
                        _node.childNodes = this._node_start( stm );
                    }
                    return;
                }
                // end tag
                if ( next.reg == '\\/' && _node.nodeName ) {
                    var _n = stm.read( 1 );

                    if ( _n == '>' ) {
                        return;
                    } else {
                        throw 'Missing ">" after "/".';
                    }
                }
                break;

            case "!":
                var _n;
                // doctype
                // comment
                _n = stm.read( 2 );
                if ( _n && _n == '--' ) {
                    comment.call( _node );
                    this._comment_start( stm, _node );
                    return;
                } else {
                    stm.unshift( _n );
                }

                // dtds
                _n = stm.read( 8 );
                if ( _n && _n.toUpperCase() == 'DOCTYPE ' ) {
                    doctype.call( _node, 'DOCTYPE' );
                    this._doctype_start( stm, _node );
                    return;
                } else {
                    stm.unshift( _next );
                }

                break;
            case "\\?":
                var _n;
               
                // xml head
                _n = stm.read( 4 );
                if ( _n && _n.toLowerCase() == 'xml ' ) {
                    xml.call( _node );
                    _node.attributes = this._attribute_start( stm, _node );
                } else {
                    stm.unshift( _n );
                }
                
                _n = stm.read( 1 );
                if ( _n && _n == '>' ) {
                    return;
                } else {
                    stm.unshift( _n );
                }

                break;
            }
        }

        /*
        while ( next = this._do_while( stm, "<", "!", "\\?", " ", ">", "\\/" ) ) {
            switch( next.reg ) {
            case "<":
                var _next;
                _next = stm.read( 1 );
                if ( _next == '/' ) {
                    if ( _node !== null ) {
                        _next = this._do_while( stm, ">" );
                        if ( _node.tagName == _next.chunk ) {
                            // end tag in current elemenet
                            _nodes.push( _node );
                            _node = null;
                        } else {
                            // error end of tags.
                            throw _node.chunk + "error end of tags";
                        }
                        break;
                    } else {
                        // end tag in parent element
                        stm.unshift( next.data + _next );
                        return _nodes;
                    }
                } else {
                    stm.unshift( _next );
                    _node = new element();
                }
                break;
            case "!":
                var _next;
                // doctype
                // comment
                _next = stm.read( 2 );
                if ( _next == '--' ) {
                    _node = new comment();
                    this._comment_start( stm, _node );
                    _nodes.push( _node );
                    _node = null;
                    break;
                } else {
                    stm.unshift( _next );
                }

                // dtds
                _next = stm.read( 8 );
                if ( _next.toUpperCase() == 'DOCTYPE ' ) {
                    _node = new doctype( 'DOCTYPE' );
                    this._doctype_start( stm, _node );
                    _nodes.push( _node );
                    _node = null;
                    break;
                } else {
                    stm.unshift( _next );
                }

                break;
            case "\\?":
                var _next;
               
                // xml head
                _next = stm.read( 4 );
                if ( _next && _next.toLowerCase() == 'xml ' ) {
                    _node = new xml();
                    _node.attributes = this._attribute_start( stm, _node );
                    _nodes.push( _node );
                    _node = null;
                    break;
                } else {
                    stm.unshift( _next );
                }
 
                // xml head tag close
                _next = stm.read( 1 );
                if ( _next && _next == '>' && _node ) {
                    break;
                } else {
                    stm.unshift( _next );
                }

                stm.unshift( next.chunk );

                break;
            case " ":
            case ">":
            case "\\/":
                // tag name
                if ( _node !== null && ! _node.nodeName ) {
                    var _n = next.chunk.toLowerCase().trim();
                    if ( _n.length > 0 ) {
                        var _pn = _n.split( ":" );

                        if ( _pn.length != 2 ) {
                            _node = new element( null, _n );
                        } else {
                            _node = new element( _pn[0], _pn[1] );
                        }

                        if ( next.reg == " " ) {
                            _node.attributes = this._attribute_start( stm, _node );
                        } else {
                            _node.attributes = [];
                        }
                    }
                }

                // tag end
                if ( next.reg == '>' && _node !== null ) {
                    // html only
                    // void elememts list, from [https://www.w3.org/TR/html/syntax.html#void-elements]
                    var _end_tag_forbidden = [ 'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr' ];
                    if ( _end_tag_forbidden.indexOf( _node.tagName ) != -1 ) {
                        _nodes.push( _node );
                        _node = null;
                    } else {
                        // recursive into child node
                        _node.childNodes = this._tag_start( stm );
                    }
                    break;
                }
                // end tag
                if ( next.reg == '\\/' && _node !== null ) {
                    var _next = stm.read( 1 );

                    if ( _next == '>' ) {
                        _nodes.push( _node );
                        _node = null;
                    } else {
                        stm.unshift( next.data + _next );
                    }
                }
                break;
            }
        }

        */
    },

    _text_start : function( stm, node ) {
        var next;

        while ( next = this._do_while( stm, "<" ) ) {
            if ( ! next ) {
                throw 'Missing end of the tag.'
            }

            node.nodeValue = next.chunk;
            stm.unshift( next.data );
            return;
        }
    },

    _comment_start : function( stm, node ) {
        var next = null;
        var trunk = '';

        while ( next = this._do_while( stm, "-" ) ) {
            var _split = "-";
            var _temp = stm.read( 2 );
            // -->
            if ( ( _split + _temp ) == '-->' ) {
                node.nodeValue = trunk;
                return;
            } else {
                stm.unshift( _temp );
                trunk += next.chunk + _split;
            }
        }
    },

    _doctype_start : function( stm, node ) {
        var next = null;
        var trunk;

        while ( next = this._do_while( stm, " ", ">" ) ) {
            switch ( next.reg ) {
            case ">":
            case " ":
                if ( ! node.name ) {
                    node.name = next.chunk.toLowerCase();
                }

                if ( next.chunk.toUpperCase() == "PUBLIC" ) {
                    node.fpi = this._value_start( stm );
                    node.publicId = this._value_start( stm );
                } else if ( next.chunk.toUpperCase() == "SYSTEM" ) {
                    node.systemId = this._value_start( stm );
                }

                if ( next.reg == ">" ) {
                    return;
                }
                break;
            }
        } 
    },

    _value_start : function( stm ) {
        var next;

        while ( next = this._do_while( stm, "\"", " ", ">", "\\?", "\\/" ) ) {
            switch ( next.reg ) {
            case "\"":
                var _next = this._do_while( stm, "\"" );
                if ( ! _next ) {
                    throw 'Missing terminators "\""';
                }
                return _next.chunk;
            case " ":
                break;
            case ">":
            case "\\?":
            case "\\/":
                throw 'Missing value of tag.'
            }
        }

        return null;
    },

    _attribute_start : function ( stm, node ) {
        var _attrs = [];
        var _attr = null;
        var next = null;

        while ( next = this._do_while( stm, " ", "\\/", ">", "=", "\\?" ) ) {
            // attr name
            if ( ! _attr ) {
                var _n = next.chunk.toLowerCase().trim();
                if ( _n.length > 0 ) {
                    var _pn = _n.split( ":" );

                    if ( _pn.length != 2 ) {
                        _attr = new attribute( null, _n );
                    } else {
                        _attr = new attribute( _pn[0], _pn[1] );
                    }
                }
            } else {
                var _n = next.chunk.toLowerCase().trim();
                if ( _n.length > 0 ) {
                    _attrs.push( _attr );
                    _attr = null;

                    stm.unshift( next.chunk + next.data );
                }
            }

            if ( next.reg == "=" && _attr ) {
                _attr.value = this._value_start( stm );
                
                _attrs.push( _attr );
                _attr = null;
            }

            if ( next.reg == ">" ) {
                stm.unshift( next.data );

                if ( _attr ) {
                    _attrs.push( _attr );
                }
                return _attrs;
            }

            if ( next.reg == "\\/" || next.reg == "\\?" ) {
                var _next = stm.read( 1 );

                if ( _next == ">" ) {
                    stm.unshift( _next );

                    if ( _attr ) {
                        _attrs.push( _attr );
                    }
                    return _attrs;
                }
            }
        }

        return _attrs;
    },
};
