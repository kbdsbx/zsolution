"use strict"

const fs = require( 'fs' );
const rl = require( 'readline-sync' );
const tools = require( './inc.js' );
const data_file = './data/data.json';

var data_solutions;

var options = {
    name: '',
    remove_file: false,
}

exports.init = function( opt ) {
    // getting solution data
    data_solutions = tools.load_by( data_file );

    for ( var attr in opt ) {
        options[attr] = opt[attr];
    }
}

exports.remove = function() {

    if ( ! options.name ) {
        options.name = rl.question( 'Solution name: ' );
    }

    if ( ! data_solutions[options.name] ) {
        console.error( 'This solution is not exists.' );
        process.exit( 0 );
    }

    var _solution_path = data_solutions[options.name];
    var _rm = JSON.parse( fs.readFileSync( _solution_path, 'utf8' ) );
    data_solutions[options.name] = undefined;

    tools.save_as( data_file, data_solutions );

    if ( options.remove_file ) {
        if ( _rm.release_folder.indexOf( _rm.path ) == -1 ) {
            rmdir( _rm.release_folder );
        }
        rmdir( _rm.path );
    }
}

var rmdir = function( path ) {
    var files = fs.readdirSync( path );

    for ( var i = 0; i < files.length; i++ ) {
        var f = path + '\\' + files[i];

        if ( fs.statSync( f ).isDirectory() ) {
            rmdir( f );
        } else {
            fs.unlinkSync( f );
        }
    }

    fs.rmdirSync( path );
}
