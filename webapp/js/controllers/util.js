'use strict';

angular.module('odssPlatimApp.controllers.util', [])

    .controller('UtilCtrl', ['$scope', '$modal',
        function ($scope, $modal) {

            $scope.$on('confirm', function(event, info) {
                console.log("UtilCtrl.confirm:", info);
                $scope.info = info;
                $scope.open();
            });

            $scope.open = function () {

                var modalInstance = $modal.open({
                    templateUrl: 'views/confirm.html',
                    controller: 'ConfirmInstanceCtrl',
                    resolve: {
                        info: function () {
                            return $scope.info;
                        }
                    }

                });

                modalInstance.result.then(function() {
                    console.log('Confirmation accepted', arguments);
                    $scope.info.ok()
                }, function () {
                    console.log('Confirmation dismissed', arguments);
                });
            };

        }])

    .controller('ConfirmInstanceCtrl', ['$scope', '$modalInstance', 'info',
        function ($scope, $modalInstance, info) {

            $scope.title   = info.title;
            $scope.message = info.message;

            $scope.ok = function() {
                $modalInstance.close();
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }])
;
