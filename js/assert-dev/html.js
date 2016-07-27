"use strict"

const path = require ( 'path' )
const fs = require( 'fs' );
const crypto = require( 'crypto' );
const util =  require( 'util' );
const $ = require( __dirname + "/../inc.js" );
var html_analyze = require( __dirname + "/../lib/html-analyze.js" );

exports = module.exports = html;

function html( options ) {
    $.extend( this.options, options );

    this.analyze = new html_analyze();

    return this;
}

html.prototype = {
    options : {
        path : null,
        new_path : null,
        base_path : null,
    },
    analyze : null,

    compile : function ( callback ) {
        var _self = this;
        var _sm = _self.analyze.load_by_file( this.options.path );

        _sm.on( 'readable', function() {
            var op = ana.parse( _sm );

            for ( var _idx = 0; _idx < op.length; _idx++ ) {
                op[_idx].iterator( function() {
                    if ( this.tagName === 'link' && this.getAttribute( 'rel' ) === 'stylesheet/less' ) {
                        _self.less_compile( this );
                    }
                    if ( this.tagName === 'link' && this.getAttribute( 'rel' ) === 'import' ) {
                        _self.import_compile( this );
                    }
                    if ( this.tagName === 'link' && ( this.getAttribute( 'rel' ) === 'stylesheet' || /\.css$/i.test( this.getAttribute( 'href' ) ) ) ) {
                        _self.import_compile( this );
                    }
                    if ( this.tagName === 'script' && this.getAttribute( 'src' ) != null ) {
                        _self.js_move( this );
                    }
                } );
            }

            callback( this.analyze.stringify( op ) );
        } );
    },

    get_file_path : function( href ) {
        if ( /^(:?https?|ftp)?:?\/\//i.test( href ) ) {
            return href;
        } else {
            return path.normalize( path.isAbsolute( href ) ? this.options.path + '/' + href : this.options.base_path + '/' + href );
        }
    },

    // css href change
    less_compile : function( less_node ) {
        var href = less_node.getAttribute( 'href' );
        var less_file_path = this.get_file_path( href );
        var less_info = $.get_info( less_file_path );

        if ( ! less_info ) {
            return;
        }

        require( __dirname + '/less.js' ).compile( less_info, this.options );

        this.setAttribute( 'rel', 'stylesheet' );
        this.setAttribute( 'href', this.getAttribute( 'href' ).replace( /\.less/g, '.css?guid=' + less_info.sha256 ) ); 
    },

    import_compile : function ( import_node ) {
        var href = import_node.getAttribute( 'href' );
        var import_file_path = this.get_file_path( href );
        var import_info = $.get_info( import_file_path );

        if ( ! import_info ) {
            return;
        }
        // todo;
    },

    // js src change
    js_move : function ( js_node ) {
        var src = js_node.getAttribute( 'src' );
        var js_file_path = this.get_file_path( src );
        var js_info = $.get_info( js_file_path );

        if ( ! js_file ) {
            return;
        }

        require( __dirname + '/js.js' ).compile( js_info, this.options );

        this.setAttribute( 'src', src.replace( /\.js/g, '.js?guid=' + js_info.sha256 + '&' ) );
    },

    // css href change
    css_move : function ( css_node ) {
        var href = css_node.getAttribute( 'href' );
        var css_file_path = this.get_file_path( href );
        var css_info = $.get_info( css_file_path );

        if ( ! css_info ) {
            return;
        }

        require( __dirname + '/css.js' ).compile( css_info, this.options );

        this.setAttribute( 'href', href.replace( /\.css/g, '.css?guid=' + css_sha256 + '&' ) );
    },
};

