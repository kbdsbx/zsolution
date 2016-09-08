"use strict"

const path = require ( 'path' )
const fs = require( 'fs' );
const crypto = require( 'crypto' );
const util =  require( 'util' );
const $ = require( __dirname + "/../inc.js" );
var html_analyze = require( __dirname + "/../lib/html-analyze.js" );

exports = module.exports = html_compile;

function html_compile( options ) {
    this.options = $.extending( this.options, options );
    this.analyze = new html_analyze();

    return this;
}

html_compile.__proto__ = {
    compile : function( options, callback ) {
        var _ana = new html_compile( options );
        _ana.compile( callback );
    },

    compileSync : function( options ) {
        var _ana = new html_compile( options );
        return _ana.compileSync();
    },
}

html_compile.prototype = {
    options : {
        path : '',
        base_path : '',
        new_base_path : '',
        compress : false, // the next version.
        output : true,
    },
    analyze_option : {
        strict : true,
        replacer : '\n',
        space : '    ',
    },
    analyze : null,

    compile : function ( callback ) {
        var _self = this;
        _self.options.path = path.normalize( _self.options.path );
        _self.options.base_path = path.normalize( _self.options.base_path );
        _self.options.new_base_path = path.normalize( _self.options.new_base_path );

        var _sm = _self.analyze.load_by_file( _self.options.path );

        _sm.on( 'readable', function() {
            var op;
            try {
                op = _self.analyze.parse( _sm );
                console.error( _self.options.path );
            } catch ( err ) {
                if ( "string" === typeof err ) {
                    err = `\n${err}\nform:\n\t${_self.options.path}`;
                }
                throw err;
            }

            for ( var _idx in op ) {
                op[_idx].iterator( function() {
                    if ( this.tagName === 'link' && this.getAttribute( 'rel' ) === 'stylesheet/less' ) {
                        _self.less_compile( this );
                    } else if ( this.tagName === 'link' && this.getAttribute( 'rel' ) === 'import' ) {
                        _self.import_compile( this );
                        return true;
                    } else if ( this.tagName === 'link' && ( this.getAttribute( 'rel' ) === 'stylesheet' || /\.css$/i.test( this.getAttribute( 'href' ) ) ) ) {
                        _self.css_move( this );
                    } else if ( this.tagName === 'script' && this.getAttribute( 'src' ) != null ) {
                        _self.js_move( this );
                    }
                } );
            }

            if ( _self.options.output ) {
                var _new_path = _self.options.path.replace( _self.options.base_path, _self.options.new_base_path );
                fs.writeFile( _new_path , _self.analyze.stringify( op, _self.analyze_option ), { flag: 'w+', encoding: 'utf8' }, function( err ) {
                    if ( err ) {
                        console.error( err );
                        return;
                    }

                    console.log( _new_path + ' compiled.' );
                } );
            }

            if ( "function" === typeof callback ) {
                callback( op );
            }
        } );
    },

    compileSync : function() {
        var _self = this;
        _self.options.path = path.normalize( _self.options.path );
        _self.options.base_path = path.normalize( _self.options.base_path );
        _self.options.new_base_path = path.normalize( _self.options.new_base_path );

        var _sm = _self.analyze.load_by_string( fs.readFileSync( _self.options.path ) );

        var op = _self.analyze.parse( _sm );

        for ( var _idx = 0; _idx < op.length; _idx++ ) {
            op[_idx].iterator( function() {
                if ( this.tagName === 'link' && this.getAttribute( 'rel' ) === 'stylesheet/less' ) {
                    _self.less_compile( this );
                } else if ( this.tagName === 'link' && this.getAttribute( 'rel' ) === 'import' ) {
                    _self.import_compile( this );
                    return true;
                } else if ( this.tagName === 'link' && ( this.getAttribute( 'rel' ) === 'stylesheet' || /\.css$/i.test( this.getAttribute( 'href' ) ) ) ) {
                    _self.css_move( this );
                } else if ( this.tagName === 'script' && this.getAttribute( 'src' ) != null ) {
                    _self.js_move( this );
                }
            } );
        }

        if ( _self.options.output ) {
            var _new_path = _self.options.path.replace( _self.options.base_path, _self.options.new_base_path );
            fs.writeFile( _new_path , this.analyze.stringify( op ), { flag: 'w+', encoding: 'utf8' }, function( err ) {
                if ( err ) {
                    console.error( err );
                    return;
                }

                console.log( _new_path + ' compiled.' );
            } );
        }

        return op;
    },

    get_file_path : function( href ) {
        if ( /^(:?https?|ftp)?:?\/\//i.test( href ) ) {
            return href;
        } else {
            return path.normalize( path.isAbsolute( href ) ? this.options.base_path + '/' + href : path.dirname( this.options.path ) + '/' + href );
        }
    },

    // less file compiling
    less_compile : function( less_node ) {
        var href = less_node.getAttribute( 'href' );
        var less_file_path = this.get_file_path( href );
        var less_info = $.get_info( less_file_path );

        if ( ! less_info ) {
            return;
        }

        var _opt = {
            path : less_file_path,
            new_path : less_file_path.replace( this.options.base_path, this.options.new_base_path ).replace( /\.less$/g, '.css' ),
            compress : this.options.compress,
            map : ! this.options.compress,
        };

        require( __dirname + '/less.js' ).compile( _opt );

        less_node.setAttribute( 'rel', 'stylesheet' );
        less_node.setAttribute( 'href', less_node.getAttribute( 'href' ).replace( /\.less/g, '.css?guid=' + less_info.hash + '&' ) );
    },

    // compiling outside components.
    import_compile : function ( import_node ) {
        var href = import_node.getAttribute( 'href' );
        var import_file_path = this.get_file_path( href );
        var import_info = $.get_info( import_file_path );

        if ( ! import_info ) {
            return;
        }

        var _opt = {
            path : import_file_path,
            base_path : this.options.base_path,
            new_base_path : this.options.new_base_path,
            compress : this.options.compress,
            output: false,
        };

        var _comp = html_compile.compileSync( _opt );

        for ( var idx in _comp ) {
            import_node.parentNode.insertBefore( _comp[idx], import_node );
        }

        import_node.parentNode.removeChild( import_node );
    },

    // js source changing
    js_move : function ( js_node ) {
        var src = js_node.getAttribute( 'src' );
        var js_file_path = this.get_file_path( src );
        var js_info = $.get_info( js_file_path );

        if ( ! js_info ) {
            return;
        }

        var _opt = {
            path: js_file_path,
            new_path : js_file_path.replace( this.options.base_path, this.options.new_base_path ),
            compress : this.options.compress,
        }

        require( __dirname + '/js.js' ).compile( _opt );

        js_node.setAttribute( 'src', src.replace( /\.js/g, '.js?guid=' + js_info.hash + '&' ) );
    },

    // css href changing
    css_move : function ( css_node ) {
        var href = css_node.getAttribute( 'href' );
        var css_file_path = this.get_file_path( href );
        var css_info = $.get_info( css_file_path );

        if ( ! css_info ) {
            return;
        }

        var _opt = {
            path: css_file_path,
            new_path : css_file_path.replace( this.options.base_path, this.options.new_base_path ),
            compress : this.options.compress,
        }

        require( __dirname + '/css.js' ).compile( _opt );

        css_node.setAttribute( 'href', href.replace( /\.css/g, '.css?guid=' + css_info.hash + '&' ) );
    },
};

