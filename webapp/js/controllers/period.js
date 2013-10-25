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
                    // TODO
                }, function () {
                    console.log('Period dialog dismissed');
                });
            };

        }])

    .controller('PeriodInstanceCtrl', ['$scope', '$modalInstance', 'platimModel',
        function ($scope, $modalInstance, platimModel) {

            var info = {
                periods:        _.values(platimModel.periods),
                selectedPeriod: platimModel.periods[platimModel.defaultPeriodId]
            };
            console.log("info:", info);

            $scope.master = angular.copy(info);
            $scope.info = angular.copy($scope.master);

            $scope.change = function() {
                console.log("change:", $scope.info.selectedPeriod);
            };

            $scope.set = function() {
                $scope.master = angular.copy($scope.info);
                $modalInstance.close($scope.master.selectedPeriod);
            };

            $scope.isUnchanged = function() {
                return angular.equals($scope.info.selectedPeriod.id, $scope.master.selectedPeriod.id);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }])
;
