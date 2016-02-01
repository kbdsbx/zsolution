"use strict"

const fs = require( 'fs' );
const rl = require( 'readline-sync' );
const util = require( 'util' );
const tools = require( './inc.js' );
const url = require( 'url' );

var operator = {
    url: null,
    domain_level: 3,
    save_path: process.cwd(),
    depth: 3,
    img_attr: 'src',
    url_pattern: '<a.+?href=["|\'](https?://(:?[^\.]\.)?%s/.+?)["|\'] .+?>.+?</a>',
    img_pattern: '<img.+? %s=["|\'](.+?)["|\'] .+?/?>',
}

exports.init = function( argv ) {
    if ( ! argv[1] ) {
        operator.url = url.parse( rl.question( 'Snatching url: ' ) );
    } else {
        operator.url = url.parse( argv[1] );
    }

    for ( var idx = operator.url.host.length - 1, i = 1; idx >= 0; idx--, i++ ) {
        idx = operator.url.host.lastIndexOf( '.', idx );
        operator.url[ i + '-level-domain' ] = operator.url.host.substring( idx + 1 );
    }

    for ( var i = 1; i < argv.length; i++ ) {
        switch( argv[i] ) {
        case '-s' :
            if ( ! argv[i + 1] ) { throw "argument error."; }
            operator.save_path = argv[i + 1];
            i++;
            break;
        case '-d' :
            if ( ! argv[i + 1] && NaN == parseInt( argv[i + 1] ) ) { throw "argument error."; }
            operator.depth = parseInt( argv[i + 1] );
            i++;
            break;
        case '-attr' :
            if ( ! argv[i + 1] ) { throw "argument error."; }
            operator.img_attr = argv[i + 1];
            i++;
            break;
        case '-l' :
        case '-level' :
            if ( ! argv[i + 1] && NaN == parseInt( argv[i + 1] ) ) { throw "argument error."; }
            if ( 1 == parseInt( argv[i + 1] ) ) { throw "argument error."; }
            operator.domain_level = parseInt( argv[i + 1] );
            i++;
            break;
        }
    }
}

var save_images = function( html ) {
    var img_reg = new RegExp( util.format( operator.img_pattern, operator.img_attr ), 'g' );
    var matched;
    var exists = {};
    while ( ( matched = img_reg.exec( html ) ) !== null ) {
        var img = matched[1];
        var fname = img.match( /\/([^\/]+?\.[^\/]+?)$/i )[1];
        if ( ! exists[fname] ) {
            exists[fname] = operator.save_path + '\\' + fname;

            ( function( img, file_name ) {
                tools.get( img, 'binary', ( err, img_data ) => {
                    if ( err ) { console.log( err ); }
                    if ( img_data ) {
                        fs.writeFile( file_name, img_data, { encoding : 'binary', flag : 'w+' }, function( err ) {
                            if ( err ) throw err;
                            console.log( `${img} saved.` );
                        } );
                    }
                } );
            } )( img, exists[fname] );
        }
    }
}

var exists_urls = [];

var search_url = function( url, depth ) {
    if ( ! depth ) {
        return;
    }

    depth--;

    tools.get( url, null, ( err, html ) => {
        if ( err ) { console.log( err ); }

        save_images( html );

        if ( depth ) {
            var url_reg = new RegExp( util.format( operator.url_pattern, operator.url[ operator.domain_level + '-level-domain' ] ), 'g' );
            var matched;
            while ( ( matched = url_reg.exec( html ) ) !== null ) {
                var sub_url = matched[1];
                if ( exists_urls.indexOf( sub_url ) == -1 ) {
                    exists_urls.push( sub_url );
                    search_url( sub_url, depth );
                }
            }
        }
    } );
}

exports.snatch = function() {
    search_url( operator.url.href, operator.depth );
}
