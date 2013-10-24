'use strict';

angular.module('odssPlatimApp.controllers.platform', [])

    .controller('PlatformCtrl', ['$scope', '$modal', 'platimModel', 'service',
        function ($scope, $modal, platimModel, service) {

            $scope.open = function () {

                $scope.platformOptions = platimModel.platformOptions;
                console.log("$scope.platformOptions:", $scope.platformOptions);

                var modalInstance = $modal.open({
                    templateUrl: 'views/platform.html',
                    controller: 'PlatformInstanceCtrl',
                    resolve: {
                        platformOptions: function () {
                            return $scope.platformOptions;
                        }
                    }
                });

                modalInstance.result.then(function (platformOptions) {
                    platimModel.platformOptions = $scope.platformOptions = platformOptions;
                    service.platformOptionsUpdated();
                }, function () {
                    console.log('Platform dialog dismissed');
                });
            };

        }])

    .controller('PlatformInstanceCtrl', ['$scope', '$modalInstance', 'platformOptions',
        function ($scope, $modalInstance, platformOptions) {

            $scope.master          = angular.copy(platformOptions);
            $scope.platformOptions = angular.copy(platformOptions);

            $scope.set = function() {
                $scope.master = angular.copy($scope.platformOptions);
                $modalInstance.close($scope.master);
            };

            $scope.reset = function() {
                $scope.platformOptions = angular.copy($scope.master);
            };

            $scope.isValid = function() {
                return $scope.platformOptions.selection !== "types"
                    || _.any(_.values($scope.platformOptions.selectedTypes));
            };

            $scope.isUnchanged = function() {
                if ($scope.platformOptions.selection === "types") {
                    return $scope.master.selection === "types"
                        && angular.equals($scope.platformOptions.selectedTypes, $scope.master.selectedTypes);
                }
                else {
                    return $scope.platformOptions.selection === $scope.master.selection;
                }
            };

            $scope.reset();

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }])
;
