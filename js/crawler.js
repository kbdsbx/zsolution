"use strict"

const fs = require( 'fs' );
const rl = require( 'readline-sync' );
const util = require( 'util' );
const tools = require( './inc.js' );

var operator = {
    url: '',
    save_path: '',
    depth: 3,
    img_attr: 'src',
    url_pattern: '<a.+?href=["|\'](https?://[^\.]?\.?%s/.+?)["|\'] .+?>.+?</a>',
    img_pattern: '<img.+? %s=["|\'](.+?)["|\'] .+?/?>',
}

exports.init = function( argv ) {
    if ( ! argv[1] ) {
        operator.url = rl.question( 'Snatching url: ' );
    } else {
        operator.url = argv[1];
    }

    for ( var i = 0; i < argv.length; i++ ) {
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
        }
    }
}

var save_images = function( html ) {
    var img_reg = new RegExp( util.format( operator.img_pattern, operator.img_attr ), 'g' );
    var matched;
    var exists = {};
    while ( ( matched = img_reg.exec( html ) ) !== null ) {
        var img = matched[1];
        var fname = img.match( /\/([^\/]+?\.[^\/]+?)$/i );
        if ( ! exists[fname] ) {
            exists[fname] = operator.save_path + '\\' + fname[1];
            tools.get( img, 'binary', function( img_data ) {
                if ( img_data ) {
                    fs.writeFile( exists[fname], img_data, { encoding : 'binary', flag : 'w+' }, function( err ) {
                        if ( err ) throw err;
                        console.log( `${img} saved.` );
                    } );
                }
            } );
        }
    }
}

var search_url = function( url, depth ) {
    if ( ! depth ) {
        depth = operator.depth;
    }

    tools.get( operator.url, null, function( html ) {
        save_images( html );
    } );
}

exports.snatch = function() {
    search_url( operator.url );
}
