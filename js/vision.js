"use strict"

const fs = require( 'fs' );
const url = require( 'url' );
const path = require( 'path' );
const https = require( 'https' );
const google = require( 'googleapis' );
const querystring = require( 'querystring' );

const tools = require( __dirname + '/inc.js' );
const key = require( __dirname + '/../data/zsolution-48245360aa9c.json' );

var options = {
    path: '',
    count: 5,
}

var get_token = function( callback ) {
    let client = new google.auth.JWT( key.client_email, null, key.private_key, ['https://www.googleapis.com/auth/cloud-platform'], null );
    client.authorize( ( err, tokens ) => {
        if ( err ) { callback( err ); return; }
        callback( null, tokens );
    } );
}

var requesting = function( token, src, callback ) {
    let request_data = JSON.stringify( {
        "requests": [{
            "image":{
                "content": fs.readFileSync( src ).toString( 'base64' ),
            },
            "features": [{
              "type": "LABEL_DETECTION",
              "maxResults": options.count,
            }],
            "imageContext": {
                "languageHints": [
                    "zh-CN",
                ],
            },
        }],
    } );

    let hq = https.request( {
        hostname: 'vision.googleapis.com',
        port: 443,
        path: '/v1/images:annotate',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength( request_data ),
            'Authorization': token, // tokens.token_type + ' ' + tokens.access_token,
        },
    }, ( res ) => {
        let data = '';
        res.on( 'data', function( chunk ) {
            data += chunk;
        } );

        res.on( 'end', function() {
            res.resume();
            callback( null, data );
        } );

        res.on( 'error', function( err ) {
            callback( err );
        } );
    } );
    hq.write( request_data );
    hq.end();
}

exports.init = function( opt ) {
    for ( var attr in opt ) {
        options[attr] = opt[attr] || options[attr];
    }
}

var _token = null;

exports.vision = function( callback ) {
    let src = options.path;
    if ( tools.isurl( src ) ) {
    }
   
    if ( ! path.isAbsolute( src ) ) {
        src = process.cwd() + '\\' + src;
    }

    if ( fs.existsSync( src ) ) {

        let get_labels = function( err, data ) {
            if ( err ) {
                if ( callback ) {
                    callback( err );
                } else {
                    console.log( err );
                }
                return;
            }

            let response = JSON.parse( data );

            if ( response.code ) {
                console.log( response.message );
                return;
            }

            let labels =  response['responses'][0]['labelAnnotations'];
            let des = [];
            for ( let idx in labels ) {
                des.push( labels[idx].description );
            }

            if ( callback ) {
                callback( null, des );
            } else {
                console.log( des );
            }
        }

        if ( ! _token ) {
            get_token( ( err, token ) => {
                if ( err ) {
                    if ( callback ) {
                        callback( err );
                    } else {
                        console.log( err );
                    }
                    return;
                }

                _token = token;
                requesting( _token.token_type + ' ' + _token.access_token, src, get_labels );
            } );
        } else {
            requesting( _token.token_type + ' ' + _token.access_token, src, get_labels );
        }
    }
}
