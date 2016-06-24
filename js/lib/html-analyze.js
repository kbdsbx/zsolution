"use strict"

const $ = require( __dirname + '/../inc.js' );

exports = module.exports = html_analyze;

function html_analyze ( opt ) {
    var _self = html_analyze;
    _self.options = $.extend( _self.options, opt );

    return _self;
}

html_analyze.__proto__ = {
    options : {
        strict: false,
    },

    analyzing : function( html ) {
        return '';
    },
};
