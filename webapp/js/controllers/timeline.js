'use strict';

angular.module('odssPlatimApp.controllers.timeline', [])

    .factory('timelineWidget', ['service', function(service) {
        var tokenForm = {
            showForm: function(args) {
                console.log("showForm: args=", args);
                var token = args.tokenInfo;
                console.log("showForm: token=", token);
                service.editToken(token, args.row);
            }
        };
        var timelineWidget = new TimelineWidget($("#timelines")[0], tokenForm);
        timelineWidget.draw();

        return timelineWidget;
    }])

    .controller('TimelineCtrl', ['$scope', '$modal', '$timeout', 'platimModel', 'service', 'timelineWidget',
        function ($scope, $modal, $timeout, platimModel, service, timelineWidget) {

            $scope.token = undefined;
            var row;

            $scope.$on('editToken', function(event, token, _row) {
                console.log('editToken:', token);
                $scope.$apply(function() {
                    row = _row;
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
                    console.log('Token dialog accepted:', token, "row=", row);

                    var platform = platimModel.byPlat[token.platform_id];

                    var ptoken = _.find(platform.tokens, function(t) {
                        return t.token_id === token.token_id
                    });

                    timelineWidget.data[row] = _.extend(token, {
                        state:         token.state,
                        description:   token.description,
                        start:         moment(token.start).toDate(),
                        end :          moment(token.end).toDate(),
                        content:       token.state
                    });
                    timelineWidget.updateStatusModified(row);
                    console.log('timelineWidget data[row]', timelineWidget.data[row]);

                    timelineWidget.redraw();

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
