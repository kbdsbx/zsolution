"use strict"

var program = require( 'commander' );

process.stdin.setEncoding( 'utf8' );

program
    .command( 'init [name]' )
    .description( 'init new solution.' )
    .option( '-p, --path <path>', 'Path for solution folder.' )
    .option( '-s, --svn_url <url>', 'Url for svn (if exists)' )
    .option( '-v, --version <version>', 'Url for svn (if exists)' )
    .action( ( name, obj ) => {
        var opt = {
            name : name,
            path : obj.path || process.cwd(),
            svn_url : obj.svn_url,
            version : obj.version || '0.0.0',
        };

        var init = require( __dirname + '/js/init.js' );
        init.init( opt );
        init.init_svn();
        init.init_paths();
    } );

program
    .command( 'remove [name]' )
    .description( 'remove a solution.' )
    .option( '-r, --remove_file', 'Remove all of files for solution.' )
    .action( ( name, obj ) => {
        var opt = {
            name : name,
            remove_file : obj.remove_file || false,
        }

        var remove = require( __dirname + '/js/remove.js' );
        remove.init( opt );
        remove.remove();
    } );

program
    .command( 'compile [name]' )
    .description( 'compile the solution.' )
    .option( '-o, --out_path <path>', 'The folder path that will be output.' )
    .action( ( name, obj ) => {
        var opt = {
            name : name,
            out_path: obj.out_path,
        }

        var compile = require( __dirname + '/js/compile.js' );
        compile.init( opt );
        compile.compile();
    } );

program.parse( process.argv );

/*
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
    case 'compile' :
        var cp = require( './js/compile.js' );
        cp.compile( argv );
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
*/
