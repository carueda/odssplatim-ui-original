function TimelineWidget(container, tokenForm) {

    var self = this;

    self.tokenForm = tokenForm;

    var data = [];
    self.tokenInfos = [];
    var tokenInfos = self.tokenInfos;

    self.groups = {};
    var groups = self.groups;
    var nextPlatformId = 0;

    var oldSelectedIndex = -1;

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
        tokenInfos.length = 0;
        oldSelectedIndex = -1;
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

        if (tml.platform_id in groups) {
            console.log("addGroup: already added: " + JSON.stringify(tml));
            return;
        }

        //console.log("addGroup: adding " + JSON.stringify(tml));

        //!var id = tml.platform_id in groups ? groups[tml.platform_id].id : "plat_" + nextPlatformId++;

        var id = "plat_" + nextPlatformId++;

        groups[tml.platform_id] = {
            'tml': tml,
            'id' : id
        };

        var dummyTokenInfo = {
            'group'       : tml.platform_id
        };
        //console.log("adding dummyTokenInfo " + JSON.stringify(dummyTokenInfo));
        var index = tokenInfos.length;
        tokenInfos.push(dummyTokenInfo);
        pushBlockDummy(dummyTokenInfo);

        $(document).on("click", "#" +id, function() {
            platformClicked(tml.platform_id);
        });
    };

    function platformClicked(platform_id) {
        console.log("platformClicked= '" + platform_id + "'");
    }

    this.addToken = function(tokenInfo) {

        console.log("addToken: " + JSON.stringify(tokenInfo));

        var index = tokenInfos.length;
        tokenInfos.push(tokenInfo);
        pushBlock(tokenInfo, index);
        prepareHover();
    };

    this.redraw = function() {
        self.timeline.redraw();
    };


    function addAddListener() {
        /*
         * Gets info from the timeline generated element to create a new
         * TokenInfo entry; the addition here is actually cancelled and a
         * timed function is used to do the addition of the blocks
         * associated to the new token.
         */
        var onAdd = function(event) {
            var row = getSelectedRow();
            var element = data[row];
            console.log("onAdd: row=" +row+ " element=" +JSON.stringify(element));

            var platform_id = strip(element.group);

            var start = element.start.valueOf();
            var end   = element.end.  valueOf();

            /* initially, a 1-day length token. But commented out because the
             * default token length provided by timeline.js is good enough (ie.,
             * relative to the current visible range).
             */
//            var m = moment(start);
//            m.hours(0);
//            m.minutes(0);
//            m.seconds(0);
//            console.log("onAdd:     m =" + m.format());
//            start = m.toDate();
//            var dayMs = 24 * 60 * 60 * 1000;
//            end = new Date(start.valueOf() + dayMs);

            var index = tokenInfos.length;

            var tokenInfo = new TokenInfo({
                'platform_id'  : element.group,
                'start'     : start,
                'end'       : end,
                'state'     : "",
                'status'    : "status_new"
            });
            tokenInfos.push(tokenInfo);

            console.log("onAdd: pushed tokenInfo=" +JSON.stringify(tokenInfo));

            element.start = start;
            element.end   = end;
            element.content = tokenInfo.state;

            element.className = tokenInfo.status + " " + "block-body";
            element.tokenInfo =  {'kind': 'body', 'index': index};

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

            var index = element.tokenInfo.index;
            var kind  = element.tokenInfo.kind;
            var tokenInfo = tokenInfos[index];

            console.log("tokenInfo: " + JSON.stringify(tokenInfo));

            if (tokenInfo.status === "status_accepted") {
                cancelChange(index, tokenInfo, "Accepted token cannot be changed");
                return;
            }

            var bodyBlock  = data[index];

            console.log("bodyBlock:  " + JSON.stringify(bodyBlock));

            assert(kind === "body", "block kind must be body");

            tokenInfo.start = bodyBlock.start;
            tokenInfo.end   = bodyBlock.end;

            updateStatusModified(index, tokenInfo);

            prepareHover();
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
        console.log("modifed status set to: " + tokenInfo.status);
    }

    this.removeToken = function(tokenInfo, index, row) {
        delete tokenInfos[index];
        self.timeline.deleteItem(row);
        console.log("token at index " +index+ " removed");
    };


    function addEditListener() {
        var onEdit = function(event) {
            var row = getSelectedRow();
            var element = data[row];
            console.log("data[" + row + "] = " + JSON.stringify(element));

            var index = element.tokenInfo.index;
            var tokenInfo = tokenInfos[index];

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
                        }
                    }

                    tokenInfo.state = newTokenInfo.state;
                    tokenInfo.start = newTokenInfo.start;
                    tokenInfo.end   = newTokenInfo.end;

                    console.log("!! accept tokenInfo = " + JSON.stringify(tokenInfo));

                    pushBlock(tokenInfo, index, false);
                    prepareHover();
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
            if (oldSelectedIndex >= 0) {
                deselect(oldSelectedIndex);
                oldSelectedIndex = -1;
            }
            if (row) {
                console.log("onSelect (" +oldSelectedIndex+ "): " + JSON.stringify(data[row]));
                var newIndex = data[row].tokenInfo.index;
                var tokenInfo = tokenInfos[newIndex];
                console.log("tokenInfo = " + JSON.stringify(tokenInfo));
                select(newIndex);
                oldSelectedIndex = newIndex;
                self.timeline.selectItem(row);
            }
        };

        links.events.addListener(self.timeline, 'select', onSelect);
    }

    function addDeleteListener() {
        var onDelete = function(event) {
            var row = getSelectedRow();
            if (row) {
                console.log("onDelete: " + JSON.stringify(data[row]));
                var newIndex = data[row].tokenInfo.index;
                var tokenInfo = tokenInfos[newIndex];
                console.log("tokenInfo = " + JSON.stringify(tokenInfo));

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
        var tml = groups[platform_id].tml;
        var id  = groups[platform_id].id;
        var tooltip, color;
        if (tml === undefined) {
            // should not happen
            return "<div style='color: red'"
                 + " id='" +id+ "'>" + platform_id + "</div>";
        }
        else {
            tooltip = tml.platform_name;
            color = "green";
            return "<div style='color: green' title='" +tooltip+ "'"
                 + " id='" +id+ "'>" + platform_id + "</div>";
        }
    }

    function pushBlock(token, index, push) {

        var reallyPush = push === undefined || push;

        var start = token.start;
        var end   = token.end;

        var body = {
            'start':      parseDate(start),
            'end':        parseDate(end),

            'content':    token.state,
            'group':      formattedGroup(token.platform_id),
            'className':  token.status + " " + "block-body",
            'tokenInfo':  {'kind': 'body', 'index': index}
        };

        if (reallyPush) {
            data.push(body);
        }
        else {
            data[index] = body;
        }
    }

    function pushBlockDummy(tokenInfo) {
        var body = {
            'group': formattedGroup(tokenInfo.group)
        };
        data.push(body);
    }
}
