"use strict"

const fs = require( 'fs' );
const path = require( 'path' );
const $ = require( __dirname + '/inc.js' );
const data_file = __dirname + '/../data/data.json';

exports = module.exports = compile;

function compile( opt ) {
    let _self = compile;

    $.extend( compile.options, opt );

    _self.data_solutions = $.load_by( _self.data_file );

    if ( ! _self.data_solutions[ _self.options.name ] ) {
        console.error( 'This solution is not exists.' );
        process.exit( 0 );
    }

    if ( ! fs.existsSync( _self.data_solutions[ _self.options.name ] ) ) {
        console.error( 'This solution manage file is not exists.' );
        process.exit( 0 );
    }

    _self.solution = $.load_by( _self.data_solutions[ _self.options.name ] );

    if ( ! _self.options.output_path ) {
        _self.options.output_path = _self.solution.output_path;
    } else {
        _self.options.output_path = path.normalize( _self.options.output_path );
    }
}

compile.__proto__ = {
    data_file : path.normalize( __dirname + '/../data/data.json' ),
    data_solutions : '',
    solution: {
    },
    options : {
        name: '',
        output_path: '',
        compress: false,
        absolute: false,
        dev: false,
    },

    _each : function( path, old_folder, callback ) {
        let res = {};

        $.each( path, ( info ) => {
            if ( info.isDirectory ) {
                let _old = old_folder ? old_folder[ info.name ] : {};

                if ( ! callback( info, null ) ) {
                    res[ info.name ] = compile._each( info.path, _old, callback );
                }
                return true;
            }

            if ( info.isFile ) {
                let _old = old_folder ? old_folder[ info.name + info.ext ] : null;

                if ( _old ) {
                    res[info.name + info.ext] = _old;
                }

                if ( ! callback( info, _old ) ) {
                    res[info.name + info.ext] = info.hash;
                }
            }
        } );

        return res;
    },

    compile : function() {

        let res = compile._each( compile.solution.path, compile.solution.sub_folder, function( info, old_hash ) {
            if ( compile.solution.ignore && compile.solution.ignore instanceof Array ) {
                for ( let idx in compile.solution.ignore ) {
                    if ( new RegExp( compile.solution.ignore[ idx ], 'i' ).test( info.name + info.ext ) ) {
                        return true;
                    }
                }
            }

            if ( info.isDirectory ) {
                if ( compile.solution.output_path == info.path ) {
                    return true;
                }
            }

            // developing folder
            var _dev = compile.options.dev ? "-dev" : "";

            if ( info.isDirectory ) {
                info.new_path = info.path.replace( compile.solution.path, compile.options.output_path );
                var opt = {
                    path : info.path,
                    new_path : info.new_path,
                    compress : compile.options.compress,
                };
                require( __dirname + `/assert${_dev}/directory.js` ).compile( opt );
            }

            if ( info.isFile ) {
                switch( info.name + info.ext ) {
                    case 'solution.json' :
                        return true;
                }

                info.new_path = info.path.replace( compile.solution.path, compile.options.output_path );
                switch( info.ext.toLowerCase() ) {
                    case '.htm':
                    case '.html':
                    case '.shtml':
                        var opt = {
                            path: info.path,
                            base_path : compile.solution.path,
                            new_base_path : compile.solution.output_path,
                            compress: compile.options.compress,
                        };
                        require( __dirname + `/assert${_dev}/html.js` ).compile( opt );
                        break;

                    case '.css':
                        if ( compile.options.absolute ) {
                            var opt = {
                                path : info.path,
                                new_path : info.new_path,
                                compress : compile.options.compress,
                            };
                            require( __dirname + `/assert${_dev}/css.js` ).compile( opt );
                        }
                        break;

                    case '.js':
                        if ( compile.options.absolute ) {
                            var opt = {
                                path : info.path,
                                new_path : info.new_path,
                                compress : compile.options.compress,
                            };
                            require( __dirname + `/assert${_dev}/js.js` ).compile( opt );
                        }
                        break;

                    case '.json':
                        if ( ( ! compile.options.absolute ) && old_hash !== null && info.hash == old_hash ) {
                            return true;
                        }

                        var opt = {
                            path: info.path,
                            new_path : info.new_path,
                        };
                        require( __dirname + `/assert${_dev}/text.js` ).compile( opt );
                        break;

                    case '.jpg':
                    case '.jpeg':
                    case '.png':
                    case '.gif':
                    case '.svg':
                        if ( ( ! compile.options.absolute ) && old_hash !== null && info.hash == old_hash ) {
                            return true;
                        }

                        var opt = {
                            path: info.path,
                            new_path : info.new_path,
                        };
                        require( __dirname + `/assert${_dev}/binary.js` ).compile( opt );
                        break;

                    case '.otf':
                    case '.eot':
                    case '.ttf':
                    case '.woff':
                    case '.woff2':
                        if ( ( ! compile.options.absolute ) && old_hash !== null && info.hash == old_hash ) {
                            return true;
                        }
                        
                        var opt = {
                            path: info.path,
                            new_path : info.new_path,
                        };
                        require( __dirname + `/assert${_dev}/binary.js` ).compile( opt );
                    default :
                        return true;
                }
            }
        } );

        compile.solution.sub_folder = res;
        $.save_as( compile.data_solutions[ compile.options.name ], compile.solution );
    }
}

