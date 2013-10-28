'use strict';


angular.module('odssPlatimApp.timelineWidget', [])
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
;
