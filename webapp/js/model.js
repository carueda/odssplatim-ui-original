'use strict';

(function() {

var model = {

    platforms: [],
    timelines: [],

    platformOptions:       {
        platformTypes:   ["foo", "baz"],
        selection:      "tokens",
        selectedTypes:  {}
    }
};

model.refresh = function(fns) {
    getAllPlatforms(fns);
};

var getAllPlatforms = function(fns) {
    pstatus("Retrieving platforms...");
    $.ajax({
        url:       odssplatimConfig.rest + "/platforms",
        type:      "GET",
        dataType:  "json",

        success: function(res) {
            success();
            console.log("getAllPlatforms: " + JSON.stringify(res));

            model.platforms = [];
            _.each(res, function(elm) {
                var tml = _.extend({
                    platform_id:   elm.id,
                    platform_name: elm.name
                }, elm);
                tml = _.omit(tml, 'id', 'name');

                model.platforms.push(tml);

                if (!_.contains(model.platformOptions.platformTypes, tml.typeName)) {
                    model.platformOptions.platformTypes.push(tml.typeName)
                }
            });

            fns.gotPlatforms(model.platforms);
            getHolidays(fns);
        },

        error: function (xhr, ajaxOptions, thrownError) {
            perror("error: " + thrownError);
        }
    });
};

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


var refreshTimelines = function(fns) {
    console.log("Calling url = " + odssplatimConfig.rest + "/timelines");
    $.ajax({
        url:       odssplatimConfig.rest + "/timelines",
        type:      "GET",
        dataType:  "json",

        success: function(res) {
            success();

            model.timelines = [];
            _.each(res, function(elm) {
                var tml = _.extend({
                    platform_id:   elm.id,
                    platform_name: elm.name
                }, elm);
                tml = _.omit(tml, 'id', 'name');
                model.timelines.push(tml);
            });

            fns.gotTimelines(model.timelines);

            putTokens(fns);
        },

        error: function (xhr, ajaxOptions, thrownError) {
            perror("error: " + thrownError);
        }
    });
};

var putTokens = function(fns) {
    _.each(model.timelines, function(tml) {
        var platform_id   = tml.platform_id;
        var platform_name = tml.platform_name;
        //console.log("getting tokens for " + platform_name + " (" +platform_id+ ")");
        pprogress("getting tokens for " + platform_name);
        $.ajax({
            url:       odssplatimConfig.rest + "/timelines/" + platform_id,
            type:      "GET",
            dataType:  "json",

            success: function(res) {
                success();
                fns.gotTokens(tml, res);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                perror("error: " + thrownError);
            }
        });
    });
    refreshPeriods(fns);
};


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

var getDefaultPeriodId = function(fns) {
    console.log("Calling url = " + odssplatimConfig.rest + "/periods/default");
    $.ajax({
        url:       odssplatimConfig.rest + "/periods/default",
        type:      "GET",
        dataType:  "json",

        success: function(res) {
            success();
            fns.gotDefaultPeriodId(res);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            if (xhr.status == 404) {
                success();
                fns.gotDefaultPeriodId();
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