zSolution
=======

ZSolution is a front-end management.
as easily as to create new front-end solution and manage open-source project (with npm).

The zSolution project is supported by the [Node.js](https://github.com/nodejs/node), some tools and packages.

## install

```
$ npm install zsolution
```

## Create Solution

```
$ node z.js init [solution name] [solution path] [svn url]
```

if you need to manage svn in project automatically, you must be download [TortoiseSVN](https://tortoisesvn.net/) commands.


## Tools

### File set
```
$ node z.js set [solution path] [-r] [-d]
```

* **-r** remove all of repeated files.
* **-d** including sub-folder.

## LICENSE
[ISC](http://opensource.org/licenses/ISC)
