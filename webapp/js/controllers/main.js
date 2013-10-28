'use strict';

angular.module('odssPlatimApp.controllers.main', [])

    .controller('MainCtrl', ['$scope', 'platimModel', 'service', function ($scope, platimModel, service) {

        //var tokenForm      = new TokenForm(window.odssPlatimApp);
        var tokenForm = {
            showForm: function(args) {
                console.log("showForm: args=", args);

                var token = _.pick(args.tokenInfo,
                                   "token_id", "state",
                                   "platform_id", "platform_name",
                                   "start", "end",
                                   "status");
                token.description = "(pending)";
                console.log("showForm: token=", token);

                service.editToken(token);
            }
        };
        var timelineWidget = new TimelineWidget($("#timelines")[0], tokenForm);
        timelineWidget.draw();

        var gotPlatforms = function(platforms) {
            //console.log("gotPlatforms: ", platforms);
        };

        $scope.holidays = undefined;
        var gotHolidays = function(res) {
            //console.log("gotHolidays: " + JSON.stringify(res));
            $scope.holidays = res && res.holidays;
            //$scope.$digest();
            platimModel.holidays = $scope.holidays;
        };

        var gotTimelines = function(timelines) {
            //console.log("gotTimelines: ", timelines);
        };

        var gotTokens = function(tml, tokens) {
        };

        $scope.periods = {};

        var gotPeriods = function(res) {
            //console.log("gotPeriods: " + JSON.stringify(res));
            $scope.periods = {};
            _.each(res, function(per) {
                $scope.periods[per.id] = per;
            });
            //$scope.$digest();
            platimModel.periods = $scope.periods;
        };

        var gotDefaultPeriodId = function(res) {
            platimModel.selectedPeriodId = res.defaultPeriodId;
            setVisibleChartRange();
            timelineWidget.redraw();
        };

        function setVisibleChartRange() {
            var selectedPeriod = platimModel.getSelectedPeriod();
            if (selectedPeriod !== undefined) {
                var start = selectedPeriod.start;
                var end   = selectedPeriod.end;
                timelineWidget.setVisibleChartRange(moment(start).add("d", -1),
                                                    moment(end).  add("d", +1));
            }
            else {
                timelineWidget.adjustVisibleChartRange();
            }
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
            timelineWidget.reinit($scope.holidays);
            _.each(selectedPlatforms, insertTimeline);
            timelineWidget.redraw();
        };

        $scope.$on('platformOptionsUpdated', platformOptionsUpdated);

        $scope.$on('periodSelected', setVisibleChartRange);
    }])
;