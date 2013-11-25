odssplatim-ui
=============

This is the platform timeline editor UI module for ODSS.

The platform timeline editor is intended to allow users to schedule platform
assets in a graphical way while providing a unified mechanism to maintain and
share this information with features including options to enter typical
platform schedules, navigation with zoom in/out, and versioning.


## Install dependencies ##

It is assumed that [Bower](http://bower.io/) and [Node.js](http://nodejs.org/)
are already installed in your system.

### Web app dependencies ###

The dependencies for the web application (AngularJS, MomentJS, etc,) are not
kept under version control but can be installed as follows:

```shell
$ bower install
```
This installs the dependencies under `vendor/`.

### Development dependencies ###

```shell
$ npm install
```
This installs the dependencies under `node_modules/` and also generates
`src/app/templates.js` with all the templates in the web application so they
are not only fetched in a single request, but the caching also facilitates
the deployment of this module along with the main ODSS application without
having to adjust any paths for the templates.

## Configure the module ##

Edit `src/app/config.js` to indicate the platform time editor REST endpoint
URL.

Then you can run the application in development mode or in minified form.

## Run in development mode ##

- open `src/app/index.html` in your browser.
For convenience, a local http server can be run as follows:
```shell
$ node scripts/web-server.js
```
Then open http://localhost:8000/src/app/index.html in your browser.

## Run in minified form ##

Execute:
```shell
$ grunt
```
This generates `bin/` with a self-contained platform timeline editor
application. You can then open http://localhost:8000/bin/index.html in your
browser.


## History ##

This module was first based on JQuery, but then converted to AngularJS.
This was initially as a clone of
[angular-seed](https://github.com/angular/angular-seed),
but then morphed into a structure more closely aligned with
[ng-boilerplate](https://github.com/ngbp/ng-boilerplate/) and
[angular-app](https://github.com/angular-app/angular-app/tree/master/client).
