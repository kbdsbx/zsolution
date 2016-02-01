"use strict"

var uninstall = function() {
    cp.execSync( `npm unlink` );

    if ( process.platform == "win32" ) {
        var rmfiles = [
            process.env.APPDATA + '\\npm\\z.cmd',
            process.env.APPDATA + '\\npm\\z',
        ];
        rmfiles.forEach( ( f ) => {
            if ( fs.existsSync( f ) ) {
                fs.unlinkSync( f );
            }
        } );
    }
    console.log( 'zsolution uninstalled.' );
}

uninstall();
