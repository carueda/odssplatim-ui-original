function TimelineWidget(container, tokenForm) {

    var self = this;

    self.tokenForm = tokenForm;

    self.data = [];
    var data = self.data;

    self.groups = {};
    var groups = self.groups;

    var options = {
        'width':            '99%',
        'height':           'auto',
        'editable':         true,
        'style':            'box',
        'snapEvents':       false,
        'eventMargin':      8,
        'eventMarginAxis':  8,
        'showMajorLabels':  true,
        'showMinorLabels':  true,
        'axisOnTop':        true,
        'groupsChangeable': false,
        'showCustomTime':   false

//        // the following disables automatic scaling
//        ,'scale':            links.Timeline.StepDate.SCALE.WEEKDAY
//        ,'step':             1


        ,"min": new Date(2012, 0, 1)                // lower limit of visible range
        ,"max": new Date(2015, 11, 31)              // upper limit of visible range
//        ,"zoomMin": 1000 * 60 * 60 * 24             // one day in milliseconds
//        ,"zoomMax": 1000 * 60 * 60 * 24 * 31 * 3     // about three months in milliseconds


//        ,'cluster':          true
//        ,'groupsOnRight':    true
//        ,'showNavigation':   true
//        ,'showButtonNew':    true
    };

    if (options.showCustomTime) {
        // set the custom time to the current UTC time
        var offsetMins = moment().zone();
        setInterval(function() {
            var u = moment().add("m", offsetMins);
            self.timeline.setCustomTime(u.toDate());
            /*
             * NOTE: in timeline.js did adjustment for the tooltip:
             *  dom.customTime.title = moment().add("m", moment().zone()).format("[Current UTC time:] YYYY-MM-DD HH:mm:ss");
             */
        }, 2 * 1000);
    }

    this.timeline = new links.Timeline(container);

    addAddListener();
    addChangeListener();
    addEditListener();
    addResizeListener();
    addSelectListener();
    addDeleteListener();


    function getSelectedRow() {
        var row = undefined;
        var sel = self.timeline.getSelection();
        if (sel.length) {
            if (sel[0].row != undefined) {
                row = sel[0].row;
            }
        }
        return row;
    }


    this.reinit = function() {
        self.timeline.deleteAllItems();
        data.lenght = 0;
        groups.length = 0;
    };


    this.draw = function() {
        self.timeline.draw(data, options);
    };


    this.adjustVisibleChartRange = function() {
        self.timeline.setVisibleChartRangeAuto();
//        var dr = self.timeline.getDataRange();
//        console.log("adjustVisibleChartRange: dr = " + JSON.stringify(dr));
//        self.timeline.setVisibleChartRange(dr.start, dr.end, true);
    };

    this.getVisibleChartRange = function() {
        return self.timeline.getVisibleChartRange();
    };

    this.setVisibleChartRange = function(startDate, endDate) {
        if (startDate === undefined || endDate === undefined) {
            self.timeline.setVisibleChartRangeAuto();
            self.redraw();
        }
        else {
            self.timeline.setVisibleChartRange(startDate, endDate, true);
        }
    };

    this.addGroup = function(tml) {
        var platform_id = tml.platform_id;
        if (platform_id in groups) {
            console.log("addGroup: already added: " + platform_id);
            return;
        }

        groups[platform_id] = {
            'tml':    tml
        };

        pushBlockDummy(platform_id);

        $(document).on("click", "#" +platform_id, function() {
            platformClicked(platform_id);
        });
    };

    function platformClicked(platform_id) {
        var platform_name = groups[platform_id].tml.platform_name;

        console.log("platformClicked= '" + platform_id + "' " +
                "platform_name = '" + platform_name+ "'");
    }

    this.addToken = function(token) {

        console.log("addToken: " + JSON.stringify(token));

        var body = {
            'start':          parseDate(token.start),
            'end':            parseDate(token.end),
            'content':        token.state,
            'group':          formattedGroup(token.platform_id),
            'className':      token.status + " " + "block-body",

            'token_id':       token.id,
            'platform_id':    token.platform_id,
            'state':          token.state,
            'status':         token.status
        };

        console.log("!! addToken= " + JSON.stringify(body));

        data.push(body);
    };

    this.redraw = function() {
        self.timeline.redraw();
    };


    function addAddListener() {
        var onAdd = function(event) {
            var row = getSelectedRow();
            var element = data[row];

            console.log("ADD: row=" +row+ " element=" +JSON.stringify(element));
            console.log("ADD:       data len=" +data.length);

            element.platform_id   = strip(element.group);
            element.content       = "";  // to force missing info --skip save, etc
            element.state         = element.content;
            element.status        = "status_new";
            element.className     = element.status + " " + "block-body";

            console.log("ADD: element=" +JSON.stringify(element));

            self.redraw();
        };

        links.events.addListener(self.timeline, 'add', onAdd);
    }

    function addChangeListener() {

        function cancelChange(index, tokenInfo, msg) {
            pstatus(msg);

            self.timeline.cancelChange();

            var bodyBlock  = data[index];

            bodyBlock.start  = tokenInfo.start;
            bodyBlock.end    = tokenInfo.end;
        }

        function blockWidth(block) {
            return block.end - block.start;
        }


        var onChange = function(event) {
            var originalDiff, newDiff, diffDiff, delta;

            var row = getSelectedRow();
            var element = data[row];
            console.log("data[row] = " + JSON.stringify(element));
            if (element == undefined) {
                return;
            }

            var index = row;
            var tokenInfo = element;

            console.log("tokenInfo: " + JSON.stringify(tokenInfo));

            if (tokenInfo.status === "status_accepted") {
                cancelChange(index, tokenInfo, "Accepted token cannot be changed");
                return;
            }

            var bodyBlock  = data[index];

            console.log("bodyBlock:  " + JSON.stringify(bodyBlock));

            tokenInfo.start = bodyBlock.start;
            tokenInfo.end   = bodyBlock.end;

            updateStatusModified(index, tokenInfo);

            self.redraw();
        };

        links.events.addListener(self.timeline, 'change', onChange);
    }

    this.updateStatus = function(index, tokenInfo, status) {
        tokenInfo.status = status;

        var bodyBlock  = data[index];

        bodyBlock .className = "block-body"  + " " + status;

        self.timeline.redraw();
    };

    function updateStatusModified(index, tokenInfo) {
        if (tokenInfo.status === "status_new") {
            return;
        }
        else if (tokenInfo.status === "status_saved") {
            self.updateStatus(index, tokenInfo, "status_modified");
        }
        else if (tokenInfo.status.match(/.*_modified/)) {
            return;
        }
        else {
            self.updateStatus(index, tokenInfo, tokenInfo.status + "_modified");
        }
        console.log("modified status set to: " + tokenInfo.status);
    }

    this.removeToken = function(tokenInfo, index, row) {
        self.timeline.deleteItem(row);
        console.log("token at index " +index+ " removed");
    };


    function addEditListener() {
        var onEdit = function(event) {
            var row = getSelectedRow();
            var element = data[row];
            console.log("EDIT: " + row + ": " + JSON.stringify(element));

            var index = row;
            var tokenInfo = element;

            self.tokenForm.showForm({
                tokenInfo: tokenInfo,
                index:     index,
                row:       row,

                accept: function(newTokenInfo) {

                    if (tokenInfo.status === "status_saved") {
                        var modified =
                            tokenInfo.state !== newTokenInfo.state ||
                            tokenInfo.start !== newTokenInfo.start ||
                            tokenInfo.end   !== newTokenInfo.end;

                        if (modified) {
                            tokenInfo.status = "status_modified";
                            tokenInfo.className = "block-body"  + " " + tokenInfo.status;
                            //updateStatusModified(index, tokenInfo);
                        }
                    }

                    tokenInfo.content = newTokenInfo.state;
                    tokenInfo.state = newTokenInfo.state;
                    tokenInfo.start = parseDate(newTokenInfo.start);
                    tokenInfo.end   = parseDate(newTokenInfo.end);

                    console.log("!! accept tokenInfo = " + JSON.stringify(tokenInfo));

                    data[index] = tokenInfo;

                    self.redraw();

                },

                cancel: function() {
                    //self.timeline.deleteItem(index);
                }
            });


        };

        links.events.addListener(self.timeline, 'edit', onEdit);
    }


    function addSelectListener() {
        var onSelect = function(event) {
            var row = getSelectedRow();
            if (row) {
                console.log("SELECT: row=" + row + ": " + JSON.stringify(data[row]));
                self.timeline.selectItem(row);
            }
        };

        links.events.addListener(self.timeline, 'select', onSelect);
    }

    function addDeleteListener() {
        var onDelete = function(event) {
            var row = getSelectedRow();
            if (row) {
                console.log("DELETE: " + JSON.stringify(data[row]));
                var newIndex = row;

                self.timeline.cancelDelete();

                var ok = function() {
                    console.log("token removed (TODO)");
                };
                confirmDialog('Confirm token deletion', ok);
            }
        };

        links.events.addListener(self.timeline, 'delete', onDelete);
    }

    function addResizeListener() {
        $(window).bind('resize', function() {
            self.timeline.redraw();
        });
    }



    function select(index) {
        // nothing to do.
    }

    function deselect(index) {
        // nothing to do.
    }

    function formattedGroup(platform_id) {
        platform_id = strip(platform_id);
        var platform_name = groups[platform_id].tml.platform_name;

        var tooltip = platform_name + " (id=" + platform_id + ")";
        return "<div style='color: green' title='" +tooltip+ "'"
             + " id='" +platform_id+ "'>" + platform_name + "</div>";
    }

    function pushBlockDummy(platform_id) {
        var body = {
            'group': formattedGroup(platform_id)
        };
        data.push(body);
    }
}
