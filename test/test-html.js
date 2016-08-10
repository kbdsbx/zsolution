
const $ = require( __dirname + '/../js/inc.js' );
const assert = require( 'assert' );
const fs = require( 'fs' );
var html_compile = require( __dirname + '/../js/assert-dev/html.js' );

exports = module.exports = test_html;

function test_html () {
    test_html.test_html_compile();
}

test_html.__proto__ = {
    test_html_compile : function() {
        var opt = {
            path : __dirname + '/data/test-html.html',
            base_path : __dirname + '/data',
            new_base_path : __dirname + '/data/release',
            output : true,
        };

        // just template.
        fs.writeFileSync( __dirname + '/data/test-html.html', `
<!DOCTYPE html>
<html lang="zh-CN">
    <head>
        <meta charset="utf-8">
        <title>测试用例</title>
        <link href="/test-css.css" rel="stylesheet">
        <link rel="stylesheet/less" type="text/css" href="test-less.less">
        <script src="http://cdn.bootcss.com/less.js/2.5.3/less.min.js"></script>
        <script src="test-js.js"></script>
    </head>
    <body>
        <link href="test-import.html" rel="import">
        <div class="top-div">
            <div class="middle-div">
                Version:
                <b>6.5.1</b>
            </div>
        </div>
    </body>
</html>
`, { flag: 'w+', encoding: 'utf8' } );
        
        // template import.
        fs.writeFileSync( __dirname + '/data/test-import.html', `
<div class="import-div">
    Version:
    <b>1.0.0</b>
    <link href="./test-directory/test-import-deep.html" rel="import">
</div>
`, { flag: 'w+', encoding: 'utf8' } );
        // nesting import.
        fs.writeFileSync( __dirname + '/data/test-directory/test-import-deep.html', `
<div class="deeps-import-div">
    Version:
    <b>1.0.0</b>
    <link rel="stylesheet/less" type="text/css" href="../outside.less">
</div>
`, { flag: 'w+', encoding: 'utf8' } );

        html_compile.compileSync( opt );

        /*
        assert.ok( ! $.get_info( __dirname + '/data/release/test-html.html' ) );
        assert.ok( ! $.get_info( __dirname + '/data/release/test-js.js' ) );
        assert.ok( ! $.get_info( __dirname + '/data/release/test-less.css' ) );
        assert.ok( ! $.get_info( __dirname + '/data/release/test-css.css' ) );
        */
    },
};


