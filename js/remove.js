"use strict"

const fs = require( 'fs' );
const rl = require( 'readline-sync' );
const path = require( 'path' );
const $ = require( __dirname + '/inc.js' );

exports = module.exports = remove;

function remove( opt ) {
    let _self = remove;

    _self.options = $.extend( remove.options, opt );
    _self.data_solutions = $.load_by( _self.data_file ) || {};

    let _json_file = _self.data_solutions[_self.options.name];

    if ( ! _json_file ) {
        console.error( 'This solution is not exists.' );
        return;
    }

    let _json = $.load_by( _json_file );

    if ( remove.options.remove_file ) {
        if ( _json.output_path.indexOf( _json.path ) == -1 ) {
            $.rmdir( _json.output_path );
        }

        $.rmdir( _json.path );
    }

    delete _self.data_solutions[_self.options.name];
    $.save_as( _self.data_file, _self.data_solutions );
}

remove.__proto__ = {
    data_file : path.normalize( __dirname + '/../data/data.json' ),
    data_solutions : null,
    options : {
        name: '',
        remove_file: false,
    }
};

