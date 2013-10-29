'use strict';

angular.module('odssPlatimApp.controllers.timeline', [])

    .factory('timelineWidget', ['service', function(service) {
        var tokenForm = {
            showForm: function(args) {
                console.log("showForm: args=", args);
                var token = args.tokenInfo;
                console.log("showForm: token=", token);
                service.editToken(token);
            }
        };
        var timelineWidget = new TimelineWidget($("#timelines")[0], tokenForm);
        timelineWidget.draw();

        return timelineWidget;
    }])

    .controller('TimelineCtrl', ['$scope', '$modal', '$timeout', 'platimModel', 'service',
        function ($scope, $modal, $timeout, platimModel, service) {

            $scope.token = undefined;

            $scope.$on('editToken', function(event, token) {
                console.log('editToken:', token);
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

                    var platform = platimModel.byPlat[token.platform_id];

                    var ptoken = _.find(platform.tokens, function(t) {
                        return t.token_id === token.token_id
                    });
                    ptoken.status = "status_modified";

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
