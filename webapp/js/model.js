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

    /**
     * Start the full refresh of the model (except options)
     * @param fns  Callback functions
     */
    model.refresh = function(fns) {
        getAllPlatforms(fns);
    };

    /**
     * Retrieves all platform.
     * @param fns  Callback functions
     */
    var getAllPlatforms = function(fns) {
        pstatus("Retrieving platforms...");
        $.ajax({
            url:       odssplatimConfig.rest + "/platforms",
            type:      "GET",
            dataType:  "json",

            success: function(res) {
                success();
                //console.log("getAllPlatforms: " + JSON.stringify(res));

                _.each(res, function(elm) {
                    var platform_id = elm.id;
                    var tml = _.extend({
                        platform_id:   platform_id,
                        platform_name: elm.name
                    }, elm);
                    tml = _.omit(tml, 'id', 'name');

                    if (!_.contains(model.platformOptions.platformTypes, tml.typeName)) {
                        model.platformOptions.platformTypes.push(tml.typeName)
                    }

                    tml.tokens = [];
                    model.byPlat[platform_id] = tml;
                });

                fns.gotPlatforms(_.values(model.byPlat));
                getHolidays(fns);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                perror("error: " + thrownError);
            }
        });
    };

    /**
     * Retrieves the holidays.
     * @param fns  Callback functions
     */
    var getHolidays = function(fns) {
        console.log("Calling url = " + odssplatimConfig.rest + "/periods/holidays");
        $.ajax({
            url:       odssplatimConfig.rest + "/periods/holidays",
            type:      "GET",
            dataType:  "json",

            success: function(res) {
                success();
                fns.gotHolidays(res);
                refreshTimelines(fns);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (xhr.status == 404) {
                    success();
                    fns.gotHolidays();
                    refreshTimelines(fns);
                }
                else {
                    perror("error: " + thrownError);
                }
            }
        });
    };

    /**
     * Retrieves the timelines (ie., platforms having tokens).
     * @param fns  Callback functions
     */
    var refreshTimelines = function(fns) {
        console.log("Calling url = " + odssplatimConfig.rest + "/timelines");
        $.ajax({
            url:       odssplatimConfig.rest + "/timelines",
            type:      "GET",
            dataType:  "json",

            success: function(res) {
                success();

                model.platform_ids = [];
                _.each(res, function(elm) {
                    var platform_id = elm.id;
                    var tml = _.extend({
                        platform_id:   platform_id,
                        platform_name: elm.name
                    }, elm);
                    tml = _.omit(tml, 'id', 'name');

                    tml.tokens = [];
                    model.byPlat[platform_id] = tml;

                    model.platform_ids.push(platform_id);
                });

                var platforms_with_tokens = _.pick(model.byPlat, model.platform_ids);
                fns.gotTimelines(platforms_with_tokens);

                putTokens(fns);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                perror("error: " + thrownError);
            }
        });
    };

    /**
     * Retrieves the tokens for the platforms having tokens.
     * @param fns  Callback functions
     */
    var putTokens = function(fns) {
        var platforms_with_tokens = _.pick(model.byPlat, model.platform_ids);
        _.each(platforms_with_tokens, function(tml) {
            var platform_id   = tml.platform_id;
            var platform_name = tml.platform_name;
            //console.log("getting tokens for " + platform_name + " (" +platform_id+ ")");
            pprogress("getting tokens for " + platform_name);
            $.ajax({
                url:       odssplatimConfig.rest + "/timelines/" + platform_id,
                type:      "GET",
                dataType:  "json",

                success: function(tokens) {
                    success();
                    model.byPlat[platform_id].tokens = tokens;
                    //console.log("tokens added to " + tml.platform_name+ ": " +tokens.length);
                    fns.gotTokens(tml, tokens);
                },

                error: function (xhr, ajaxOptions, thrownError) {
                    perror("error: " + thrownError);
                }
            });
        });
        refreshPeriods(fns);
    };

    /**
     * Retrieves the defined periods.
     * @param fns  Callback functions
     */
    var refreshPeriods = function(fns) {
        console.log("Calling url = " + odssplatimConfig.rest + "/periods");
        $.ajax({
            url:       odssplatimConfig.rest + "/periods",
            type:      "GET",
            dataType:  "json",

            success: function(res) {
                success();
                fns.gotPeriods(res);
                getDefaultPeriodId(fns);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                perror("error: " + thrownError);
            }
        });
    };

    /**
     * Retrieves the default period.
     * @param fns  Callback functions
     */
    var getDefaultPeriodId = function(fns) {
        console.log("Calling url = " + odssplatimConfig.rest + "/periods/default");
        $.ajax({
            url:       odssplatimConfig.rest + "/periods/default",
            type:      "GET",
            dataType:  "json",

            success: function(res) {
                success();
                fns.gotDefaultPeriodId(res);
                fns.refreshComplete();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (xhr.status == 404) {
                    success();
                    fns.gotDefaultPeriodId();
                    fns.refreshComplete();
                }
                else {
                    perror("error: " + thrownError);
                }
            }
        });
    };


    angular.module('odssPlatimApp.model', [])
        .factory('platimModel', [function() {
            return model;
        }])
    ;


})();