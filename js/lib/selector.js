"use strict"

const stream = require( 'stream' );
const buffer = require( 'buffer' );
const fs = require( 'fs' );
const $ = require( __dirname + '/../inc.js' );

exports = module.exports = query_selector;

function query_selector() {
    return this;
}

function selector( prev, parent ) {
    if ( prev ) {
        this.prev_selector = prev;
    }

    if ( parent ) {
        this.parent_selector = parent;
    }

    return this;
}

selector.prototype = {
    // *  -- any element.
    // E  -- an element of E.
    p_name : null,

    // :not( s1, s2 )  -- an E element that does not match either [sub selector] s1 or s2.
    p_not : null,

    // :matches( s1, s2 )  -- an E element that matches [sub selector] s1 and/or s2.
    p_matches : null,

    // :has( rs1, rs2 )  -- an E element, if either of the relative selectors rs1 or rs2, when evaluated with E as the :scope elements, match an element.
    p_has : null,

    // .warning  -- an E element belonging to the class warning.
    // #myid -- an E element with ID equal to myid.
    // [foo] -- an E element with a foo attribute.
    // [foo="bar"] -- an E element whose foo attribute value is exactly equal to bar.
    // [foo="bar" i] -- an E element whose foo attribute value is exactly equal to any (ASCII-range) case-permutation of bar.
    // [foo~="bar"] -- an E element whose foo attribute value is a list of whitespace-separated values, one of which is exactly equal to bar.
    // [foo^="bar"] -- an E element whose foo attribute value begins exactly with the string bar.
    // [foo$="bar"] -- an E element whose foo attribute value ends exactly with the string bar.
    // [foo*="bar"] -- an E element whose foo attribute value contains the substring bar.
    // [foo|="bar"] -- an E element whose foo attribute value is a hyphen-separated list of values beginning with en.
    // :lang( zh, "*-hant" ) -- an element of type E tagged as being either in Chinese.
    //!:any-link -- an E element being the source anchor of a hyperlink.
    //!:link -- an E element being the source anchor of a hyperlink of which the target is not yet visited.
    //!:visited -- an E element being the source anchor of a hyperlink of which the target is already visited.
    //!:target -- an E element being the target of the referring URL.
    //!:scope -- an E element being a designated reference element.
    //!:current(s) -- an E element that is the deepest :current element that matches selector s.
    //!:past -- an E element that is in the past in a time-dimensional canvas.
    //!:future -- an E element that is in the future in a time-dimensional canvas.
    //!:active -- an E element that is in an activated state.
    //!:hover -- an E element that is under the cursor, or that has a descendant under the cursor.
    //!:focus -- an E element that has user input focus.
    //!:drop( [ active || valid || invalid ]? )  -- an E element that can possibly receive a drop.
    // :enabled -- a user interface element E that is enabled or disabled, respectively.
    // :disabled -- a user interface element E that is enabled or disabled, respectively.
    // :read-write -- a user interface element E that is user alterable, or not.
    // :read-only -- a user interface element E that is user alterable, or not.
    // :placeholder-shown -- an input control currently showing placeholder text.
    // :default -- a user interface element E that is the default item in a group of related choices.
    // :checked -- a user interface element E that is checked/selected (for instance a radio-button or checkbox).
    // :indeterminate -- a user interface element E that is in an indeterminate state (neither checked nor unchecked).
    //!:valid -- a user-input element E that meets, or doesn’t, its data validity semantics.
    //!:invalid -- a user-input element E that meets, or doesn’t, its data validity semantics.
    //!:in-range -- a user-input element E whose value is in-range/out-of-range.
    //!:out-of-range -- a user-input element E whose value is in-range/out-of-range.
    // :required -- a user-input element E that requires/does not require input.
    // :optional -- a user-input element E that requires/does not require input.
    //!:user-error -- a user-altered user-input element E with incorrect input (invalid, out-of-range, omitted-but-required).
    p_attrs : null,

    // :root -- an E element, root of the document.
    p_root : null,

    // :empty -- an E element that has no children (not even text nodes).
    p_empty : null,

    // :blank -- an E element that has no content except maybe white space.
    p_blank : null,

    // :nth-child( n [ of S ] ) -- an E element, the n-th child of its parent matching S.
    p_nth_child : null,

    // :nth-last-child( n [ of S ] ) -- an E element, the n-th child of its parent matching S, counting from the last one.
    p_nth_last_child : null,

    // :first-child -- an E element, first child of its parent.
    p_first_child : null,

    // :last-child -- an E element, last child of its parent.
    p_last_child : null,

    // :only-child -- an E element, only child of its parent.
    p_only_child : null,

    // :nth-of-type(n) -- an E element, the n-th sibling of its type.
    p_nth_of_type : null,

    // :nth-last-of-type(n) -- an E element, the n-th sibling of its type, counting from the last one.
    p_nth_last_of_type : null,

    // :first-of-type -- an E element, first sibling of its type.
    p_first_of_type : null,

    // :last-of-type -- an E element, last sibling of its type.
    p_last_of_type : null,

    // :only-of-type -- an E element, only sibling of its type.
    p_only_of_type : null,


    // E > F -- an F element child of an E element.
    child_selector : null,

    // E F or E >> F -- an F element descendant of an E element.
    far_selector : null,

    // E + F -- an F element immediately preceded by an E element.
    immediately_preced_selector : null,

    // E ~ F -- an F element preceded by an E element.
    preced_selector : null,

    // ---Grid or Table only.
    // E || F -- an E element that represents a cell in a grid/table belonging to a column represented by an element F.
    // :nth-column(n) -- an E element that represents a cell belonging to the nth column in a grid/table.
    // :nth-last-column( n ) -- an E element that represents a cell belonging to the nth column in a grid/table, counting from the last one.
    // TODO
    
    // prev selector.
    prev_selector : null,

    // parent selector.
    parent_selector : null,

};

