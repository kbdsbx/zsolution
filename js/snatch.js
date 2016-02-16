"use strict"

const fs = require( 'fs' );
const rl = require( 'readline-sync' );
const util = require( 'util' );
const url = require( 'url' );
const tools = require( __dirname + '/inc.js' );

var options = {
    url: null,
    domain_level: 3,
    save_path: process.cwd(),
    depth: 3,
    img_attr: 'src',
    url_pattern: '<a.+?href=["|\'](https?://(:?[^\.]\.)?%s/.+?)["|\'] .+?>.+?</a>',
    img_pattern: '<img.+?(?:%s)=["|\'](.+?)["|\'].+?/?>',
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
}

var exists_imgs = [];

var save_images = function( html ) {
    var img_reg = new RegExp( util.format( options.img_pattern, options.img_attr ), 'g' );
    var matched;

    while ( ( matched = img_reg.exec( html ) ) !== null ) {
        var img = matched[1];
        var fmatch = img.match( /\/([^\/]+?\.[^\/]+?)$/i );
        var fpath = null;
        if ( fmatch ) {
            fpath = options.save_path + '\\' + fmatch[1];
        }

        if ( exists_imgs.indexOf( img ) == -1 && fpath ) {
            exists_imgs.push( img );

            ( function( img, fpath ) {
                tools.get( img, 'binary', ( err, img_data ) => {
                    if ( err ) { console.log( err ); return; }

                    if ( img_data ) {
                        fs.writeFile( fpath, img_data, { encoding : 'binary', flag : 'w+' }, function( err ) {
                            if ( err ) { console.log( err ); return; }

                            console.log( `${img} saved.` );
                        } );
                    }
                } );
            } )( img, fpath );
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
                if ( exists_domains[ sub_url.pathname ] ) {
                    if ( exists_urls.indexOf( sub_url.href ) == -1 ) {
                        exists_urls.push( sub_url.href );
                        search_url( sub_url.href, exists_domains[ sub_url.pathname ] );
                    }
                } else {
                    exists_domains[ sub_url.pathname ] = depth - 1;
                    search_url( sub_url.href, depth - 1 );
                }
            }
        }
    } );
}

exports.snatch = function() {
    exists_domains[ options.url.pathname ] = options.depth;
    search_url( options.url.href, options.depth );
}
