'use strict';

(function() {

angular.module('odssPlatimApp.controllers.main', [])

    .controller('MainCtrl', ['$scope', 'platimModel', function ($scope, platimModel) {

        var tokenForm      = new TokenForm(window.odssPlatimApp);
        var timelineWidget = new TimelineWidget($("#timelines")[0], tokenForm);
        timelineWidget.draw();

        var gotPlatforms = function(platforms) {
            console.log("gotPlatforms: ", platforms);
//                _.each(platforms, function(tml) {
//                    timelineWidget.addGroup(tml);
//                    timelineWidget.redraw();
//                });
//                timelineWidget.redraw();
            $scope.$digest();
        };

        $scope.holidays = undefined;
        var gotHolidays = function(res) {
            console.log("gotHolidays: " + JSON.stringify(res));
            $scope.holidays = res && res.holidays;
            $scope.$digest();
        };

        var gotTimelines = function(timelines) {
            //console.log("gotTimelines = " + JSON.stringify(timelines));

            timelineWidget.reinit($scope.holidays);
            $scope.timelines = timelines;
            _.each(timelines, function(tml) {
                timelineWidget.addGroup(tml);
            });
            timelineWidget.redraw();
        };

        var gotTokens = function(tml, tokens) {
            var platform_id   = tml.platform_id;
            var platform_name = tml.platform_name;

            if (tokens.length == 0) {
                return;
            }
//                console.log("got tokens for " + platform_name + " (" +platform_id+ ")"
//                    , tokens
//                );

            _.each(tokens, function(token) {
                token.platform_name  = platform_name;
                token.status         = "status_saved";
                timelineWidget.addToken(token);
            });

//                setVisibleChartRange();
            timelineWidget.redraw();
        };

        $scope.periods = {};

        var gotPeriods = function(res) {
            console.log("gotPeriods: " + JSON.stringify(res));
            $scope.periods = {};
            _.each(res, function(per) {
                $scope.periods[per.id] = per;
            });
            $scope.$digest();
            //console.log("periods: " + JSON.stringify(periods));
        };

        $scope.defaultPeriodId = "?";

        var gotDefaultPeriodId = function(res) {
            //console.log("gotDefaultPeriodId: " + JSON.stringify(res));
            $scope.defaultPeriodId = res && res.defaultPeriodId;
            setVisibleChartRange();
            timelineWidget.redraw();
            $scope.$digest();
        };

        function setVisibleChartRange() {
            //console.log("setVisibleChartRange: ", $scope.defaultPeriodId);
            var defaultPeriod = null;
            if ($scope.defaultPeriodId !== undefined) {
                defaultPeriod = $scope.periods[$scope.defaultPeriodId];
            }

            if (defaultPeriod) {
                var start = defaultPeriod.start;
                var end   = defaultPeriod.end;
                timelineWidget.setVisibleChartRange(moment(start).add("d", -1),
                                                    moment(end).  add("d", +1));
            }
            else {
                timelineWidget.adjustVisibleChartRange();
            }
        }


        $scope.refresh = function() {
            perror();
            $("#logarea").html("");
            console.log("refreshing...");
            pprogress("refreshing...");
            timelineWidget.reinit();
            platimModel.refresh({
                gotPlatforms:         gotPlatforms,
                gotTimelines:         gotTimelines,
                gotTokens:            gotTokens,
                gotPeriods:           gotPeriods,
                gotDefaultPeriodId:   gotDefaultPeriodId,
                gotHolidays:          gotHolidays
            });
        };

        var platformOptionsUpdated = function() {
            var platformOptions = platimModel.platformOptions;
            var selection = platformOptions.selection;
            timelineWidget.reinit($scope.holidays);

            var platforms = platimModel.platforms;

            if (selection === "all") {
                _.each(platforms, function(tml) {
                    timelineWidget.addGroup(tml);
                });
            }
            else if (selection === "types") {
                var selected = platimModel.getSelectedTypes();
                console.log("showing platforms with selected types", selected);
                _.each(platforms, function(tml) {
                    if (_.indexOf(selected, tml.typeName) >= 0) {
                        timelineWidget.addGroup(tml);
                    }
                });
            }
            else if (selection === "tokens") {
                console.log("show platforms with tokens");
                _.each(platimModel.timelines, function(tml) {
                    timelineWidget.addGroup(tml);
                });
            }
            else {
                throw new Error("unexpected selection value: " +selection);
            }

            timelineWidget.redraw();
        };

        $scope.$on('platformOptionsUpdated', function() {
            console.log("MainCtrl: platformOptionsUpdated:", platimModel.platformOptions);
            platformOptionsUpdated();
        });
    }])

;


})();

