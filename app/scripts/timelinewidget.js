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


    this.reinit = function(holidays) {
        self.timeline.deleteAllItems();
        data.lenght = 0;
        groups = {};
        if (self.dc !== undefined) {
            self.dc.destroy();
        }
        self.dc = new DateHighlighter(this.timeline, holidays)
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
        updateDateHighlights();
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
        //var platform_name = groups[platform_id].tml.platform_name;
        //console.log("platformClicked= '" + platform_id + "' " + "platform_name = '" + platform_name+ "'");
        $("#logarea").html(tablify(groups[platform_id].tml));
    }

    this.addToken = function(token) {

        //console.log("addToken: " + JSON.stringify(token));

        var body = {
            'token_id':       token.id,
            'platform_id':    token.platform_id,
            'platform_name':  token.platform_name,
            'state':          token.state,
            'description':    token.description,
            'start':          parseDate(token.start),
            'end':            parseDate(token.end),
            'content':        getTokenContent(token),
            'group':          formattedGroup(token.platform_id),
            'className':      token.status + " " + "block-body",

            'status':         token.status
        };

        //console.log("addToken: body= " + JSON.stringify(body));

        data.push(body);
    };

    this.redraw = function() {
        self.timeline.redraw();
        updateDateHighlights();
    };

    var updateDateHighlights = function() {
        if (self.dc !== undefined) {
            self.dc.applyClassesToDates();
        }
    };


    function addAddListener() {
        var onAdd = function(event) {
            var row = getSelectedRow();
            var element = data[row];

            console.log("ADD: row=" +row+ " element=" +JSON.stringify(element));

            /*
             * too bad groups in links's timeline cannot be associated with
             * properties or other elements in a flexible way; have to resort
             * to capture elements in the html snippet.
             */
            element.platform_id   = element.group.match(/id='(.*)'/)[1];
            element.platform_name = strip(element.group);

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

            var bodyBlock  = data[index];

            //console.log("bodyBlock:  " + JSON.stringify(bodyBlock));

            tokenInfo.start = bodyBlock.start;
            tokenInfo.end   = bodyBlock.end;

            self.updateStatusModified(index, tokenInfo);

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

    self.updateStatusModified = function(index, tokenInfo) {
        if (tokenInfo === undefined) {
            tokenInfo = data[index];
        }
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
    };

    this.removeToken = function(tokenInfo, index, row) {
        self.timeline.deleteItem(row);
        console.log("token at index " +index+ " removed");
    };


    function addEditListener() {
        var onEdit = function(event) {
            var row = getSelectedRow();
            var element = data[row];
            console.log("EDIT: " + row + ": " + JSON.stringify(element));

            self.tokenForm.showForm({
                tokenInfo: element,
                row:       row
            });
        };

        links.events.addListener(self.timeline, 'edit', onEdit);
    }


    function addSelectListener() {
        var onSelect = function(event) {
            var row = getSelectedRow();
            if (row) {
                var element = data[row];

                $("#logarea").html(tablify(element));

                console.log("SELECT: row=" + row + ": " + JSON.stringify(element));
                self.timeline.selectItem(row);
            }
            else {
                $("#logarea").html("");
            }
        };

        links.events.addListener(self.timeline, 'select', onSelect);
    }

    function addResizeListener() {
        $(window).bind('resize', function() {
            self.timeline.redraw();
        });
    }

    function formattedGroup(platform_id) {
        platform_id = strip(platform_id);
        var platform_name = groups[platform_id].tml.platform_name;

        // no tooltip for now
        return "<div id='" +platform_id+ "'>" + platform_name + "</div>";

//        var tooltip = tablify(groups[platform_id].tml);
//        return "<div title='" +tooltip+ "'"
//             + " id='" +platform_id+ "'>" + platform_name + "</div>";
    }

    function pushBlockDummy(platform_id) {
        var body = {
            'group': formattedGroup(platform_id)
        };
        data.push(body);
    }

    function getTokenContent(token) {

        return token.state;

//        var tooltip = tablify(token);
//        //console.log("tootip = " + tooltip);
//        var content = "<div title='" +tooltip+ "'>" +token.state+ "</div>";
//        return content;
    }

}