'use strict';

angular.module('odssPlatimApp.model', [])

    .factory('platimModel', [function() {
        var model = {
            refreshPlatformTypes:  undefined,
            platformOptions:       {
                platformTypes:   ["foo", "baz"],
                selection:      "tokens",
                selectedTypes:  {}
            }
        };

        model.refreshPlatformTypes = function() {
            model.platformOptions.platformTypes = window.platformTypes || model.platformOptions.platformTypes;
            _.each(model.platformOptions.platformTypes, function(pt) {
                if (!_.has(model.platformOptions.selectedTypes, pt)) {
                    model.platformOptions.selectedTypes[pt] = false;
                }
            });
            console.log("refreshPlatformTypes: selectedTypes:", model.platformOptions.selectedTypes);
        };

        model.refreshPlatformTypes();

        return model;
    }])
;
