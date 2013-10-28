'use strict';


angular.module('odssPlatimApp.timelineWidget', [])
    .factory('timelineWidget', ['service', function(service) {
        var tokenForm = {
            showForm: function(args) {
                console.log("showForm: args=", args);

                var token = _.pick(args.tokenInfo,
                                   "token_id", "state",
                                   "platform_id", "platform_name",
                                   "start", "end",
                                   "status");
                token.description = "(pending)";
                console.log("showForm: token=", token);

                service.editToken(token);
            }
        };
        var timelineWidget = new TimelineWidget($("#timelines")[0], tokenForm);
        timelineWidget.draw();

        return timelineWidget;
    }])
;
