'use strict';

angular.module('odssPlatimApp.controllers.token', [])

    .controller('TokenCtrl', ['$scope', '$modal', '$timeout', 'platimModel', 'service',
        function ($scope, $modal, $timeout, platimModel, service) {

              $scope.dateOptions = {
                'year-format': "'yy'",
                'starting-day': 1
              };

            $scope.openStartDate = function() {
                $timeout(function() {
                    $scope.opened = true;
                });
            };

            $scope.token = {
                platform_name:   "TIMELINE",
                state:           "STATE",
                description:     "foo bar blah blah",
                start:           new Date(),
                end:             new Date(new Date().getTime() + 10*24*60*1000)
            };

            $scope.$on('editToken', function(event, token) {
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
