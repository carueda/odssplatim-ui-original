odssplatim-ui
=============

This is a prototype UI for the platform timeline editor in the ODSS.


## install dependencies ##

The dependencies (AngularJS, MomentJS, etc,) are not kept under version
control but are to be installed, which is done via [Bower](http://bower.io/).
So, first install Bower:

```shell
$ npm install -g bower
```

Then, install the dependencies:
```shell
$ bower install
```
This installs the dependencies under `vendor/`.

Then you can run the application in development mode or in minified form.

## configure and run in development mode ##

- edit `src/app/config.js` to indicate the platform time editor REST endpoint
URL.

- open `src/app/index.html` in your browser.
For convenience, a local http server can be run as follows:
```shell
$ node scripts/web-server.js
```
Then open http://localhost:8000/src/app/index.html in your browser.

## compile and run in minified form ##

This is done via [Grunt](http://gruntjs.com/).

First do the installation of Grunt and the required tasks:

```shell
$ npm install
```
This installs the dependencies under `node_modules/`.

Then, run:
```shell
$ grunt
```
This generates `bin/` with a self-contained platform timeline editor
application. You can then open http://localhost:8000/bin/index.html in your
browser.


## History ##

This project first started as a clone of
[angular-seed](https://github.com/angular/angular-seed), but then it was
morphed into a structure more closely aligned with
[ng-boilerplate](https://github.com/ngbp/ng-boilerplate/) and
[angular-app](https://github.com/angular-app/angular-app/tree/master/client).

