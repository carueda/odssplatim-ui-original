'use strict';

/* Services */


angular.module('odssPlatimApp.services', [])
    .factory('service', ['$rootScope', function($rootScope) {
        return {
            platformOptionsUpdated: function() {
                $rootScope.$broadcast('platformOptionsUpdated');
            }
        };
    }])
;
