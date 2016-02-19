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
}

exports.init = function( opt ) {
    for ( var attr in opt ) {
        options[attr] = opt[attr] || options[attr];
    }
}

exports.vision = function() {
    let src = options.path;
    if ( tools.isurl( src ) ) {
    }
   
    if ( ! path.isAbsolute( src ) ) {
        src = process.cwd() + '\\' + src;
    }
    if ( fs.existsSync( src ) ) {
        let client = new google.auth.JWT( key.client_email, null, key.private_key, ['https://www.googleapis.com/auth/cloud-platform'], null );
        client.authorize( ( err, tokens ) => {
            if ( err ) { console.log( err ); }

            console.log( tokens );
            
            let request_data = JSON.stringify( {
                "requests": [{
                    "image":{
                        "content": fs.readFileSync( src ).toString( 'base64' ),
                    },
                    "features": [{
                      "type": "LABEL_DETECTION",
                      "maxResults": 1
                    }]
                }]
            } );

            let hq = https.request( {
                hostname: 'vision.googleapis.com',
                port: 443,
                path: '/v1/images:annotate',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength( request_data ),
                    'Authorization': tokens.token_type + ' ' + tokens.access_token,
                },
            }, ( res ) => {
                let data = '';
                res.on( 'data', function( chunk ) {
                    data += chunk;
                } );

                res.on( 'end', function() {
                    res.resume();
                    console.log( data );
                } );
            } );
            hq.write( request_data );
            hq.end();
        } );
    }
}
