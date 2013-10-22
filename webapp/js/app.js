$(document).ready(function() {
    var self = this;
    //window.app = self;  // to facilitate debugging in browser
    var tt = {};
    tt.startDate = undefined;
    tt.endDate = undefined;

    var periods = {};

    self.defaultPeriodId = null;

    self.getPeriods = function() { return periods; };

    var tokenForm    = new TokenForm(self);
    var periodForm   = new PeriodForm(self);
    var platformForm = new PlatformForm(self);

    self.timelineWidget = new TimelineWidget($("#timelines")[0], tokenForm);
    var timelineWidget = self.timelineWidget;


    $("#selectPeriod").click(function() {
        periodForm.showForm();
    });

    $("#showPlatformForm").click(function() {
        platformForm.showForm();
    });

    $("#versions").click(function() {
        pstatus("versions not implemented yet");
    });

    $("#refresh").click(function() {
        self.refresh();
    });

    self.refresh = function() {
        perror();
        $("#logarea").html("");
        console.log("refreshing...");
        pprogress("refreshing...");
        timelineWidget.reinit();
        refreshPeriods();
    };

    self.refresh();

    function refreshPeriods() {
        console.log("Calling url = " + odssplatimConfig.rest + "/periods");
        $.ajax({
            url:       odssplatimConfig.rest + "/periods",
            type:      "GET",
            dataType:  "json",

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
        //console.log("gotPeriods: " + JSON.stringify(res));
        periods = {};
        _.each(res, function(per) {
            periods[per.id] = per;
        });
        //console.log("periods: " + JSON.stringify(periods));
        getDefaultPeriodId();
    }

    function getDefaultPeriodId() {
        console.log("Calling url = " + odssplatimConfig.rest + "/periods/default");
        $.ajax({
            url:       odssplatimConfig.rest + "/periods/default",
            type:      "GET",
            dataType:  "json",

            success: function(res) {
                success();
                gotDefaultPeriodId(res);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (xhr.status == 404) {
                    success();
                    gotDefaultPeriodId();
                }
                else {
                    perror("error: " + thrownError);
                }
            }
        });
    }

    function gotDefaultPeriodId(res) {
        //console.log("gotDefaultPeriodId: " + JSON.stringify(res));
        self.defaultPeriodId = res && res.defaultPeriodId;
        getHolidays();
    }

    function getHolidays() {
        console.log("Calling url = " + odssplatimConfig.rest + "/periods/holidays");
        $.ajax({
            url:       odssplatimConfig.rest + "/periods/holidays",
            type:      "GET",
            dataType:  "json",

            success: function(res) {
                success();
                gotHolidays(res);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (xhr.status == 404) {
                    success();
                    gotHolidays();
                }
                else {
                    perror("error: " + thrownError);
                }
            }
        });
    }

    function gotHolidays(res) {
        //console.log("gotHolidays: " + JSON.stringify(res));
        self.holidays = res && res.holidays;
        refreshTimelines({ /*pending req*/ });
    }

    function setVisibleChartRange() {

        //console.log("setVisibleChartRange: self.defaultPeriodId = '" + self.defaultPeriodId+ "'");
        var defaultPeriod = null;
        if (self.defaultPeriodId !== undefined) {
            defaultPeriod = periods[self.defaultPeriodId];
        }
        //console.log("defaultPeriod = " + JSON.stringify(defaultPeriod));

        if (defaultPeriod) {
            var start = defaultPeriod.start;
            var end   = defaultPeriod.end;
            timelineWidget.setVisibleChartRange(moment(start).add("d", -1),
                                                moment(end).  add("d", +1));
        }
        else {
            timelineWidget.adjustVisibleChartRange();
        }
    }


    function refreshTimelines(req) {
        console.log("Calling url = " + odssplatimConfig.rest + "/timelines");
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

        //console.log("gotTimelines = " + JSON.stringify(res));

        initTimelines(req, res);
        putTokens();
        drawTimelineWidget();
        setVisibleChartRange();
    }

    function initTimelines(req, res) {
        //console.log("initTimelines: " + JSON.stringify(res));

        timelineWidget.reinit(self.holidays);
        tt.timelines = [];
        _.each(res, function(elm) {
            var tml = _.extend({
                platform_id:   elm.id,
                platform_name: elm.name
            }, elm);
            tml = _.omit(tml, 'id', 'name');
            tt.timelines.push(tml);
            timelineWidget.addGroup(tml);
        });
    }

    function putTokens() {
        _.each(tt.timelines, function(timeline) {
            getTokens(timeline);
        });
    }

    function getTokens(tml) {
        var platform_id   = tml.platform_id;
        var platform_name = tml.platform_name;
        //console.log("getting tokens for " + platform_name + " (" +platform_id+ ")");
        pprogress("getting tokens for " + platform_name);
        $.ajax({
            url:       odssplatimConfig.rest + "/timelines/" + platform_id,
            type:      "GET",
            dataType:  "json",

            success: function(res) {
                success();
                gotTokens(tml, res);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                perror("error: " + thrownError);
            }
        });
    }

    function gotTokens(tml, tokens) {
        var platform_id   = tml.platform_id;
        var platform_name = tml.platform_name;

        if (tokens.length == 0) {
            return;
        }
        console.log("got tokens for " + platform_name + " (" +platform_id+ ")"
                  // + ": " + JSON.stringify(tokens)
        );

        _.each(tokens, function(token) {
            token.platform_name  = platform_name;
            token.status         = "status_saved";
            timelineWidget.addToken(token);
        });

        setVisibleChartRange();
        timelineWidget.redraw();
    }

    function drawTimelineWidget() {
        timelineWidget.draw();
    }


    /////////////////////////////////////////////////////////////////////////


//    $(document).ajaxError(function(event, request, settings) {
//        console.log("ajaxError: event    = " + JSON.stringify(event));
//        console.log("ajaxError: request  = " + JSON.stringify(request));
//        console.log("ajaxError: settings = " + JSON.stringify(settings));
//        perror("Error making request to " + settings.url + ". Try again later.");
//    });

    $("#save").click(function() {
        var elements = timelineWidget.data;
        console.log("SAVE: elements in timeline: " + elements.length);

        // message will be replaced is there is any actual element to be saved
        pprogress("No new or modified tokens to save");

        var skipped = 0;
        for (var index = 0; index < elements.length; index++) {
            var tokenInfo = elements[index];
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
            platform_id:   strip(tokenInfo.platform_id),
            start:         unparseDate(tokenInfo.start),
            end:           unparseDate(tokenInfo.end),
            state:         tokenInfo.state
        };

        if (tokenInfo.token_id !== undefined) {
            // update existing token:
            console.log("saveToken: updating token_id=" +tokenInfo.token_id+
                        ": " +JSON.stringify(item));
            pprogress("saving token update ...");

            $.ajax({
                url:         odssplatimConfig.rest + "/tokens/" + tokenInfo.token_id,
                type:        "PUT",
                dataType:    "json",
                contentType: "application/json",
                data:        JSON.stringify(item),

                success: function(res) {
                    success();
                    //console.log("PUT token response " + JSON.stringify(res));
                    timelineWidget.updateStatus(index, tokenInfo, "status_saved");
                    console.log("token updated " + JSON.stringify(tokenInfo));
                    //self.refresh();
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
                data:        item,

                success: function(data) {
                    success();
                    //console.log("POST token response " + JSON.stringify(data));
                    tokenInfo.token_id = data.id;
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

    self.deleteToken = function(tokenInfo, index, row) {

        //console.log("deleteToken: tokenInfo=" + JSON.stringify(tokenInfo));

        confirmDialog(
            "Remove token from the timeline" +
                "<br />" +
                "for platform: '" +tokenInfo.platform_id + "'?" +
                "<br />" +
                "<br />(It will also be deleted from the database)",

            function() {
                // removal confirmed.

                if (tokenInfo.token_id === undefined) {
                    // just remove block from timeline:
                    timelineWidget.removeToken(tokenInfo, index, row);
                    return;
                }

                // token exists in the db.
                //console.log("deleteToken: id = " + tokenInfo.token_id);
                pprogress("deleting token ...");

                $.ajax({
                    url:       odssplatimConfig.rest + "/tokens/" + tokenInfo.token_id,
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
    };


    self.getAllPlatforms = function() {
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
    };

    function gotPlatforms(res) {
        console.log("gotPlatforms: " + JSON.stringify(res));
        _.each(res, function(elm) {
            var tml = _.extend({
                platform_id:   elm.id,
                platform_name: elm.name
            }, elm);
            tml = _.omit(tml, 'id', 'name');
            timelineWidget.addGroup(tml);
            timelineWidget.redraw();
        });
    }

    // see http://stackoverflow.com/a/15734408/830737
    $(function () {
      $(document).tooltip({
          content: function () {
              return $(this).prop('title');
          }
      });
    });

});
