'use strict';

angular.module('odssPlatimApp.controllers.platform', [])

    .controller('PlatformCtrl', ['$scope', '$modal', 'platimModel',
        function ($scope, $modal, platimModel) {

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
                    console.log("xx platformOptions:", platformOptions);
                }, function () {
                    console.log('Platform dialog dismissed');
                });
            };

        }])

    .controller('PlatformInstanceCtrl', ['$scope', '$modalInstance', 'platformOptions', 'service',
        function ($scope, $modalInstance, platformOptions, service) {

            $scope.master          = angular.copy(platformOptions);
            $scope.platformOptions = angular.copy(platformOptions);

            $scope.set = function() {
                $scope.master = angular.copy($scope.platformOptions);

                service.refresh($scope.master);

//                if ($scope.master.selection === "all") {
//                    odssPlatimApp.getAllPlatforms();
//                }
//                else if ($scope.master.selection === "tokens") {
//                    // TODO
//                    odssPlatimApp.refresh();
//                }
//                else {
//                    // TODO
//                    console.log("TODO: show platforms with selected types",
//                                $scope.master.selectedTypes);
//                }

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
