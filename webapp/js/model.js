'use strict';

(function() {

    var model = {

        byPlat:    {},

        platform_ids: [],

        platformOptions: {
            platformTypes:   [],
            selection:      "tokens",
            selectedTypes:  {}
        }
    };

    /**
     * Gets the selected platform types.
     */
    model.getSelectedTypes = function() {
        var platformTypes = model.platformOptions.platformTypes;
        var selectedTypes = model.platformOptions.selectedTypes;
        var selected = _.filter(platformTypes,
                                function (pt) { return selectedTypes[pt]; });
        return selected;
    };

    /**
     * Gets the platforms selected according to the platform options.
     */
    model.getSelectedPlatforms = function() {
        var selection = model.platformOptions.selection;
        var platforms = _.values(model.byPlat);

        if (selection === "all") {
            return platforms;
        }
        else if (selection === "types") {
            var selected = model.getSelectedTypes();
            console.log("showing platforms with selected types", selected);
            return _.filter(platforms, function(tml) {
                            return _.indexOf(selected, tml.typeName) >= 0; });
        }
        else if (selection === "tokens") {
            return _.filter(platforms, function(tml) {
                            return tml.tokens.length > 0; });
        }
        else {
            throw new Error("unexpected selection value: " +selection);
        }
    };

    angular.module('odssPlatimApp.model', [])
        .factory('platimModel', [function() {
            return model;
        }])
    ;


})();