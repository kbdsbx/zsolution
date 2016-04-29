"use strict"

const fs = require( 'fs' );
const tools = require( __dirname + '/inc.js' );
const data_file = __dirname + '/../data/data.json';

var data_solutions;

var options = {
    name : '',
    option : '',
    value : '',
}

exports.init = function( opt ) {
    data_solutions = tools.load_by( data_file );

    for ( var attr in opt ) {
        options[attr] = opt[attr];
    }

    if ( ! data_solutions[options.name] ) {
        console.error( 'The solution is not exists.' );
        process.exit( 0 );
    }

    if ( ! fs.existsSync( data_solutions[options.name] ) ) {
        console.error( 'The solution management file is not exists.' );
        process.exit( 0 );
    }

    options.item = tools.load_by( data_solutions[options.name] );
}

exports.options = function() {
    switch ( options.option ) {
        case "ignore":
            options.item.ignore = options.item.ignore || [];
            if ( options.value ) {
                options.item.ignore.push( options.value );
            }
            console.log( options.item.ignore );
            console.log( 'Ignore added.' );
            break;
    }

    tools.save_as( data_solutions[options.name], options.item );
}
