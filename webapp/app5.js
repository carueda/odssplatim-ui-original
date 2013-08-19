$(document).ready(function() {

    var tt = {};
    tt.startDate = undefined;
    tt.endDate = undefined;

    var periods = {};

    function getPeriods() { return periods; }

    var tokenForm  = new TokenForm(deleteToken);

    var timelineWidget = new TimelineWidget($("#timelines")[0], tokenForm);

    var periodForm = new PeriodForm(getPeriods, timelineWidget);
    var platformForm = new PlatformForm(getAllPlatforms, refresh, timelineWidget);


    $("#selectPeriod").click(function() {
        periodForm.showForm();
    });

    $("#showPlatformForm").click(function() {
        platformForm.showForm();
    });

    $("#refresh").click(function() {
        refresh();
    });

    refresh();

    function refresh() {
        console.log("refreshing...");
        pprogress("refreshing...");
        refreshPeriods();
    }

    function refreshPeriods() {
        console.log("Calling url = " + odssplatimConfig.rest + "/periods");
        $.ajax({
            url:       odssplatimConfig.rest + "/periods",
            type:      "GET",
            dataType:  "json",
            data:      {},

            success: function(res) {
                success();
                gotPeriods(res);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                perror("error: " + thrownError);
            }
        });
    }

    function gotPeriods(res) {
        periods = res;
        console.log("gotPeriods: " + JSON.stringify(periods));
        refreshTimelines({ /*pending req*/ });
    }

    function setVisibleChartRange(start, end) {
        console.log("setVisibleChartRange: start=" +start+ " end=" + end);
        if (start === undefined || end === undefined) {
            timelineWidget.adjustVisibleChartRange();
        }
        else {
            timelineWidget.setVisibleChartRange(moment(start).add("d", -1),
                                                moment(end).  add("d", +1));
        }
    }


    function refreshTimelines(req) {
        $.ajax({
            url:       odssplatimConfig.rest + "/timelines",
            type:      "GET",
            dataType:  "json",
            data:       req,

            success: function(res) {
                success();
                gotTimelines(req, res);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                perror("error: " + thrownError);
            }
        });
    }


    function gotTimelines(req, res) {

        console.log("gotTimelines = " + JSON.stringify(res));

        initTimelines(req, res);
        putGroups();
        putTokens();
        drawTimelineWidget();
        setVisibleChartRange();
    }

    function initTimelines(req, res) {
        console.log("initTimelines: " + JSON.stringify(res));

        tt.timelines = [];
        for (var s = 0; s < res.length; s++) {
            var tml = {
                platform_id:   res[s].id,
                platform_name: res[s].name
            };
            tt.timelines.push(tml);
            timelineWidget.addGroup(tml);
        }
        timelineWidget.reinit();
    }

    function putGroups() {
        console.log("putGroups: " + JSON.stringify(tt.timelines));

        for (var s = 0; s < tt.timelines.length; s++) {
            var tml = tt.timelines[s];
            console.log("addGroup: " + JSON.stringify(tml));

            timelineWidget.addGroup(tml);
        }
    }

    function putTokens() {
        for (var s = 0; s < tt.timelines.length; s++) {
            getTokens(tt.timelines[s].platform_id);
        }
    }

    function getTokens(platform_id) {
//        console.log("getting tokens for " + platform_id);
        pprogress("getting tokens for " + platform_id);
        $.ajax({
            url:       odssplatimConfig.rest + "/timelines/" + platform_id,
            type:      "GET",
            dataType:  "json",
            data:      {},

            success: function(res) {
                success();
                gotTokens(platform_id, res);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                perror("error: " + thrownError);
            }
        });
    }

    function gotTokens(platform_id, tokens) {
        if (tokens.length == 0) {
            return;
        }
        console.log("got tokens for " + platform_id + ": " + JSON.stringify(tokens));

        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            token.status = "status_saved";
            timelineWidget.addToken(token);
        }

        setVisibleChartRange();
        timelineWidget.redraw();
    }

    function drawTimelineWidget() {
        timelineWidget.draw();
    }


    /////////////////////////////////////////////////////////////////////////


    $(document).ajaxError(function(event, request, settings) {
        perror("Error requesting page " + settings.url + ". Try again later.");
    });

    $("#save").click(function() {
        var tokenInfos = timelineWidget.tokenInfos;
        var skipped = 0;
        for (var index = 0; index < tokenInfos.length; index++) {
            var tokenInfo = tokenInfos[index];
            if (isNewOrModifiedToken(tokenInfo)) {
                if (isOkToBeSaved(tokenInfo)) {
                    saveToken(tokenInfo, index);
                }
                else {
                    skipped += 1;
                }
            }
        }
        if (skipped > 0) {
            var msg = skipped + " token(s) skipped because of missing info";
            console.log(msg);
            pstatus(msg);
        }
    });

    function isNewOrModifiedToken(tokenInfo) {
        var res = tokenInfo.status !== undefined &&
                 (tokenInfo.status === "status_new" ||
                  tokenInfo.status.indexOf("_modified") >= 0);
        return res;
    }

    function isOkToBeSaved(tokenInfo) {
        var res = tokenInfo.status !== undefined &&
                  tokenInfo.state !== undefined &&
                  tokenInfo.state.trim() !== "";
        return res;
    }

    function saveToken(tokenInfo, index) {

        console.log("saveToken: tokenInfo=" + JSON.stringify(tokenInfo));

        var item = {
            id:      tokenInfo.id,
            platform_id: strip(tokenInfo.platform_id),
            start:    unparseDate(tokenInfo.start),
            end:      unparseDate(tokenInfo.end),
            state:    tokenInfo.state
        };

        if (item.id !== undefined) {
            // update existing token:
            console.log("saveToken: updating token " + JSON.stringify(item));
            pprogress("saving update to token ...");

            $.ajax({
                url:       odssplatimConfig.rest + "/tokens",
                type:      "PUT",
                dataType:  "json",
                data:       item,

                success: function(res) {
                    success();
                    console.log("PUT token response " + JSON.stringify(res));
                    timelineWidget.updateStatus(index, tokenInfo, "status_saved");
                    console.log("token updated " + JSON.stringify(tokenInfo));
                    //refresh();
                },

                error: function (xhr, ajaxOptions, thrownError) {
                    perror("error: " + thrownError);
                }
            }).always(function() {
                pprogress();
            });
        }
        else {
            // add new token
            console.log("saveToken: posting new token " + JSON.stringify(item));
            pprogress("saving new token ...");

            $.ajax({
                url:         odssplatimConfig.rest + "/tokens",
                type:        "POST",
                dataType:    "json",
                contentType: "application/json",
                data:        JSON.stringify(item),

                success: function(data) {
                    success();
                    console.log("POST token response " + JSON.stringify(data));
                    tokenInfo.id = data.id;
                    timelineWidget.updateStatus(index, tokenInfo, "status_saved");
                    console.log("token posted " + JSON.stringify(tokenInfo));
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    perror("error: " + thrownError);
                }
            }).always(function() {
                pprogress();
            });
        }
    }

    function deleteToken(tokenInfo, index, row) {

        console.log("deleteToken: tokenInfo=" + JSON.stringify(tokenInfo));

        confirmDialog(
            "Remove token from the timeline" +
                "<br />" +
                "for platform: '" +tokenInfo.platform_id + "'?" +
                "<br />" +
                "<br />(It will also be deleted from the database)",

            function() {
                // removal confirmed.

                if (tokenInfo.id === undefined) {
                    // just remove block from timeline:
                    timelineWidget.removeToken(tokenInfo, index, row);
                    return;
                }

                // token exists in the db.
                console.log("deleteToken: id = " + tokenInfo.id);
                pprogress("deleting token ...");

                $.ajax({
                    url:       odssplatimConfig.rest + "/tokens/" + tokenInfo.id,
                    type:      "DELETE",
                    dataType:  "json",

                    success: function(res) {
                        success();
                        console.log("DELETE token response " + JSON.stringify(res));
                        timelineWidget.removeToken(tokenInfo, index, row);
                    },

                    error: function (xhr, ajaxOptions, thrownError) {
                        perror("error: " + thrownError);
                    }
                }).always(function() {
                    pprogress();
                });
            }
        );
    }


    function getAllPlatforms() {
        pstatus("Retrieving platforms...");
        $.ajax({
            url:       odssplatimConfig.rest + "/platforms",
            type:      "GET",
            dataType:  "json",

            success: function(res) {
                success();
                console.log("getAllPlatforms: " + JSON.stringify(res));
                gotPlatforms(res);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                perror("error: " + thrownError);
            }
        });
    }

    function gotPlatforms(res) {
        console.log("gotPlatforms: " + JSON.stringify(res));
        for (var s = 0; s < res.length; s++) {
            var elm = res[s];
            var tml = {
                platform_id:     elm.id,
                platform_name:   elm.name
            };
            timelineWidget.addGroup(tml);
            timelineWidget.redraw();
        }
    }

});


function TokenInfo(obj) {
    var self = this;
    var defaults = {
        'id'           : undefined,
        'platform_id'   : undefined,
        'start'         : undefined,
        'end'           : undefined,
        'state'         : undefined,
        'status'        : "status_new"
    };
    jQuery.extend(self, defaults, obj);
}
