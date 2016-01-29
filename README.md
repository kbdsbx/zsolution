zSolution
=======

ZSolution is a front-end management.
as easily as to create new front-end solution and manage open-source project (with npm).

The zSolution project is supported by the [Node.js](https://github.com/nodejs/node), some tools and packages.

## install

```
$ npm install zsolution
```

## Solution

### Create
```
$ node z init [solution name] [solution path] [svn url]
```

if you need to manage svn in project automatically, you must be download [TortoiseSVN](https://tortoisesvn.net/) commands.

### Remove
```
$ node z rm [solution name] [-r]
```

* **-r**  remove all of file in this solution.


## Tools

### File Duplicate Cleaner
```
$ node z dc [solution path] [-r] [-d]
```

* **-r** remove all of duplicatly files.
* **-d** search including sub-folder.

## LICENSE
[ISC](http://opensource.org/licenses/ISC)
