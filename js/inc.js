"use strict"

/* Global variables */

const url_pattern = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/ig;

// path separator
const separator = process.platform == "win32" ? '\\' : '/';

const fs = require( 'fs' );
const http = require( 'http' );
const https = require( 'https' );
const path = require( 'path' );
const crypto = require( 'crypto' );
const data_file = __dirname + '/../data/data.json';

// load json from file system;
exports.load_by = function( path ) {
    try {
        return JSON.parse( fs.readFileSync( path ) );
    } catch( e ) {
        return null;
    }
}

// save json file
exports.save_as = function( src, data ) {
    fs.writeFileSync( src, JSON.stringify( data, null, '  ' ) );
}

// get web page with http[s]
exports.get = function( url, encoding, callback ) {
    let _http = /https:.+?/i.test( url ) ? https : http;
    _http.get( url, ( res ) => {
        if ( res.statusCode == 200 ) {
            var data = '';
            if ( encoding ) {
                res.setEncoding( encoding );
            }
            res.on( 'data', function( chunk ) {
                data += chunk;
            } );

            res.on( 'end', function() {
                res.resume();
                return callback( null, data );
            } );

            res.on( 'error', function( err ) {
                callback( err );
            } );
        }
    } ).on( 'error', ( err ) => {
        callback( err );
    } );
}

// get file info
exports.get_info = function( file_path ) {
    if ( ! fs.existsSync( file_path ) ) {
        return null;
    }

    let stat = fs.statSync( file_path );
    let file_info = path.parse( file_path );

    let opt = {
        path: file_path,
        isDirectory: stat.isDirectory(),
        isFile: stat.isFile(),
        dir: file_info.dir,
        root: file_info.root,
        ext: file_info.ext,
        name: file_info.name,
        size: stat.size,
        accessed_time: stat.atime,
        modified_time: stat.mtime,
        changed_time: stat.ctime,
        created_time: stat.birthtime,

        hash: exports.sha256( file_info.name + file_info.ext + stat.ctime.toString() ),
    };

    return opt;
}

// each every file and folder
exports.each = function ( folder, callback ) {
    let files = fs.readdirSync( folder );

    files.forEach( function( f ) {
        let file_path = folder + separator + f;
        let file_info = exports.get_info( file_path );
        if ( file_info.isDirectory ) {
            if ( ! callback( file_info ) ) {
                exports.each( file_path, callback );
            }
        } else {
            callback( file_info );
        }
    } );
}

exports.isurl = function ( url ) {
    return url_pattern.test( url );
}

exports.xpath = function ( obj, folder, val ) {

    let _k = folder.slice( 0, folder.indexOf( '\\' ) );

    if ( _k && obj ) {
        return exports.xpath( obj[_k], folder.slice( folder.indexOf( '\\' ) + 1 ), val );
    }

    if ( ! _k ) {
        if ( ! val ) {
            return obj;
        } else {
            obj = val;
        }
    }

    if ( ! obj ) {
        if ( ! val ) {
            return null;
        } else {
            obj = {};
        }
    }

    /*
    if ( ! val ) {
        let _path = folder.split( '\\' );
        let _t = obj;

        for ( let i = 0; i < _path.length; i++ ) {
            if ( ! _t )
                return null;

            _t = _t[ _path[i] ];
        }

        return _t;
    } else {
        let _path = folder.split( '\\' );
        let _t = obj;

        for ( let i = 0; i < _path.length; i++ ) {
            if ( ! _t )
                _t = {};

            _t = _t[ _path[i] ];
        }

        _t = val;
    }
    */
}

// encoding str with sha256
exports.sha256 = function ( str ) {
    return crypto.createHash( 'sha256' ).update( str ).digest( 'hex' );
}

// encoding file with sha256
exports.sha256_file = function( path ) {
    return crypto.createHash( 'sha256' ).update( fs.readFileSync( path, 'binary' ) ).digest( 'hex' );
}

// remove directory cleanly
exports.rmdir = function( path, deep ) {
    deep = deep || 0;
    var files = fs.readdirSync( path );

    for ( var i = 0; i < files.length; i++ ) {
        var f = path + '\\' + files[i];

        if ( fs.statSync( f ).isDirectory() ) {
            exports.rmdir( f, deep + 1 );
        } else {
            fs.unlinkSync( f );
        }
    }

    // can't be remove original path
    if ( deep ) {
        fs.rmdirSync( path );
    }
}


/**
 * merge destination object into source object.
 *  -- by standard with source object.
 */

exports.extend = function( obj_des, obj_src ) {
    if ( "object" === typeof obj_des ) {
        for ( var idx in obj_des ) {
            if ( "undefined" !== typeof obj_src && undefined !== obj_src[idx] ) {
                if ( "object" === typeof obj_des[idx] && "object" === typeof obj_src[idx] ) {
                    exports.extend( obj_des[idx], obj_src[idx] );
                } else {
                    obj_des[idx] = obj_src[idx];
                }
            }
        }
    }

    return obj_des;
}

