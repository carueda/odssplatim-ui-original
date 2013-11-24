'use strict';

angular.module('odssPlatimApp', [
    'ui.bootstrap',
    'ngSanitize',
    //'odssPlatimApp.templates',
    'odssPlatimApp.model',
    'odssPlatimApp.controllers.platform',
    'odssPlatimApp.controllers.timeline',
    'odssPlatimApp.controllers.period',
    'odssPlatimApp.controllers.util',
    'odssPlatimApp.services',
    'odssPlatimApp.controllers.main',
    'odssPlatimApp.directives'
]);
