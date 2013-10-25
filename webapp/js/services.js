'use strict';

/* Services */


angular.module('odssPlatimApp.services', [])
    .factory('service', ['$rootScope', '$http', 'platimModel', function($rootScope, $http, platimModel) {

        /**
         * Start the full refresh of the model (except options)
         * @param fns  Callback functions
         */
        var refresh = function(fns) {
            getAllPlatforms(fns);
        };

        /**
         * Retrieves all platform.
         * @param fns  Callback functions
         */
        var getAllPlatforms = function(fns) {
            pstatus("Retrieving platforms...");
            var url = odssplatimConfig.rest + "/platforms";
            console.log("GET " + url);
            $http.get(url)
                .success(function(res, status, headers, config) {
                    success();
                    //console.log("getAllPlatforms: " + JSON.stringify(res));

                    _.each(res, function(elm) {
                        var platform_id = elm.id;
                        var tml = _.extend({
                            platform_id:   platform_id,
                            platform_name: elm.name
                        }, elm);
                        tml = _.omit(tml, 'id', 'name');

                        if (!_.contains(platimModel.platformOptions.platformTypes, tml.typeName)) {
                            platimModel.platformOptions.platformTypes.push(tml.typeName)
                        }

                        tml.tokens = [];
                        platimModel.byPlat[platform_id] = tml;
                    });

                    fns.gotPlatforms(_.values(platimModel.byPlat));
                    getHolidays(fns);
                })

                .error(function(data, status, headers, config) {
                    perror("error: " + status);
                })
            ;
        };

        /**
         * Retrieves the holidays.
         * @param fns  Callback functions
         */
        var getHolidays = function(fns) {
            var url = odssplatimConfig.rest + "/periods/holidays";
            console.log("GET " + url);
            $http.get(url)
                .success(function(res, status, headers, config) {
                    success();
                    fns.gotHolidays(res);
                    refreshTimelines(fns);
                })
                .error(function(data, status, headers, config) {
                    if (status == 404) {
                        success();
                        fns.gotHolidays();
                        refreshTimelines(fns);
                    }
                    else {
                        perror("error: " + status);
                    }
                });
        };

        /**
         * Retrieves the timelines (ie., platforms having tokens).
         * @param fns  Callback functions
         */
        var refreshTimelines = function(fns) {
            var url = odssplatimConfig.rest + "/timelines";
            console.log("GET " + url);
            $http.get(url)
                .success(function(res, status, headers, config) {
                    success();

                    platimModel.platform_ids = [];
                    _.each(res, function(elm) {
                        var platform_id = elm.id;
                        var tml = _.extend({
                            platform_id:   platform_id,
                            platform_name: elm.name
                        }, elm);
                        tml = _.omit(tml, 'id', 'name');

                        tml.tokens = [];
                        platimModel.byPlat[platform_id] = tml;

                        platimModel.platform_ids.push(platform_id);
                    });

                    var platforms_with_tokens = _.pick(platimModel.byPlat, platimModel.platform_ids);
                    fns.gotTimelines(platforms_with_tokens);

                    putTokens(fns);
                })

                .error(function(data, status, headers, config) {
                    perror("error: " + status);
                });
        };

        /**
         * Retrieves the tokens for the platforms having tokens.
         * @param fns  Callback functions
         */
        var putTokens = function(fns) {
            var platforms_with_tokens = _.pick(platimModel.byPlat, platimModel.platform_ids);
            _.each(platforms_with_tokens, function(tml) {
                var platform_id   = tml.platform_id;
                var platform_name = tml.platform_name;
                //console.log("getting tokens for " + platform_name + " (" +platform_id+ ")");
                pprogress("getting tokens for " + platform_name);

                var url = odssplatimConfig.rest + "/timelines/" + platform_id;
                console.log("GET " + url);
                $http.get(url)
                    .success(function(tokens, status, headers, config) {
                        success();
                        platimModel.byPlat[platform_id].tokens = tokens;
                        //console.log("tokens added to " + tml.platform_name+ ": " +tokens.length);
                        fns.gotTokens(tml, tokens);
                    })

                    .error(function(data, status, headers, config) {
                        perror("error: " + status);
                    });
            });
            refreshPeriods(fns);
        };

        /**
         * Retrieves the defined periods.
         * @param fns  Callback functions
         */
        var refreshPeriods = function(fns) {
            var url = odssplatimConfig.rest + "/periods";
            console.log("GET " + url);
            $http.get(url)
                .success(function(res, status, headers, config) {
                    success();
                    fns.gotPeriods(res);
                    getDefaultPeriodId(fns);
                })

                .error(function(data, status, headers, config) {
                    perror("error: " + status);
                });
        };

        /**
         * Retrieves the default period.
         * @param fns  Callback functions
         */
        var getDefaultPeriodId = function(fns) {
            var url = odssplatimConfig.rest + "/periods/default";
            console.log("GET " + url);
            $http.get(url)
                .success(function(res, status, headers, config) {
                    success();
                    fns.gotDefaultPeriodId(res);
                    fns.refreshComplete();
                })

                .error(function(data, status, headers, config) {
                    if (status == 404) {
                        success();
                        fns.gotDefaultPeriodId();
                        fns.refreshComplete();
                    }
                    else {
                        perror("error: " + status);
                    }
                });
        };

        return {
            platformOptionsUpdated: function() {
                $rootScope.$broadcast('platformOptionsUpdated');
            },

            refresh: refresh
        };
    }])
;
