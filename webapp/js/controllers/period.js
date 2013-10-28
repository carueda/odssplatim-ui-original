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

    .controller('PeriodInstanceCtrl', ['$scope', '$modalInstance', 'platimModel',
        function ($scope, $modalInstance, platimModel) {

            var periods_plus_create = platimModel.periods;
            periods_plus_create["!"] = {
               id:     "!",
               name:   "--create period--",
               start:  moment().toDate(),
               end:    moment().toDate()
            };
            var info = {
                periods:         _.values(periods_plus_create),
                selectedPeriod:  platimModel.periods[platimModel.selectedPeriodId],
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
                return $scope.info.selectedPeriod.id == '!';
            };

            $scope.create = function() {
                console.log("create:", $scope.info);
            };

            $scope.setDefault = function() {
                console.log("setDefault:", $scope.info.selectedPeriod);
            };

            $scope.delete = function() {
                console.log("delete:", $scope.info.selectedPeriod);
            };

            $scope.isUnchanged = function() {
                return angular.equals($scope.info.selectedPeriod.id, $scope.master.selectedPeriod.id);
            };

            $scope.isInvalid = function() {
                return $scope.info.newName == ""
                    || $scope.info.selectedPeriod.start.getTime() > $scope.info.selectedPeriod.end.getTime();
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }])
;
