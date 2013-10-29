'use strict';

angular.module('odssPlatimApp.controllers.period', [])

    .controller('PeriodCtrl', ['$scope', '$modal', '$timeout', 'platimModel', 'service',
        function ($scope, $modal, $timeout, platimModel, service) {

            $scope.open = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'views/period.html',
                    controller: 'PeriodInstanceCtrl'
                });

                modalInstance.result.then(function (selectedPeriod) {
                    console.log('Period dialog accepted:', selectedPeriod);
                    platimModel.selectedPeriodId = selectedPeriod.id;
                    service.periodSelected();
                }, function () {
                    console.log('Period dialog dismissed');
                });
            };

        }])

    .controller('PeriodInstanceCtrl', ['$scope', '$modalInstance', 'platimModel', 'service', 'timelineWidget',
        function ($scope, $modalInstance, platimModel, service, timelineWidget) {

            var periods_plus_create = platimModel.periods;
            periods_plus_create["--all tokens--"] = {
               id:     "--all tokens--",
               name:   "Show all tokens",
               start:  undefined,
               end:    undefined
            };

            var dr = timelineWidget.getVisibleChartRange();
            periods_plus_create["--create period--"] = {
               id:     "--create period--",
               name:   "--create period--",
               start:  moment(dr.start).toDate(),
               end:    moment(dr.end).toDate()
            };

            var selectedPeriod;
            if (platimModel.periods[platimModel.selectedPeriodId]) {
                selectedPeriod = platimModel.periods[platimModel.selectedPeriodId];
            }
            else {
                platimModel.selectedPeriodId = "--all tokens--";
                selectedPeriod = periods_plus_create[platimModel.selectedPeriodId];
            }

            var info = {
                periods:         _.values(periods_plus_create),
                selectedPeriod:  selectedPeriod,
                newName:         ""  // when creating a new period
            };
            console.log("info:", info);

            $scope.info = info;
            $scope.master = angular.copy(info);

            $scope.change = function() {
                console.log("change:", $scope.info.selectedPeriod);
            };

            $scope.set = function() {
                $scope.master = angular.copy($scope.info);
                $modalInstance.close($scope.master.selectedPeriod);
            };

            $scope.isCreating = function() {
                return $scope.info.selectedPeriod.id == "--create period--";
            };

            $scope.create = function() {
                console.log("create:", $scope.info);
                var newPeriodInfo = {
                    name:  $scope.info.newName,
                    start: moment($scope.info.selectedPeriod.start).format("YYYY-MM-DD"),
                    end:   moment($scope.info.selectedPeriod.end).  format("YYYY-MM-DD")
                };
                $modalInstance.dismiss('create period');
                service.addPeriod(newPeriodInfo, function() {
                    service.periodSelected();
                });
            };

            $scope.setDefault = function() {
                console.log("setDefault:", $scope.info.selectedPeriod);
                var id = $scope.info.selectedPeriod.id;
                if ( id === "--all tokens--") {
                    id = undefined;
                }
                service.setDefaultPeriodId(id);
                // and set this period, and close dialog:
                $scope.set();
            };

            $scope.delete = function() {
                console.log("delete:", $scope.info.selectedPeriod);

                var periodInfo = $scope.info.selectedPeriod;
                service.confirm({
                    title:     "Confirm deletion",
                    message:   "Period '" + periodInfo.name + "' will be deleted.",
                    ok:        function() {
                        $modalInstance.dismiss('delete period');
                        service.removePeriod(periodInfo.id);
                    }
                });
            };

            $scope.isUnchanged = function() {
                return angular.equals($scope.info.selectedPeriod.id, $scope.master.selectedPeriod.id);
            };

            $scope.isInvalid = function() {
                return $scope.isCreating() &&
                    ($scope.info.newName == ""
                     || $scope.info.selectedPeriod.start.getTime() > $scope.info.selectedPeriod.end.getTime());
            };

            $scope.cannotDelete = function() {
                return $scope.isCreating()
                    || $scope.info.selectedPeriod.id.indexOf("--") == 0
                    || $scope.info.selectedPeriod.id === platimModel.selectedPeriodId;
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }])
;
