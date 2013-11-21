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
                        var platform_id = elm._id;
                        var tml = _.extend({
                            platform_id:   platform_id,
                            platform_name: elm.name
                        }, elm);
                        tml = _.omit(tml, '_id', 'name');

                        if (!_.contains(platimModel.platformOptions.platformTypes, tml.typeName)) {
                            platimModel.platformOptions.platformTypes.push(tml.typeName)
                        }

                        tml.tokens = [];
                        platimModel.byPlat[platform_id] = tml;
                    });

                    fns.gotPlatforms(_.values(platimModel.byPlat));
                    getHolidays(fns);
                })

                .error(httpErrorHandler)
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
                        httpErrorHandler(data, status, headers, config)
                    }
                });
        };

        /**
         * Retrieves the timelines (ie., platforms having tokens).
         * @param fns  Callback functions
         */
        var refreshTimelines = function(fns) {
            var url = odssplatimConfig.rest + "/tokens/timelines";
            console.log("GET " + url);
            $http.get(url)
                .success(function(res, status, headers, config) {
                    success();

                    platimModel.platform_ids = [];
                    _.each(res, function(elm) {
                        var platform_id = elm._id;
                        var tml = _.extend({
                            platform_id:   platform_id,
                            platform_name: elm.name
                        }, elm);
                        tml = _.omit(tml, '_id', 'name');

                        tml.tokens = [];
                        platimModel.byPlat[platform_id] = tml;

                        platimModel.platform_ids.push(platform_id);
                    });

                    var platforms_with_tokens = _.pick(platimModel.byPlat, platimModel.platform_ids);
                    fns.gotTimelines(platforms_with_tokens);

                    putTokens(fns);
                })

                .error(httpErrorHandler);
        };

        /**
         * Retrieves the tokens for the platforms having tokens.
         * @param fns  Callback functions
         */
        var putTokens = function(fns) {

            var platforms_with_tokens = _.pick(platimModel.byPlat, platimModel.platform_ids);
            var list = _.values(platforms_with_tokens);

            /**
             * Retrieves the tokens for the platform at the given index in the
             * list, and then recursively calls doList(index + 1).
             * listDone(true) is called when the list is completed, and
             * listDone(false) upon any error in the corresponding request.
             * @param index  Index in list
             */
            function doList(index) {
                if (index >= list.length) {
                    listDone(true);
                    return;
                }
                var tml = list[index];
                var platform_id   = tml.platform_id;
                var platform_name = tml.platform_name;
                //console.log("getting tokens for " + platform_name + " (" +platform_id+ ")");
                pprogress("getting tokens for " + platform_name);

                var url = odssplatimConfig.rest + "/tokens/timelines/" + platform_id;
                console.log("GET " + url);
                $http.get(url)
                    .success(function(tokens, status, headers, config) {
                        success();
                        _.each(tokens, function(token) {
                            token.token_id      = token._id;
                            token.platform_name = platform_name;
                            token.status        = "status_saved";
                        });
                        platimModel.byPlat[platform_id].tokens = tokens;
                        //console.log("tokens added to " + tml.platform_name+ ":", tokens);
                        fns.gotTokens(tml, tokens);
                        doList(index + 1)
                    })

                    .error(function(data, status, headers, config) {
                        httpErrorHandler(data, status, headers, config);
                        listDone(false);
                    });
            }

            function listDone(ok) {
                if (ok) {
                    refreshPeriods(fns);
                }
            }

            doList(0);
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
                        platimModel.periods[per._id] = per;
                    });
                    fns.gotPeriods(platimModel.periods);
                    getDefaultPeriodId(fns);
                })

                .error(httpErrorHandler);
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
                        httpErrorHandler(data, status, headers, config)
                    }
                });
        };

        /**
         * Sets the default period.
         */
        var setDefaultPeriodId = function(_id) {
            var url;
            if (_id === undefined) {
                url = odssplatimConfig.rest + "/periods/default";
                console.log("DELETE " + url);
                $http.delete(url)
                    .success(function(res, status, headers, config) {
                        success();
                        platimModel.selectedPeriodId = undefined;
                    })

                    .error(httpErrorHandler);
            }
            else {
                url = odssplatimConfig.rest + "/periods/default/" + _id;
                console.log("PUT " + url);
                $http.put(url)
                    .success(function(res, status, headers, config) {
                        success();
                        platimModel.selectedPeriodId = _id;
                    })

                    .error(httpErrorHandler);
            }
        };

        /**
         * Removes the given period from the database.
         */
        var removePeriod = function(_id) {
            var url = odssplatimConfig.rest + "/periods/" + _id;
            console.log("DELETE " + url);
            $http.delete(url)
                .success(function(res, status, headers, config) {
                    success();
                    delete platimModel.periods[_id];
                    if (platimModel.selectedPeriodId === _id) {
                        platimModel.selectedPeriodId = undefined;
                    }
                })

                .error(httpErrorHandler);
        };

        /**
         * Adds a period to the database.
         */
        var addPeriod = function(newPeriodInfo, successFn) {
            console.log("addPeriod:", newPeriodInfo);
            pstatus("saving new period '" +newPeriodInfo.name+ "'");
            var url = odssplatimConfig.rest + "/periods";

            console.log("POST " + url, "newPeriodInfo=", newPeriodInfo);
            $http({
                method:  'POST',
                url:     url,
                data:    newPeriodInfo
            })
                .success(function(res, status, headers, config) {
                    success();
                    platimModel.periods[res._id] = res;
                    platimModel.selectedPeriodId = res._id;
                    successFn();
                })

                .error(httpErrorHandler);
        };

        /**
         * Adds or updates the given token.
         */
        var saveToken = function(tokenInfo, index, successFn) {
            var url;
            console.log("saveToken: tokenInfo=" + JSON.stringify(tokenInfo));

            var item = {
                platform_id:   strip(tokenInfo.platform_id),
                start:         unparseDate(tokenInfo.start),
                end:           unparseDate(tokenInfo.end),
                state:         tokenInfo.state,
                description:   tokenInfo.description
            };

            if (tokenInfo.token_id !== undefined) {
                // update existing token:
                console.log("saveToken: updating token_id=" +tokenInfo.token_id, item);
                pprogress("saving modified token ...");

                url = odssplatimConfig.rest + "/tokens/" + tokenInfo.token_id;
                $http.put(url, item)
                    .success(function(res, status, headers, config) {
                        success();
                        successFn(index, tokenInfo);
                        console.log("token updated:", tokenInfo);
                    })

                    .error(httpErrorHandler);
            }
            else {
                // add new token
                console.log("saveToken: posting new token", item);
                pprogress("saving new token ...");

                url = odssplatimConfig.rest + "/tokens";
                $http({
                    method:  'POST',
                    url:     url,
                    data:    item
                })
                    .success(function(data, status, headers, config) {
                        success();
                        tokenInfo.token_id = data._id;
                        successFn(index, tokenInfo);
                        console.log("token posted:", tokenInfo);
                    })
                    .error(httpErrorHandler);
            }
        };

        /**
         * Removes the given token.
         */
        var deleteToken = function(tokenInfo, index, successFn) {
            if (tokenInfo.token_id === undefined) {
                successFn(tokenInfo, index);
                return;
            }

            pprogress("deleting token ...");
            var url = odssplatimConfig.rest + "/tokens/" + tokenInfo.token_id;
            console.log("DELETE " + url);
            $http.delete(url)
                .success(function(res, status, headers, config) {
                    success();
                    successFn(tokenInfo, index);
                })
                .error(httpErrorHandler);
        };

        var httpErrorHandler = function(data, status, headers, config) {
            var reqMsg = config.method + " '" + config.url + "'";
            console.log("error in request " +reqMsg+ ":",
                        "data=", data, "status=", status,
                        "config=", config);
            perror("[" + status+ "] An error occured in a request to the " +
                   "back-end service. Try again in a few moments.");
        };

        return {
            refresh: refresh,

            platformOptionsUpdated: function() {
                $rootScope.$broadcast('platformOptionsUpdated');
            },

            editToken: function(token, row) {
                $rootScope.$broadcast('editToken', token, row);
            },

            saveToken: saveToken,
            deleteToken: deleteToken,

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
