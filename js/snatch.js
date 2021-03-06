"use strict"

const fs = require( 'fs' );
const rl = require( 'readline-sync' );
const util = require( 'util' );
const url = require( 'url' );
const $ = require( __dirname + '/inc.js' );

var html_analyze = require( __dirname + "/lib/html-analyze.js" );

exports = module.exports = snatch;

function snatch( options ) {
    this.options = $.extending( this.options, options );
    this.analyze = new html_analyze();
    this.config = $.load_by( this.options.config );

    return this;
}

snatch.__proto__ = {
    snatch : function( options ) {
        var _s = new snatch( options );
        _s.snatch();
    },
};

snatch.prototype = {
    options : {
        name : "",
        config : __dirname + "/../data/snatch.json",
        save_path : "",
        assort : false, // TODO: image analysis [https://cloud.google.com/vision/]
    },

    /**
     * {
     *     url : "",
     *     attr : "",
     *     list : false || {
     *         // TODO:
     *     }
     * }
     */
    config : null,

    snatch : function( url ) {
        var _self = this;
        var _url = url || this.config[this.options.name].url;
        var _sm = _self.analyze.load_by_network( _url );

        _sm.on( 'readable', function() {
            var op;
            try {
                op = _self.analyze.parse( _sm );
            } catch ( err ) {
                if ( "string" === typeof err ) {
                    err = `\n${err}\nform:\n\t${_url}`;
                }
                throw err;
            };

            for ( var idx in op ) {
                op[idx].iterator( function() {
                    if ( this.tagName === 'img' ) {
                        var _img_url = this.getAttribute( this.config[this.options.name].attr || 'src' );
                        if ( _img_url ) {
                            save_img( _img_url );
                        }
                    }

                    if ( this.tagName === 'a' && this.getAttribute( 'href' ) ) {
                    }
                } );
            }
        } );
    },

    save_img : function( url ) {
        var file_name = url.substr( url.lastIndexOf( '/' ) + 1 );
        var temp_path = `${process.env.temp}\${file_name}`;
        var img_path = `${this.options.save_path}\${file_name}`;

        $.get( url, 'binary', ( err, img_data ) => {
            if ( err ) { callback( err ); return; }

            if ( img_data ) {
                fs.writeFile( temp_path, img_data, { encoding: 'binary', flag : 'w' }, function( err ) {
                    if ( err ) { console.log( err ); return; }

                    // TODO : filter image.

                    var rs = fs.createReadStream( temp_path );
                    rs.pipe( fs.createWriteStream( img_path ) );
                    rs.on( 'end', function() {
                        console.log( `${img_path} saved.` );
                        fs.unlinkSync( temp_path );
                    } );
                } );
            }
        } );
    },
};

