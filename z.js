"use strict"

process.stdin.setEncoding( 'utf8' );

var argv = process.argv.slice( 2 );

switch ( argv[0] ) {
    case 'init' : 
        var init = require( './js/init.js' );
        init.init( argv );
        init.init_svn( argv );
        init.init_paths( argv );
        break;
    case 'set' :
        var set = require( './js/set.js' );
        set.set( argv );
        break;
    case 'help' :
        require( './js/help.js' );
        break;
}
