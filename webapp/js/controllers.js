'use strict';

angular.module('odssPlatimApp', [
    'ui.bootstrap',
    'odssPlatimApp.model',
    'odssPlatimApp.controllers'
]);

angular.module('odssPlatimApp.controllers', [])

    .controller('PlatformCtrl', ['$scope', '$modal', 'platimModel',
        function ($scope, $modal, platimModel) {

            $scope.open = function () {

                platimModel.refreshPlatformTypes();
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

    .controller('PlatformInstanceCtrl', ['$scope', '$modalInstance', 'platformOptions',
        function ($scope, $modalInstance, platformOptions) {

            $scope.master          = angular.copy(platformOptions);
            $scope.platformOptions = angular.copy(platformOptions);

            $scope.set = function() {
                $scope.master = angular.copy($scope.platformOptions);

                if ($scope.master.selection === "all") {
                    odssPlatimApp.getAllPlatforms();
                }
                else if ($scope.master.selection === "tokens") {
                    // TODO
                    odssPlatimApp.refresh();
                }
                else {
                    // TODO
                    console.log("TODO: show platforms with selected types",
                                $scope.master.selectedTypes);
                }

                $modalInstance.close($scope.master);
            };

            $scope.reset = function() {
                $scope.platformOptions = angular.copy($scope.master);
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
