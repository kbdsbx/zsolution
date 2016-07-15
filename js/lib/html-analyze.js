"use strict"

const stream = require( 'stream' );
const buffer = require( 'buffer' );
const fs = require( 'fs' );
const $ = require( __dirname + '/../inc.js' );

exports = module.exports = html_analyze;

function html_analyze ( opt ) {
    return this;
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

    hasChildNodes : function() {
        return this.childNodes && this.childNodes.length > 0;
    },
};

/**
 * Element
 */

function element( prefix, localName ) {
    $.merged( this, element.prototype );

    this.prefix = prefix;
    this.localName = localName;
    this.tagName = prefix ? prefix + ":" + localName : localName;

    this.nodeType = 'element';
    this.nodeName = this.tagName;

    return this;
}

element.prototype = $.merging( new node(), {
    // before ":" in nodeName
    prefix : null,
    // after ":" in nodeName
    localName : null,

    // [prefix:localName] or [localName] if prefix is null
    tagName : null,

    attributes : [],

    getAttribute : function( name ) {
        for ( var idx in this.attributes ) {
            if ( this.attributes[idx].name == name ) {
                return this.attributes[idx].value || true;
            }
        }

        return undefined;
    },

    setAttribute : function( name, value ) {
        if ( ! this.attributes ) {
            this.attributes = [];
        }

        for ( var idx in this.attributes ) {
            if ( this.attributes[idx].name == name ) {
                this.attributes[idx].value = value;

                return this;
            }
        }

        var _pn = name.split( ':' );
        this.attributes.push( _pn.length == 2 ? new attribute( _pn[0], _pn[1], value ) : new attribute( null, name, value ) );

        return this;
    },

    hasAttribute : function( name ) {
        return !! this.getAttribute( name );
    },

    removeAttribute : function( name ) {
        for ( var idx in this.attributes ) {
            if ( this.attributes[idx].name == name ) {
                delete this.attributes[idx];
            }
        }
    }
} );


/**
 * Attribute
 */

function attribute( prefix, localName, value ) {
    $.merged( this, attribute.prototype );

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
    $.merged( this, doctype.prototype );

    this.nodeType = 'document_type';
    this.nodeName = nodeName;

    return this;
}

doctype.prototype = $.merging( new node(), {
    publicId : null,
    systemId : null,
} );


/**
 * Xml head
 */

function xml() {
    $.merged( this, xml.prototype );

    this.nodeType = 'document_type';
    this.nodeName = 'xml';
    return this;
}

xml.prototype = $.merging( new node(), {
} );


/**
 * Text
 */

function text ( textValue ) {
    $.merged( this, text.prototype );

    this.nodeType = 'text';
    this.nodeName = '#text';
    this.nodeValue = textValue;

    return this;
}

text.prototype = $.merging( new node(), {
} );


/**
 * Comment
 */

function comment ( nodeValue ) {
    $.merged( this, comment.prototype );

    this.nodeType = 'comment';
    this.nodeName = '#comment';

    return this;
}

comment.prototype = $.merging( new node(), {
} );


/**
 * Exception for html analyze.
 */

function html_analyze_exception ( msg, stack ) {
    return `${msg}\n\tline number: ${stack.line}`;
}