query_selector.prototype = {
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

    parse : function( stm ) {
        return this._selector_start( stm );
    },

    _selector_start : function( stm, prev, parent ) {
        var next;

        if ( next = this._do_while( stm, "\\S" ) ) {
            stm.unshift( next.data );
            return this._selector_list_start( stm, prev, parent );
        }

        return [];
    },

    _selector_list_start : function( stm, prev, parent ) {
        var _selectors = [];
        var _selector = null;
        var next;
        // the new selector is coming or old selector is ending when get those flags.
        var _selector_starts_flags = [ ">", "\\+", "~", "\\|", ",", "\\)" ];
        while( next = this._do_while( stm, "\\*", "\\w", ":", "\\.", "#", "\\[", ">", "\\+", "~", "\\|", ",", "\\)" ) ) {

            if ( /\s+/i.test( next.chunk ) && _selector_starts_flags.indexOf( next.reg ) === -1 ) {
                stm.unshift( next.data );
                _selector.far_selector = this._selector_start( stm, this );
                return;
            }

            if ( ! _selector ) {
                _selector = new selector( prev, parent );
            }

            switch( next.reg ) {
            case "*":
                break;
            case "\\w":
                stm.unshift( next.data );
                this._name_start( stm, _selector );
                break;

            case "\\.":
                this._class_start( stm, _selector );
                break;
            case "#":
                this._id_start( stm, _selector );
                break;
            case "\\[":
                this._attr_start( stm, _selector );
                break;

            case ":":
                this._pseudo_start( stm, _selector );
                break;

            // start next selector.
            case ">":
                var _n = stm.read( 1 );
                if ( _n === ">" ) {
                    _selector.far_selector = this._selector_start( stm, this );
                } else {
                    stm.unshift( _n );
                    _selector.child_selector = this._selector_start( stm, this );
                }
                return;

            case "\\+":
                _selector.immediately_preced_selector = this._selector_start( stm, this );
                return;
            case "~":
                _selector.preced_selector = this._selector_start( stm, this );
                return;

            // The end of subordinate selector.
            case ",":
                _selectors.push( _selector );
                _selector = null;
                var _n;

                if ( _n = this._do_while( stm, "\\S" ) ) {
                    stm.unshift( _n.data );
                }
                break;
            case "\\)":
                _selectors.push( _selector );
                _selector = null;
                return _selectors;

            case "|":
                // grid or table.
                break;
            }
        }
        if ( _selector ) {
            _selectors.push( _selector );
            _selector = null;
        }

        return _selectors;
    },

    _name_start : function( stm, _selector ) {
        var next = this._do_while( stm, "[^\\w]" );

        if ( next ) {
            _selector.p_name = next.chunk.trim();
            stm.unshift( next.data );
            return true;
        }

        return false;
    },

    _class_start : function( stm, _selector ) {
        var next = this._do_while( stm, "[^\\w-]" );

        if ( next ) {
            _selector.p_attrs = _selector.p_attrs || {};
            _selector.p_attrs['class'] = _selector.p_attrs['class'] || [];
            _selector.p_attrs['class'].push( `\b${next.chunk}\b` );
            stm.unshift( next.data );

            return true;
        }

        return false;
    },

    _id_start : function( stm, _selector ) {
        var next = this._do_while( stm, "[^\\w-]" );

        if ( next ) {
            _selector.p_attrs = _selector.p_attrs || {};
            _selector.p_attrs['id'] = _selector.p_attrs['id'] || [];
            _selector.p_attrs['id'].push( `^${next.chunk}$` );
            stm.unshift( next.data );

            return true;
        }

        return false;
    },

    _attr_start : function( stm, _selector ) {
        var _name = null,
            _val = null;

        var _flags = {
            '~' : false,
            '\\^' : false,
            '\\$' : false,
            '\\*' : false,
            '\\|' : false
        };
        var next;


        while( next = this._do_while( stm, "\\]", "=", "~", "\\^", "\\$", "\\*", "\\|" ) ) {
            switch ( next.reg ) {
            case "\\]":
                if ( ! _name ) {
                    _name = next.chunk.trim();
                } else if ( ! _val ) {
                    var _val_arr = next.chunk.split( " " );
                    // TODO Case-sensitivity.
                    if ( _val_arr.length == 2 && _val_arr[1] == "i" ) {
                        _i = `/i`;
                    }
                    _val = _val_arr[0].replace( /"|'/g, "" ).trim();
                }

                if ( _name ) {
                    _selector.p_attrs = _selector.p_attrs || {};
                    _selector.p_attrs[_name] = [];
                }
                if ( _val ) {
                    if ( _flags['~'] ) {
                        _selector.p_attrs[_name].push( `\b${_val}\b` );
                    } else if ( _flags['\\^'] ) {
                        _selector.p_attrs[_name].push( `^${_val}` );
                    } else if ( _flags['\\$'] ) {
                        _selector.p_attrs[_name].push( `${_val}$` );
                    } else if ( _flags['\\*'] ) {
                        _selector.p_attrs[_name].push( `.*?${_val}.*?` );
                    } else if ( _flags['\\|'] ) {
                        _selector.p_attrs[_name].push( `\b${_val}-.*?\b` );
                    } else {
                        _selector.p_attrs[_name].push( `^${_val}$` );
                    }
                }
                return true;
            case "=":
                _name = next.chunk.trim();
                break;
            case "~":
            case "\\^":
            case "\\$":
            case "\\*":
            case "\\|":
                var _n = stm.read( 1 );
                if ( _n === "=" ) {
                    _name = next.chunk.trim();
                    _flags[next.reg] = true;
                    break;
                } else {
                    throw "";
                }
            }
        }
    },

    _pseudo_start : function( stm, _selector ) {
        var next;
        var _pseudo, _val;

        if ( next = this._do_while( stm, "\\(", "[^\\w-\\(]" ) ) {
            _pseudo = next.chunk.trim();
            if ( next.reg === "\\(" ) {
                if ( [ 'not', 'matches', 'has' ].indexOf( _pseudo ) !== -1 ) {
                    // deeps of nesting.
                    _val = this._selector_start( stm, null, this );
                } else {
                    var _n = this._do_while( stm, "\\)" );
                    _val = _n.chunk.trim();
                }
            }

            switch( _pseudo ) {
            case "not":
                for ( var i in _val ) {
                    _selector.p_not = _selector.p_not || [];
                    _selector.p_not.push( _val[i] );
                }
                break;
            case "matches":
                for ( var i in _val ) {
                    _selector.p_matches = _selector.p_matches || [];
                    _selector.p_matches.push( _val[i] );
                }
                break;
            case "has":
                for ( var i in _val ) {
                    _selector.p_has = _selector.p_has || [];
                    _selector.p_has.push( _val[i] );
                }
                break;

            case "dir":
                if ( _val === "ltr" || _val === "rtl" ) {
                    _selector.p_attrs = _selector.p_attrs || {};
                    _selector.p_attrs['dir'] = _selector.p_attrs['dir'] || [];
                    _selector.p_attrs['dir'].push( `^${_val}$` );
                }
                break;
            case "lang":
                _selector.p_attrs = _selector.p_attrs || {};
                _selector.p_attrs['lang'] = _selector.p_attrs['lang'] || [];
                _selector.p_attrs['lang'].push( `^${_val}(-.*?)?$` );
                break;

            case "root":
                _selector.p_root = true;
                break;
            case "empty":
                _selector.p_empty = true;
                break;
            case "blank":
                _selector.p_blank = true;
                break;
            case "nth-child":
                _selector.p_nth_child = _val;
                break;
            case "nth-last-child":
                _selector.p_nth_last_child = _val;
                break;
            case "first-child":
                _selector.p_first_child = true;
                break;
            case "last-child":
                _selector.p_last_child = true;
                break;
            case "only-child":
                _selector.p_only_child = true;
                break;
            case "nth-of-type":
                _selector.p_nth_of_type = _val;
                break;
            case "nth-last-of-type":
                _selector.p_nth_last_of_type = _val;
                break;
            case "first-of-type":
                _selector.p_first_of_type = true;
                break;
            case "last-of-type":
                _selector.p_last_of_type = true;
                break;
            case "only-of-type":
                _selector.p_only_of_type = true;
                break;

            default:
            case "any-link":
            case "link":
            case "visited":
            case "target":
            case "scope":
            case "current":
            case "past":
            case "future":
            case "active":
            case "hover":
            case "focus":
            case "drop":
            // form
            case "enabled":
            case "disabled":
            case "read-write":
            case "read-only":
            case "placeholder-shown":
            case "default":
            case "checked":
            case "indeterminate":
            case "valid":
            case "invalid":
            case "in-range":
            case "out-of-range":
            case "required":
            case "optional":
            case "user-error":

            // grid or table
            case "nth-column":
            case "nth-last-column":
                // do nothing
                break;
            }

            stm.unshift( next.data );
        }

        return false;
    },
};
