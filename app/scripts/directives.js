'use strict';

/* Directives */


angular.module('odssPlatimApp.directives', [])

    /**
     * Allows to insert the platform timeline editor widget in a page.
     * For example, assuming the required scripts are in place (see indexD.html):
     * <pre>
     *      <div ng-app="odssPlatimApp">
     *          <odss-platim></odss-platim>
     *      </div>
     * </pre>
     */
    .directive('odssPlatim', function() {
        return {
            restrict:    'E',
            templateUrl: 'views/odss-platim.tpl.html'
        }
    })

;