html_analyze.prototype = {
    options : {
        replacer : '\n',
        space : '  ',
    },

    _stack : {
        line : 0,
    },

    _exception : function ( msg ) {
        return html_analyze_exception( msg, this._stack );
    },

    load_by_string : function( text ) {
        var bf = new Buffer( text );
        var rb = new stream.Readable( {
            encoding: 'utf8',
            objectMode: false,
        } );
        rb._read = function _read( size ) {
        };

        rb.pause();

        rb.push( bf );

        return rb;
    },

    load_by_file : function( path ) {
        if ( fs.existsSync ( path ) ) {
            var rs = fs.createReadStream( path, {
                encoding: 'utf8',
            } );

            rs.pause();

            return rs;
        }
    },

    parse : function( stm ) {
        // reset stack;
        this._stack.line = 0;

        return this._dom_start( stm );
    },

    stringify : function( dom, options ) {
        $.extend( this.options, options );
        return this._node_stringify( dom, '' ).trim();
    },

    // void elememts list, from [https://www.w3.org/TR/html/syntax.html#void-elements]
    _void_elements : [ 'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr' ],
    // raw text elememts and escapable raw text elements list, from [https://www.w3.org/TR/html/syntax.html#raw-text]
    _raw_text_elements : [ 'script', 'style', 'textarea', 'title', 'pre' ],

    /**
     * stm : readstream
     * regs : array or string
     * <more> : string
     *
     * e.g.
     *   _do_while( stream, "reg1", "reg2", "reg3" );
     *   _do_while( stream, [ "reg1", "reg2", "reg3" ] );
     */
    _do_while : function ( stm, regs /* ... */ ) {
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

            if ( _data == '\n' ) {
                this._stack.line++;
            }

            for ( var idx = 1; idx < _regs.length; idx++ ) {
                if ( RegExp( _regs[idx], 'i' ).test( _data ) ) {
                    return { chunk : _chunk, reg : _regs[idx], data: _data };
                }
            }

            _chunk += _data;
        }

        if ( _chunk ) {
            return { chunk : _chunk, reg : null, data : null };
        }

        return null;
    },
    _unshift : function ( stm, chunk ) {
        const _chunk = chunk || "";
        var _count = 0;
        var _pos = _chunk.indexOf( '\n' );

        while ( _pos !== -1 ) {
            _count++;
            _pos = _chunk.indexOf( '\n', _pos + 1 );
        }

        this._stack.line = ( this._stack.line - _count > 0 ? this._stack.line - _count : 0 );
        stm.unshift( chunk );
    },

    _dom_start : function( stm ) {
        var next = null;

        while ( next = this._do_while( stm, "\\S" ) ) {
            this._unshift( stm, next.data );
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
                        if ( _node.tagName == _n.chunk.trim() ) {
                            // end tag in current elemenet
                            _node = null;
                            continue;
                        } else {
                            // error end of tags.
                            throw this._exception( "error end of tags." );
                        }
                        break;
                    } else {
                        this._unshift( stm, next.data + _n );
                        return _nodes;
                    }
                } else {
                    this._unshift( stm, _n );
                }
                _node = new node();
                if ( null == this._tag_start( stm, _node ) ) {
                    _nodes.push( _node );
                    _node = null;
                } else {
                    _nodes.push( _node );
                }
            } else if ( next.reg == "[^\\s<]" ) {
                if ( next.data.trim().length > 0 ) {
                    this._unshift( stm, next.data );

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

        while ( next = this._do_while( stm, "!", "\\?", "\\s", ">", "\\/" ) ) {
            switch ( next.reg ) {
            case "\\s":
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

                        if ( next.reg == "\\s" ) {
                            _node.attributes = this._attribute_start( stm, _node );
                        } else {
                            _node.attributes = [];
                        }
                    }
                }

                // tag end
                if ( next.reg == '>' && _node.nodeName ) {
                    if ( this._void_elements.indexOf( _node.nodeName ) != -1 ) {
                        return;
                    } else if ( this._raw_text_elements.indexOf( _node.tagName ) != -1 ) {
                        _node.nodeValue = this._text_value_start( stm, node );
                    } else {
                        // recursive into child node
                        _node.childNodes = this._node_start( stm );
                    }
                    return _node;
                }
                // end tag
                if ( next.reg == '\\/' && _node.nodeName ) {
                    var _n = stm.read( 1 );

                    if ( _n == '>' ) {
                        return;
                    } else {
                        throw this._exception( 'Missing ">" after "/".' );
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
                    this._unshift( stm, _n );
                }

                // dtds
                _n = stm.read( 8 );
                if ( _n && /^DOCTYPE\s$/i.test( _n.toUpperCase() ) ) {
                    doctype.call( _node, 'DOCTYPE' );
                    this._doctype_start( stm, _node );
                    return;
                } else {
                    this._unshift( stm, _next );
                }

                break;
            case "\\?":
                var _n;
               
                // xml head
                _n = stm.read( 4 );
                if ( _n && /^xml\s$/i.test( _n.toLowerCase() ) ) {
                    xml.call( _node );
                    _node.attributes = this._attribute_start( stm, _node );
                } else {
                    this._unshift( stm, _n );
                }
                
                _n = stm.read( 1 );
                if ( _n && _n == '>' ) {
                    return;
                } else {
                    this._unshift( stm, _n );
                }

                break;
            }
        }
    },

    _text_start : function( stm, node ) {
        var next = this._do_while( stm, "<" );

        if ( next ) {
            node.nodeValue = next.chunk.trim();
            this._unshift( stm, next.data );
        }
    },

    _comment_start : function( stm, node ) {
        var next = null;
        var chunk = '';

        while ( next = this._do_while( stm, "-" ) ) {
            chunk += next.chunk;
            var _split = "-";
            var _n = stm.read( 2 );
            // -->
            if ( ( _split + _n ) == '-->' ) {
                node.nodeValue = chunk.trim();
                return;
            } else {
                this._unshift( stm, _n );
                chunk += next.data;
            }
        }
    },

    _doctype_start : function( stm, node ) {
        var next = null;
        var trunk;

        while ( next = this._do_while( stm, "\\s", ">" ) ) {
            switch ( next.reg ) {
            case ">":
            case "\\s":
                if ( ! node.name ) {
                    node.name = next.chunk.toLowerCase();
                }

                if ( next.chunk.toUpperCase() == "PUBLIC" || next.chunk.toUpperCase() == "SYSTEM" ) {
                    if ( next.chunk.toUpperCase() == "PUBLIC" ) {
                        node.publicId = this._value_start( stm );
                    }

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

        while ( next = this._do_while( stm, "\"|\'", "\\s", ">", "\\?", "\\/" ) ) {
            switch ( next.reg ) {
            case "\"|\'":
                var _next = this._do_while( stm, next.data );
                if ( ! _next ) {
                    throw this._exception( `Missing terminators "${next.data}".` );
                }
                return _next.chunk;
            case "\\s":
                break;
            case ">":
            case "\\?":
            case "\\/":
                throw this._exception( 'Missing value of tag.' );
            }
        }

        return null;
    },

    _text_value_start : function ( stm, node ) {
        var next = this._do_while( stm, "<" );

        if ( next ) {
            node.nodeValue = next.chunk;
            this._unshift( stm, next.data );
            return next.chunk;
        }

        return null;
    },

    _attribute_start : function ( stm, node ) {
        var _attrs = [];
        var _attr = null;
        var next = null;

        while ( next = this._do_while( stm, "\\s", "\\/", ">", "=", "\\?" ) ) {
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

                    this._unshift( stm, next.chunk + next.data );
                }
            }

            if ( next.reg == "=" && _attr ) {
                _attr.value = this._value_start( stm );
                
                _attrs.push( _attr );
                _attr = null;
            }

            if ( next.reg == ">" ) {
                this._unshift( stm, next.data );

                if ( _attr ) {
                    _attrs.push( _attr );
                }
                return _attrs;
            }

            if ( next.reg == "\\/" || next.reg == "\\?" ) {
                var _next = stm.read( 1 );

                if ( _next == ">" ) {
                    this._unshift( stm, _next );

                    if ( _attr ) {
                        _attrs.push( _attr );
                    }
                    return _attrs;
                }
            }
        }

        return _attrs;
    },


    /* stringify */

    _node_stringify : function( dom, indent ) {
        var _res = ``;
        for ( var idx in dom ) {
            if ( dom[idx] ) {
                switch( dom[idx].nodeType ) {
                case 'document_type' : 
                    if ( dom[idx].nodeName.toUpperCase() == 'XML' ) {
                        _res += this._xml_stringify( dom[idx], indent );
                    }
                    if ( dom[idx].nodeName.toUpperCase() == 'DOCTYPE' ) {
                        _res += this._doctype_stringify( dom[idx], indent );
                    }
                    break;
                case 'element':
                    _res += this._element_stringify( dom[idx], indent );
                    break;
                case 'text':
                    _res += this._text_stringify( dom[idx], indent );
                    break;
                case 'comment':
                    _res += this._comment_stringify( dom[idx], indent );
                    break;
                }
            }
        }

        return _res;
    },

    _xml_stringify : function ( node, indent ) {
        var _attrs = this._attribute_stringify( node );
        return `${indent}<?xml${_attrs}?>`;
    },

    _doctype_stringify : function ( node, indent ) {
        var _name = node.name.toLowerCase();
        var _publicId = node.publicId ? ` "${node.publicId}"` : "";
        var _systemId = node.systemId ? ` "${node.systemId}"` : "";
        var _fpi = _systemId ? _publicId ? " PUBLIC" : " SYSTEM" : "";
        return `${indent}<!DOCTYPE ${_name}${_fpi}${_publicId}${_systemId}>${this.options.replacer}`;
    },

    _element_stringify : function ( node, indent ) {
        var _attrs = this._attribute_stringify( node );
        var _res = `${indent}<${node.nodeName}${_attrs}>`;

        if ( this._raw_text_elements.indexOf( node.nodeName ) != -1 ) {
            _res += `${node.nodeValue}`;
            _res += `</${node.nodeName}>${this.options.replacer}`;

            return _res;
        }

        if ( this._void_elements.indexOf( node.nodeName ) != -1 ) {
            _res += `${this.options.replacer}`;

            return _res;
        }

        if ( node.hasChildNodes() ) {
            _res += this.options.replacer;
            _res += this._node_stringify( node.childNodes, indent + this.options.space );
            _res += indent;
        }

        _res += `</${node.nodeName}>${this.options.replacer}`;

        return _res;
    },

    _text_stringify : function ( node, indent ) {
        return `${indent}${node.nodeValue}${this.options.replacer}`;
    },

    _comment_stringify : function ( node, indent ) {
        return `${indent}<!-- ${node.nodeValue} -->${this.options.replacer}`;
    },

    _attribute_stringify : function ( node ) {
        var _res = ``;

        for ( var idx in node.attributes ) {
            var attr = node.attributes[idx];
            if ( attr.value ) {
                _res += ` ${attr.name}="${attr.value}"`;
            } else {
                _res += ` ${attr.name}`;
            }
        }

        return _res;
    },
};
