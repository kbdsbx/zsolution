"use strict"

const path = require ( 'path' )
const fs = require( 'fs' );
const crypto = require( 'crypto' );
const util =  require( 'util' );
const ana = require( "/../lib/html-analyze.js" );
const $ = require( __dirname + "/../inc.js" );

exports = module.exports = html;

function html( info, opt, sol ) {
    this.options = opt;
    this.solution = sol;

    this.compile( info );

    return this;
}

html.prototype = {
    option : {},
    solution : {},

    compile : function ( info ) {
        var sm = ana.load_by_file( info.path );
        var st = "";

        sm.on( 'readable', function() {
            var op = ana.parse( sm );
        } );
    },

    less_compile : function( contents, dir, sol ) {
    },

    import_compile : function ( contents, dir, sol ) {
    },

    js_move : function ( contents, dir, sol ) {
    },

    css_move : function ( contents, dir, sol ) {
    },
};

exports.compile = function( info, opt, sol ) {
    options = opt;
    solution = sol;

    var sm = ana.load_by_file( info.path );
    var st;

    sm.on( 'readable', function() {
        var op = ana.parse( sm );
    } );
}


