/*
 * Adapted from example by https://github.com/auwnch:
 *  https://github.com/almende/chap-links-library/issues/132#issuecomment-25446810
 */
function DateHighlighter(timeline, holidays) {

    // JSON array of dates to apply a class to (such as shading or highlights).
    // The dates are strings in the format "yyyymmdd" (note - datepicker js equivalent: yymmdd).
    // Special case is "weekends" to trigger a class for all weekends.
    // To avoid conflicts, the order is important - the last one found found wins.
    var classesForDates = [
        {
            "date": "weekends",
            "divClass": "timeline-axis-grid-weekends"
        }
    ];

    //console.log("DateHighlighter: holidays=" + holidays);
    if (holidays !== undefined) {
        for (var ii = 0, ll = holidays.length; ii < ll; ii++) {
            classesForDates.push({
                "date":     holidays[ii],
                "divClass": "timeline-axis-grid-holiday"
            });
        }
    }

    function stringFromDate(date) {
        var mm = date.getMonth() + 1;
        var dd = date.getDate();
        return "" + date.getFullYear() + zeroPad(mm) + zeroPad(dd);
    }
    function zeroPad(num) {
        return ("00" + num).substring(("" + num).length);
    }
    // Create a map of dates for quick reference:
    var dateMap = {};
    var weekends = "";
    function dateMapOfClasses() {
        for (var j = 0; j < classesForDates.length; j++) {
            if (classesForDates[j].date == "weekends") {
                weekends = classesForDates[j].divClass;
            }
            else {
                dateMap[classesForDates[j].date] = classesForDates[j].divClass;
            }
        }
    }
    dateMapOfClasses();

    // External function to iterate through dates on the axis applying classes.
    // Because the width of the date can vary depending on zoom, the axis reuse
    // (as with labels, etc in ...StartOverwriting, etc) cannot be leveraged.
    // So each invocation clears and redraws the supplied range of dates.
    this.applyClassesToDates = function() {
        var start = timeline.screenToTime(0);
        var end = timeline.screenToTime(timeline.size.contentWidth);
        var axis = timeline.dom.axis;
        if (axis.classBlocks) {
            // Cleanup previous
            for (var num = 0; num < axis.classBlocks.length; num++) {
                var classBlock = axis.classBlocks[num];
                axis.frame.removeChild(classBlock);
            }
        }
        axis.classBlocks = [];
        if (isDayRange()) {
            // Get the start date and make it the start of the day
            var curDate = new Date(start.valueOf());
            curDate.setHours(0, 0, 0, 0);
            var cur = curDate.valueOf();
            var stop = end.valueOf();
            var curDay = start.getDay();
            var sat = 0;
            if (weekends != "") {
                sat = cur;
                // Advance sat to the first Saturday viewable
                if (curDay < 6) {
                    sat += (6 - curDay) * (1000 * 60 * 60 * 24);
                }
            }
            // Calculate the screen size of a day
            var x = Math.abs((stop - start.valueOf()) / (1000 * 60 * 60 * 24));
            var x2 = Math.round(timeline.size.contentWidth / x);
            var limit = 0;
            // Daily iteration
            while (limit < 1000 && cur < stop) {
                curDate = new Date(cur);
                var dateString = stringFromDate(curDate);
                if (cur == sat) {
                    x = timeline.timeToScreen(curDate);
                    repaintAxisDate(x, (x2 * 2), weekends);
                    // Jump to the next Saturday
                    sat += 7 * (1000 * 60 * 60 * 24);
                    limit++;
                }
                // Individual date can override weekends
                if (dateMap[dateString]) {
                    x = timeline.timeToScreen(curDate);
                    repaintAxisDate(x, x2, dateMap[dateString]);
                    limit++;
                }
                // Add to cur for the next day
                cur += 1 * (1000 * 60 * 60 * 24);
            }
        }
    };

    function repaintAxisDate(x, x2, className) {
        var sizes = timeline.size,
            frame = timeline.dom.axis.frame,
            classBlocks = timeline.dom.axis.classBlocks,
            block;
        // create a vertical block
        block = document.createElement("DIV");
        block.className = className;
        block.style.position = "absolute";
        block.style.width = x2 + "px";
        // add it to the frame and reference array
        frame.appendChild(block);
        classBlocks.push(block);
        // position it
        block.style.top = (timeline.options.axisOnTop ? sizes.axis.height : 0) + "px";
        block.style.height = sizes.contentHeight + "px";
        block.style.left = (x - sizes.axis.lineMinorWidth/2) + "px";
    }

    function isDayRange() {
        switch (timeline.step.scale) {
            case links.Timeline.StepDate.SCALE.WEEKDAY:
            case links.Timeline.StepDate.SCALE.DAY:
                return true;
            default:
                return false;
        }
    }

    links.events.addListener(timeline, 'rangechange', this.applyClassesToDates);

    this.destroy = function() {
        links.events.removeListener(timeline, 'rangechange', this.applyClassesToDates);
    };
}
