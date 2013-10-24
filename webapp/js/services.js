'use strict';

/* Services */


angular.module('odssPlatimApp.services', [])
    .factory('service', ['platimModel', function(platimModel) {
        var service = {
            refresh: function(platformOptions) {
                console.log("SERVICE:", platformOptions);
            }
        };
        return service;
    }])
;
