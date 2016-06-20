"use strict"

var program = require( 'commander' );
var fs = require( 'fs' );

process.stdin.setEncoding( 'utf8' );

program
    .command( 'init <name>' )
    .description( 'initialize new solution.' )
    .option( '-p, --path <path>', 'solution path' )
    .option( '-s, --svn <url>', 'svn url (if exists)' )
    .option( '-v, --version <version>', 'initialized version' )
    .action( ( name, obj ) => {
        var opt = {
            name : name,
            path : obj.path,
            svn : obj.svn,
            version : obj.version || '0.0.0',
        };

        var init = require( __dirname + '/js/init.js' );
        init( opt );
        init.init_path();
        init.init_svn();
    } );

program
    .command( 'remove [name]' )
    .description( 'remove a solution.' )
    .option( '-r, --remove_file', 'remove all of files in solution.' )
    .action( ( name, obj ) => {
        var opt = {
            name : name,
            remove_file : obj.remove_file || false,
        }

        var remove = require( __dirname + '/js/remove.js' );
        remove( opt );
    } );

program
    .command( 'compile [name]' )
    .description( 'compile solution.' )
    .option( '-o, --output_path [path]', 'the folder path that will be output.' )
    .option( '-c, --compress', 'compress js, css or other compressable files.' )
    .option( '-a, --absolute', 'compress absolutly and cover caches.' )
    .action( ( name, obj ) => {
        var opt = {
            name : name,
            output_path: obj.output_path || null,
            compress: obj.compress || false,
            absolute: obj.absolute || false,
        }

        var compile = require( __dirname + '/js/compile.js' );
        compile( opt );
        compile.compile();
    } );

program
    .command( 'options [name] [option] [value]' )
    .description( 'add or change options.' )
    .action( ( name, option, value, obj ) => {
        var opt = {
            name : name,
            option : option,
            value : value
        }

        var options = require( __dirname + '/js/options.js' );
        options.init( opt );
        options.options();
    } );

program
    .command( 'snatch <url>' )
    .description( 'snatch images form website.' )
    .option( '-s, --save_path <path>', 'image saving path.' )
    .option( '-d, --depth <depth>', 'searching depth.', parseInt )
    .option( '-a, --attr <attr>', 'image attribute looks like [src].' )
    .option( '-l, --level <level>', 'domain level for searching.', parseInt )
    .option( '-t, --assort <assort>', 'assort by search engine', /^(google|baidu)$/i )
    .action( ( url, obj ) => {
        var opt = {
            url: url,
            domain_level: obj.level,
            save_path: obj.save_path,
            depth: obj.depth,
            img_attr: obj.attr,
            assort: obj.assort,
        }

        var snatch = require( __dirname + '/js/snatch.js' )
        snatch.init( opt );
        snatch.snatch();
    } );

program
    .command( 'vision <path/url>' )
    .description( 'vision image\'s information.' )
    .option( '-c, --count <count>', 'count for image descriptions' )
    .action( ( path, obj ) => {
        var opt = {
            path: path,
            count: obj.count,
        }

        var vision = require( __dirname + '/js/vision.js' );
        vision.init( opt );
        vision.vision();
    } );

program
    .command( 'install' )
    .description( 're-install zsolution.' )
    .action( () => {
        require( __dirname + '/js/install.js' );
    } );

program
    .command( 'uninstall' )
    .description( 'uninstall zsolution.' )
    .action( () => {
        require( __dirname + '/js/uninstall.js' );
    } );

program
    .command( 'test [item]' )
    .description( 'Testing zsolution.' )
    .action( ( item ) => {
        if ( fs.existsSync( './test/test.js' ) ) {
            var utest = require( __dirname + '/test/test.js' );
            utest( item );
        }
    } );

program
    .command( 'dc [path]' )
    .description( 'Deep cleaning receipted files.' )
    .option( '-d, --deep', 'deep in subfolder.' )
    .option( '-r, --remove', 'remove all of repeated files absolutly.' )
    .action( ( path, obj ) => {
        var opt = {
            path: path || process.cwd(),
            deep: obj.deep || false,
            remove: obj.remove || false,
        }

        var dc = require( __dirname + '/js/dc.js' )

        dc( opt );
        dc.deep_cleaning();
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
