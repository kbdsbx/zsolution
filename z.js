"use strict"

var program = require( 'commander' );

process.stdin.setEncoding( 'utf8' );

program
    .command( 'init <name>' )
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
    .command( 'release [name]' )
    .description( 'release the solution.' )
    .option( '-o, --out_path [path]', 'The folder path that will be output.' )
    .option( '-c, --compress', 'Compress js, css or other compressable files.' )
    .action( ( name, obj ) => {
        var opt = {
            name : name,
            out_path: obj.out_path === true ? process.cwd() : obj.out_path,
            compress: obj.compress
        }

        var release = require( __dirname + '/js/release.js' );
        release.init( opt );
        release.release();
    } );

program
    .command( 'snatch <url>' )
    .description( 'snatch images form website.' )
    .option( '-s, --save_path <path>', 'image saving path.' )
    .option( '-d, --depth <depth>', 'searching depth.', parseInt )
    .option( '-a, --attr <attr>', 'image attribute.' )
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