exports.extending = function( obj_des, obj_src ) {
    var _res = exports.merging( {}, obj_des );

    for ( var idx in _res ) {
        if ( "undefined" !== typeof obj_src && undefined !== obj_src[idx] ) {
            if ( "object" === typeof _res[idx] && "object" === typeof obj_src[idx] ) {
                _res[idx] = exports.extending( _res[idx], obj_src[idx] );
            } else {
                _res[idx] = obj_src[idx];
            }
        }
    }

    return _res;
}

/**
 * merge both object into once.
 */

exports.merging = function( obj_first, obj_last ) {
    var _res = {};

    if ( "object" === typeof obj_first ) {
        for ( var idx in obj_first ) {
            if ( "object" === typeof obj_first[idx] && null !== obj_first[idx] ) {
                _res[idx] = exports.merging( {}, obj_first[idx] );
            } else {
                _res[idx] = obj_first[idx];
            }
        }
    }

    if ( "object" === typeof obj_last ) {
        for ( var idx in obj_last ) {
            if ( "object" === typeof obj_last[idx] && null !== obj_last[idx] ) {
                _res[idx] = exports.merging( {}, obj_last[idx] );
            } else {
                _res[idx] = obj_last[idx];
            }
        }
    }

    return _res;
}


/**
 * merge source object into destination.
 */

exports.merged = function( obj_des, obj_src ) {

    if ( "object" === typeof obj_des && "object" === typeof obj_src ) {
        for ( var idx in obj_src ) {
            if ( "object" === typeof obj_des[idx] && "object" === typeof obj_src[idx] ) {
                exports.merged( obj_des[idx], obj_src[idx] );
            } else {
                obj_des[idx] = obj_src[idx];
            }
        }
    }

    return obj_des;
}


/**
 * compare object indeeps with equal to or expression [optional]
 */

exports.deepsEqual = function ( obj_first, obj_last, expression ) {

    if ( typeof obj_first === 'object' && typeof obj_last === 'object' ) {
        if ( obj_first === null ) {
            return true;
        }
        if ( obj_first.length === 0 && obj_last.length === 0 ) {
            return true;
        }

        for ( var idx in obj_first ) {
            if ( typeof obj_first[idx] === 'object' && typeof obj_last[idx] === 'object' ) {
                if ( ! exports.deepsEqual( obj_first[idx], obj_last[idx], expression ) ) {
                    return false;
                }
            } else if ( typeof expression === 'function' ) {
                if ( ! expression( obj_first[idx], obj_last[idx] ) ) {
                    return false;
                }
            } else {
                return obj_first[idx] == obj_last[idx];
            }
        }

        /*
        for ( var idx in obj_last ) {
            if ( typeof obj_last[idx] === 'object' && typeof obj_first[idx] === 'object' ) {
                if ( ! exports.deepsEqual( obj_last[idx], obj_first[idx], expression ) ) {
                    return false;
                }
            } else if ( typeof expression === 'function' ) {
                if ( ! expression( obj_last[idx], obj_first[idx] ) ) {
                    return false;
                }
            } else {
                return obj_last[idx] == obj_first[idx];
            }
        }
        */
    }

    return true;
    
    if ( typeof obj_first === 'object' && typeof obj_last === 'object' ) {
        for ( var idx in obj_first ) {
            if ( typeof obj_first[idx] === 'object' ) {
                if ( ! exports.deepsEqual( obj_first[idx], obj_last[idx] ) ) {
                    return false;
                }
            } else if ( obj_first[idx] != obj_last[idx] ) {
                if ( typeof expression === 'function' ) {
                    if ( ! expression( obj_first[idx], obj_last[idx] ) ) {
                        return false;
                    }
                } else {
                    if ( obj_first[idx] != obj_last[idx] ) {
                        return false;
                    }
                }
            }
        }
        for ( var idx in obj_last ) {
            if ( typeof obj_last[idx] === 'object' ) {
                if ( ! exports.deepsEqual( obj_last[idx], obj_first[idx] ) ) {
                    return false;
                }
            } else if ( obj_last[idx] != obj_first[idx] ) {
                if ( typeof expression === 'function' ) {
                    if ( ! expression( obj_last[idx], obj_first[idx] ) ) {
                        return false;
                    }
                } else {
                    if ( obj_last[idx] != obj_first[idx] ) {
                        return false;
                    }
                }
            }
        }
    } else {
        if ( typeof expression === 'function' ) {
            if ( ! expression( obj_first, obj_last ) ) {
                return false;
            }
        } else {
            if ( obj_first != obj_last ) {
                return false;
            }
        }
    }

    return true;
}


