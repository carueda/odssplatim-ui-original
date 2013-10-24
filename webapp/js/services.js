'use strict';

/* Services */


angular.module('odssPlatimApp.services', [])
    .factory('service', ['$rootScope', function($rootScope) {
        var service = {
            platformOptionsUpdated: function() {
                $rootScope.$broadcast('platformOptionsUpdated');
            }
        };
        return service;
    }])
;
