"use strict"

const fs = require( 'fs' );
const rl = require( 'readline-sync' );
const data_file = './data/data.json';

var data_solutions;

var operator = {
    name: '',
    remove_file: false,
}

exports.remove = function( argv ) {
    // getting solution data
    data_solutions = JSON.parse( fs.readFileSync( data_file, 'utf8' ) );

    if ( ! argv[1] ) {
        operator.name = rl.question( 'Solution name: ' );
    } else {
        operator.name = argv[1];
    }

    for ( var i = 2; i < argv.length; i++ ) {
        switch( argv[i] ) {
            case '-r' :
                operator.remove_file = true;
                break;
            default:
                break;
        }
    }

    if ( ! data_solutions[operator.name] ) {
        console.error( 'This solution is not exists.' );
        process.exit( 0 );
    }

    var _solution_path = data_solutions[operator.name];
    var _rm = JSON.parse( fs.readFileSync( _solution_path, 'utf8' ) );
    data_solutions[operator.name] = undefined;

    fs.writeFile( data_file, JSON.stringify( data_solutions ), ( err ) => {
        if ( err ) { throw err; };
    } );

    if ( operator.remove_file ) {
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