/*
var options = {
    url: null,
    url_parsed: null,
    domain_level: 3,
    save_path: process.cwd(),
    depth: 3,
    img_attr: 'src',
    assort: false,
    url_pattern: '<a.+?href=["|\']((:?(:?(:?http|svg|svn|ftp):)?//)?(:?[\w|\.]+)?%s(:?:\d{1,5})?[^"\':]+?)["|\'].+?>.+?</a>',
    // url_pattern: '<a.+?href=["|\'](https?://(:?[^\.]\.)?%s/.+?)["|\'] .+?>.+?</a>',
    img_pattern: '<img.+?(?:%s)=["|\'](.+?)["|\'].+?/?>',
    
    'baidu_search' : 'http://stu.baidu.com/n/searchpc?queryImageUrl=',
    'baidu_pattern' : /\\x22text\\x22:\\x22(.+?)\\x22,/g,
}

exports.init = function( opt ) {
    for ( var attr in opt ) {
        if ( attr == 'url' )
            opt[attr] = url.parse( opt[attr] );

        options[attr] = opt[attr] || options[attr];
    }

    for ( var idx = options.url.host.length - 1, i = 1; idx >= 0; idx--, i++ ) {
        idx = options.url.host.lastIndexOf( '.', idx );
        options.url[ i + '-level-domain' ] = options.url.host.substring( idx + 1 );
    }

    options.url[ '-1-level-domain' ] = '';
}

var assort_image = function( url, callback ) {
    tools.get( options[ options.assort + '_search' ] + url, null, ( err, html ) => {
        if ( err ) { callback( err ); return; }

        if ( html ) {
            var keyword_reg = new RegExp( options[ options.assort + '_pattern' ] );
            var matched;
            var keywords = [];
            while ( ( matched = keyword_reg.exec( html ) ) != null ) {
                keywords.push( JSON.parse( '"' + matched[1].replace( /\\\\/g, '\\' ) + '"' ) );
            }

            callback( null, keywords );
        }
    } );
}

var get_image = function( url, tpath, callback ) {
    tools.get( url, 'binary', ( err, img_data ) => {
        if ( err ) { callback( err ); return; }

        if ( img_data ) {
            // save image to temporary folder;
            fs.writeFile( tpath, img_data, { encoding : 'binary', flag : 'w+' }, function( err ) {
                if ( err ) { callback( err ); return; }

                callback( null );
                console.log( `${url} saved.` );
            } );
        }
    } );
}

var exists_imgs = [];

var save_images = function( html ) {
    var img_reg = new RegExp( util.format( options.img_pattern, options.img_attr ), 'g' );
    var matched;

    while ( ( matched = img_reg.exec( html ) ) !== null ) {
        var img = matched[1];
        var fmatch = null,
            fpath = null,
            fname = null,
            tpath = null;

        fmatch = url.parse( img );
        
        if ( fmatch.pathname === null )
            continue;

        fname = fmatch.pathname.substr( fmatch.pathname.lastIndexOf( '/' ) );
        fpath = options.save_path + '\\' + fname;
        tpath = process.env.temp + '\\' + fname;

        if ( exists_imgs.indexOf( img ) == -1 ) {
            exists_imgs.push( img );

            if ( options.assort ) {
                ( function( img, fname, tpath ) {
                    assort_image ( img, ( err, keywords ) => {
                        if ( err ) { console.log( err ); }

                        fpath = [];
                        for ( var idx in keywords ) {
                            if ( ! fs.existsSync( options.save_path + '\\' + keywords[idx] ) ) {
                                fs.mkdirSync( options.save_path + '\\' + keywords[idx] );
                            }
                            fpath.push( options.save_path + '\\' + keywords[idx] + '\\' + fname );
                        }

                        if ( ! fpath.length ) {
                            if ( ! fs.existsSync( options.save_path + '\\unknow' ) ) {
                                fs.mkdirSync( options.save_path + '\\unknow' );
                            }
                            fpath.push( options.save_path + '\\unknow\\' + fname );
                        }

                        ( function( img, tpath, fpath ) {
                            get_image( img, tpath, ( err ) => {
                                if ( err ) { console.log( err ); return; }

                                for ( var idx in fpath ) {
                                    fs.createReadStream( tpath ).pipe( fs.createWriteStream( fpath[idx] ) );
                                }
                            } );
                        } )( img, tpath, fpath );
                    } );
                } ) ( img, fname, tpath );
            } else {
                ( function( img, tpath, fpath ) {
                    get_image( img, tpath, ( err ) => {
                        if ( err ) { console.log( err ); return; }

                        fs.createReadStream( tpath ).pipe( fs.createWriteStream( fpath ) );
                    } );
                } )( img, tpath, fpath );
            }
        }
    }
}

var exists_urls = [];
var exists_domains = {};

var search_url = function( cur_url, depth ) {

    tools.get( cur_url, null, ( err, html ) => {
        if ( err ) { console.log( err ); return; }
        console.log( cur_url + ' snatching... [depth : ' + depth + ']' );

        save_images( html );

        if ( depth - 1 ) {
            var url_reg = new RegExp( util.format( options.url_pattern, options.url[ options.domain_level + '-level-domain' ] ), 'g' );
            var matched;

            while ( ( matched = url_reg.exec( html ) ) !== null ) {
                var sub_url = url.parse( matched[1] );

                if ( ! sub_url.protocol || ! sub_url.host ) {
                    sub_url.protocol = options.url.protocol;
                    sub_url.host = options.url.host;
                }

                let _href = url.format( sub_url );

                if ( exists_domains[ sub_url.pathname ] ) {
                    if ( exists_urls.indexOf( _href ) == -1 ) {
                        exists_urls.push( _href );
                        search_url( _href, exists_domains[ sub_url.pathname ] );
                    }
                } else {
                    exists_domains[ sub_url.pathname ] = depth - 1;
                    search_url( _href, depth - 1 );
                }
            }
        }
    } );
}

exports.snatch = function() {
    exists_domains[ options.url.pathname ] = options.depth;
    search_url( options.url.href, options.depth );
}
*/
