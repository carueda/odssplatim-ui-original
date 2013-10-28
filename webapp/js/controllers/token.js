'use strict';

angular.module('odssPlatimApp.controllers.token', [])

    .controller('TokenCtrl', ['$scope', '$modal', '$timeout', 'platimModel', 'service',
        function ($scope, $modal, $timeout, platimModel, service) {

            $scope.token = { // TODO remove this temporary def for testing
                platform_name:   "some_plat",
                state:           "some_state",
                description:     "",
                start:           new Date(),
                end:             new Date(new Date().getTime() + 10*24*60*1000)
            };

            $scope.$on('editToken', function(event, token) {

                var platform = platimModel.byPlat[token.platform_id];
                token.platform_name = platform.platform_name;
                console.log("TokenCtrl.editToken:", token);
                _.each(platform.tokens, function(tok) {
                   if (tok.id === token.token_id) {
                        token.description = tok.description;
                   }
                });
                console.log("TokenCtrl.editToken:", token);
                $scope.$apply(function() {
                    $scope.token = token;
                    $scope.open();
                });
            });

            $scope.open = function () {

                var modalInstance = $modal.open({
                    templateUrl: 'views/token.html',
                    controller: 'TokenInstanceCtrl',
                    resolve: {
                        token: function () {
                            return $scope.token;
                        }
                    }
                });

                modalInstance.result.then(function (token) {
                    console.log('Token dialog accepted:', token);
                    //platimModel.platformOptions = $scope.platformOptions = platformOptions;
                    //service.platformOptionsUpdated();
                }, function () {
                    console.log('Token dialog dismissed');
                });
            };

        }])

    .controller('TokenInstanceCtrl', ['$scope', '$modalInstance', 'token',
        function ($scope, $modalInstance, token) {

            $scope.master = angular.copy(token);
            $scope.token  = angular.copy(token);

            $scope.set = function() {
                $scope.master = angular.copy($scope.token);
                $modalInstance.close($scope.master);
            };

            $scope.reset = function() {
                $scope.token = angular.copy($scope.master);
            };

            $scope.isValid = function() {
                return $scope.token.state !== "";
            };

            $scope.isUnchanged = function() {
                return angular.equals($scope.token, $scope.master);
            };

            $scope.reset();

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }])
;
