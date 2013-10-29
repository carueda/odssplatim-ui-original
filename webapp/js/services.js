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
                    platimModel.holidays = res.holidays;
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
                        _.each(tokens, function(token) {
                            token.token_id      = token.id;
                            token.platform_name = platform_name;
                            token.status        = "status_saved";
                        });
                        platimModel.byPlat[platform_id].tokens = tokens;
                        //console.log("tokens added to " + tml.platform_name+ ":", tokens);
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
                    platimModel.periods = {};
                    _.each(res, function(per) {
                        platimModel.periods[per.id] = per;
                    });
                    fns.gotPeriods(platimModel.periods);
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
                    platimModel.selectedPeriodId = res.defaultPeriodId;
                    fns.gotDefaultPeriodId();
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

        /**
         * Sets the default period.
         */
        var setDefaultPeriodId = function(id) {
            var url;
            if (id === undefined) {
                url = odssplatimConfig.rest + "/periods/default";
                console.log("DELETE " + url);
                $http.delete(url)
                    .success(function(res, status, headers, config) {
                        success();
                        platimModel.selectedPeriodId = undefined;
                    })

                    .error(function(data, status, headers, config) {
                        perror("error: " + status);
                    });
            }
            else {
                url = odssplatimConfig.rest + "/periods/default/" + id;
                console.log("PUT " + url);
                $http.put(url)
                    .success(function(res, status, headers, config) {
                        success();
                        platimModel.selectedPeriodId = id;
                    })

                    .error(function(data, status, headers, config) {
                        perror("error: " + status);
                    });
            }
        };

        /**
         * Removes the given period from the database.
         */
        var removePeriod = function(id) {
            var url = odssplatimConfig.rest + "/periods/" + id;
            console.log("DELETE " + url);
            $http.delete(url)
                .success(function(res, status, headers, config) {
                    success();
                    delete platimModel.periods[id];
                    if (platimModel.selectedPeriodId === id) {
                        platimModel.selectedPeriodId = undefined;
                    }
                })

                .error(function(data, status, headers, config) {
                    perror("error: " + status);
                });
        };

        /**
         * Adds a period to the database.
         */
        var addPeriod = function(newPeriodInfo, successFn) {
            console.log("addPeriod:", newPeriodInfo);
            pstatus("saving new period '" +newPeriodInfo.name+ "'");
            var url = odssplatimConfig.rest + "/periods";
            console.log("POST " + url);

            /* note: currently, back-end service expects data as parameters,
             * not as json payload.
             */
            var params = $.param(newPeriodInfo);
            $http({
                method:  'POST',
                url:     url,
                data:    params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
                .success(function(res, status, headers, config) {
                    success();
                    platimModel.periods[res.id] = res;
                    platimModel.selectedPeriodId = res.id;
                    successFn();
                })

                .error(function(data, status, headers, config) {
                    console.log("error: ", data, status, headers, config);
                    perror("error: " +status);
                });
        };

        return {
            refresh: refresh,

            platformOptionsUpdated: function() {
                $rootScope.$broadcast('platformOptionsUpdated');
            },

            editToken: function(token, row) {
                $rootScope.$broadcast('editToken', token, row);
            },

            periodSelected: function() {
                $rootScope.$broadcast('periodSelected');
            },

            setDefaultPeriodId:  setDefaultPeriodId,
            addPeriod:           addPeriod,
            removePeriod:        removePeriod,

            confirm: function(info) {
                console.log("service: confirm: ", info);
                $rootScope.$broadcast('confirm', info);
            }

        };
    }])
;
