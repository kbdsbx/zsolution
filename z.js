"use strict"

process.stdin.setEncoding( 'utf8' );

var argv = process.argv.slice( 2 );

switch ( argv[0] ) {
    case 'init' : 
        var init = require( './js/init.js' );
        init.init( argv );
        init.init_svn();
        init.init_paths();
        break;
    case 'rm' :
    case 'remove' :
        var rm = require( './js/remove.js' );
        rm.remove( argv );
        break;
    case 'dc' :
        var dc = require( './js/dc.js' );
        dc.dc( argv );
        break;
    case 'cr' :
    case 'crawler' :
        var cr = require( './js/crawler.js' );
        cr.init( argv );
        cr.snatch();
        break;

    case 'install':
        require( './js/install.js' );
        break;
    case 'uninstall':
        require( './js/uninstall.js' );
        break;
    case 'help' :
        require( './js/help.js' );
        break;
}
