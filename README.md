zSolution
=======

ZSolution is a front-end develope management.
as easily as to create new front-end solution and manage open-source project (with npm).

The zSolution project is supported by the [Node.js](https://github.com/nodejs/node), some tools and npm packages.

## install

```
$ npm install zsolution
```

## uninstall

```
$ npm uninstall zsolution
```

## Solution

### Create
```
$ z init [options] <name>

  init new solution.

  Options:

    -h, --help               output usage information
    -p, --path <path>        Path for solution folder.
    -s, --svn_url <url>      Url for svn (if exists)
    -v, --version <version>  Url for svn (if exists)
```

if you need to manage svn in project automatically, you must download [TortoiseSVN](https://tortoisesvn.net/).

### Remove
```
$ z remove [options] [name]

  remove a solution.

  Options:

    -h, --help         output usage information
    -r, --remove_file  Remove all of files for solution.
```

### Release
```
$ z release [options] <name>

  release the solution.

  Options:

    -h, --help             output usage information
    -o, --out_path [path]  The folder path that will be output.
    -c, --compress         Compress js, css or other compressable files.
```

## Tools

### Snatch
```
$ z snatch [options] <url>

  snatch images form website.

  Options:

    -h, --help              output usage information
    -s, --save_path <path>  image saving path.
    -d, --depth <depth>     searching depth.
    -a, --attr <attr>       image attribute.
    -l, --level <level>     domain level for searching.
    -t, --assort <assort>   assort by search engine
```

### Vision
```
$ z vision [options] <path/url>

  vision image's information.

  Options:

    -h, --help           output usage information
    -c, --count <count>  count for image descriptions
```

## LICENSE
[ISC](http://opensource.org/licenses/ISC)
