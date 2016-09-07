"use strict"

global.__actions = global.__actions || [];

global.add_action = function ( hook, call ) {
    __actions[hook] = __actions[hook] || [];
    if ( __action[hook].indexOf( call ) === -1 ) {
        __action[hook].push( call );
    }
}

global.remove_action = function( hook, call ) {
    if ( "undefined" === typeof call ) {
        __actions[hook] = [];
        return true;
    }
    if ( "undefined" !== typeof __actions[hook] ) {
        for( var idx in __actions[hook] ) {
            if ( __actions[hook][idx] === call ) {
                delete __actions[hook][idx];
                return true;
            }
        }
    }
    return false;
}

global.do_action = function( hook, arg ) {
    var _self = this;
    var _res = arg;
    if ( "undefined" !== typeof __actions[hook] ) {
        for ( var idx in __actions[hook] ) {
            _res = __actions[hook][idx].call( _self, _res );
        }
    }

    return _res;
}

global.has_action = function( hook, call ) {
    if ( "undefined" === typeof __actions[hook] ) {
        return false;
    }
    if ( "undefined" === typeof call ) {
        return __actions[hook].length > 0;
    } else {
        return __actions[hook].indexOf( call ) !== -1;
    }
}

