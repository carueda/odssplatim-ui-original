'use strict';

angular.module('odssPlatimApp.controllers.main', [])

    .controller('MainCtrl', ['$scope', 'platimModel', 'service', 'timelineWidget',
    function ($scope, platimModel, service, timelineWidget) {

        $scope.debug = window.location.toString().match(/.*\?debug/)
            ? { collapsed: true, model: platimModel }
            : undefined;

        var gotPlatforms = function(platforms) {
            //console.log("gotPlatforms: ", platforms);
        };

        var gotHolidays = function(res) {
            //console.log("gotHolidays: ", res);
        };

        var gotTimelines = function(timelines) {
            //console.log("gotTimelines: ", timelines);
        };

        var gotTokens = function(tml, tokens) {
        };

        $scope.periods = {};

        var gotPeriods = function(periods) {
            //console.log("gotPeriods:", periods);
        };

        var gotDefaultPeriodId = function() {
            setVisibleChartRange();
            timelineWidget.redraw();
        };

        function setVisibleChartRange() {
            var selectedPeriod = platimModel.getSelectedPeriod();
            if (selectedPeriod !== undefined
                && selectedPeriod.start !== undefined
                && selectedPeriod.end !== undefined
                ) {
                var start = selectedPeriod.start;
                var end   = selectedPeriod.end;
                timelineWidget.setVisibleChartRange(moment(start).add("d", -1),
                                                    moment(end).  add("d", +1));
            }
            else {
                timelineWidget.adjustVisibleChartRange();
            }
            timelineWidget.redraw();
        }

        /**
         * Triggers the refresh of the model.
         */
        $scope.refresh = function() {
            perror();
            $("#logarea").html("");
            console.log("refreshing...");
            pprogress("refreshing...");
            timelineWidget.reinit();
            service.refresh({
                gotPlatforms:         gotPlatforms,
                gotTimelines:         gotTimelines,
                gotTokens:            gotTokens,
                gotPeriods:           gotPeriods,
                gotDefaultPeriodId:   gotDefaultPeriodId,
                gotHolidays:          gotHolidays,
                refreshComplete:      platformOptionsUpdated
            });
        };

        /**
         * Inserts a timeline (a platform and its tokens) in the widget.
         * @param tml
         */
        var insertTimeline = function(tml) {
            timelineWidget.addGroup(tml);
            _.each(tml.tokens, function(token) {
                timelineWidget.addToken(token);
            });
        };

        /**
         * Called to reflect the selection options in the widget.
         */
        var platformOptionsUpdated = function() {
            var selectedPlatforms = platimModel.getSelectedPlatforms();
            timelineWidget.reinit(platimModel.holidays);
            _.each(selectedPlatforms, insertTimeline);
            timelineWidget.redraw();
        };

        $scope.$on('platformOptionsUpdated', platformOptionsUpdated);

        $scope.$on('periodSelected', setVisibleChartRange);

        /**
         * Saves the modified tokens in the timeline.
         */
        $scope.save = function() {

            function isNewOrModifiedToken(tokenInfo) {
                var res = tokenInfo.status !== undefined &&
                         (tokenInfo.status === "status_new" ||
                          tokenInfo.status.indexOf("_modified") >= 0);
                return res;
            }

            function isOkToBeSaved(tokenInfo) {
                var res = tokenInfo.status !== undefined &&
                          tokenInfo.state !== undefined &&
                          tokenInfo.state.trim() !== "";
                return res;
            }

            perror();
            pprogress("saving...");

            var skipped = 0;
            var toBeSaved = [];
            _.each(timelineWidget.data, function(tokenInfo, index) {
                if (isNewOrModifiedToken(tokenInfo)) {
                    if (isOkToBeSaved(tokenInfo)) {
                        toBeSaved.push({tokenInfo: tokenInfo, index: index});
                    }
                    else {
                        skipped += 1;
                    }
                }
            });

            var msg, skippedMsg = skipped > 0
                           ? " (" +skipped+ " skipped because of missing info)"
                           : "";
            if (toBeSaved.length > 0) {
                msg = "Saving " +toBeSaved.length+ " token(s)" + skippedMsg;
            }
            else {
                msg = "No tokens need to be saved" + skippedMsg;
            }
            console.log(msg);
            pstatus(msg);

            /**
             * Saves the token at the given index ii in the toBeSaved list,
             * and then recursively calls doList(ii + 1).
             * @param ii  Index in toBeSaved
             */
            function doList(ii) {
                if (ii >= toBeSaved.length) {
                    return; // done.
                }
                var elm = toBeSaved[ii];
                var tokenInfo = elm.tokenInfo;
                var index     = elm.index;
                service.saveToken(tokenInfo, index, function(index, tokenInfo) {
                    timelineWidget.updateStatus(index, tokenInfo, "status_saved");
                    doList(ii + 1);
                });
            }
            doList(0);
        };

        $(document).tooltip(); // TODO remove jQ stuff
    }])
;
