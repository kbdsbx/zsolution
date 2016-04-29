zSolution
=======

ZSolution is a front-end develope management.
as easy as to create new front-end solution and manage open-source project (with npm).

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

  initialize new solution.

  Options:

    -h, --help               output usage information
    -p, --path <path>        solution path
    -s, --svn_url <url>      svn url (if exists)
    -v, --version <version>  initialized version
```

if you need to manage svn in project automatically, you must download [TortoiseSVN](https://tortoisesvn.net/).

### Remove
```
$ z remove [options] [name]

  remove a solution.

  Options:

    -h, --help         output usage information
    -r, --remove_file  remove all of files in solution.
```

### Release
```
$ z release [options] <name>

  release solution.

  Options:

    -h, --help             output usage information
    -o, --out_path [path]  the folder path that will be output.
    -c, --compress         compress js, css or other compressable files.
```

### Options
```
$ options [name] <option> <value>

  add or change options.

  Options:

    -h, --help  output usage information
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
    -a, --attr <attr>       image attribute looks like [src].
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

## Future

* Initialize solution use different template.
* update solution version automatically.
* manage svn options automatically.

* analysis image's information and classification.

## LICENSE
[ISC](http://opensource.org/licenses/ISC)
