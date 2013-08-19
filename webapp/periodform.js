
function PeriodForm(getPeriods, timelineWidget) {

    var self = this;

    $(document).tooltip();

    $.datepicker.setDefaults({dateFormat: "yy-mm-dd"});

    var ALL_TOKENS = "All tokens";
    var CREATE     = "--Create new period--";

    var $form          = $("#period-form"),
        $start         = $("#period-start"),
        $end           = $("#period-end"),

        $periodSelection  = $("#periodSelection"),
        $newPeriodSection = $("#newPeriodSection"),
        $newPeriodField   = $("#newPeriodField"),

        periodsById   = {}
    ;

    function selectAllTokens() {
        $newPeriodSection.hide();
        $start.val("");
        $end  .val("");
        timelineWidget.setVisibleChartRange();
    }

    var applyPeriodSelection = function() {
        var id = $periodSelection.val();
        if (id == ALL_TOKENS) {
            selectAllTokens();
        }
        else if (id == CREATE) {
            $newPeriodSection.show();
            $newPeriodField.focus();

            // initialize with current visible range for mising field:
            var dr = timelineWidget.getVisibleChartRange();
            console.log("curr vis range: " +JSON.stringify(dr));
            if ($start.val().trim() === "") {
                $start.val(moment(dr.start).format("YYYY-MM-DD"));
            }
            if ($end.val().trim() === "") {
                $end.val(moment(dr.end).format("YYYY-MM-DD"));
            }
        }
        else {
            $newPeriodSection.hide();
            var per = periodsById[id];
            $start.val(per.start);
            $end  .val(per.end);
            timelineWidget.setVisibleChartRange(per.start, per.end);
        }
    };
    $periodSelection.change(  applyPeriodSelection);
    $periodSelection.keypress(applyPeriodSelection);

    $start.datetimepicker({timeFormat: "HH:mm", numberOfMonths: 2});
    $end.  datetimepicker({timeFormat: "HH:mm", numberOfMonths: 2});

    $form.dialog({
        autoOpen: false,
        //height: 300,
        width: 450,
        modal: true,
        buttons: {
            Save:      savePeriod,
            Delete:    deletePeriod,
            Cancel:    function() {$form.dialog("close");}
        }
    });

    function savePeriod() {
        var id = $periodSelection.val();
        if (id === ALL_TOKENS) {
            return;
        }

        var start = $start.val();
        var end   = $end.val();


        // It is an update or an addition.

        if (start.trim() === "" || end.trim() === "") {
            pstatus("Period start or end date missing");
            return;
        }

        var newPeriodInfo = {
            'start':    start,
            'end':      end
        };

        var type;

        if (id == CREATE) {
            // create new period.
            var name = $newPeriodField.val();
            if (name.trim() === "") {
                pstatus("Period name missing");
                return;
            }
            if (start.trim() === "" || end.trim() === "") {
                pstatus("Period start or end date missing");
                return;
            }

            newPeriodInfo.name = name;
            type = "POST";
            console.log("savePeriod: adding=" +JSON.stringify(newPeriodInfo));
            pstatus("saving new period '" +newPeriodInfo.name+ "'");
        }
        else {
            // update existing period.
            var periodInfo = periodsById[id];
            newPeriodInfo.id  = id;
            newPeriodInfo.name = periodInfo.name;

            type = "PUT";
            console.log("savePeriod: updating=" +JSON.stringify(newPeriodInfo));
            pstatus("updating period '" +newPeriodInfo.name+ "'");
        }

        // do POST or PUT as determined above:
        $.ajax({
            url:      odssplatimConfig.rest + "/periods",
            type:     type,
            dataType: "json",
            data:     newPeriodInfo,

            success: function(res) {
                success();
                console.log(type + " period response " + JSON.stringify(res));
                timelineWidget.setVisibleChartRange(start, end);
                if (type === "POST") {
                    // insert new element using returned id
                    // and select it in the dropdown list:
                    periodsById[res.id] = res;
                    populatePeriodSelection();
                    $periodSelection.val(res.id);
                }
                $periodSelection.focus();
                $newPeriodSection.hide();
            },

            error: function (xhr, ajaxOptions, thrownError) {
                perror("error: " + thrownError);
            }
        }).always(function() {
            pprogress();
        });
    }

    function deletePeriod() {
        var id = $periodSelection.val();
        if (id === ALL_TOKENS) {
            return;
        }

        var periodInfo = periodsById[id];
        console.log("deletePeriod id='" +id+ "': " + JSON.stringify(periodInfo));

        confirmDialog(
            "Remove period '" + periodInfo.name + "' from the database?",

            function() {
                // removal confirmed.
                console.log("delete period: id = " + id);
                pprogress("deleting period ...");

                $.ajax({
                    url:      odssplatimConfig.rest + "/periods/" + id,
                    type:     "DELETE",
                    dataType: "json",

                    success: function(res) {
                        success();
                        console.log("DELETE period response " + JSON.stringify(res));
                        delete periodsById[id];
                        populatePeriodSelection();
                        selectAllTokens();
                    },

                    error: function (xhr, ajaxOptions, thrownError) {
                        perror("error: " + thrownError);
                    }
                }).always(function() {
                    pprogress();
                    $periodSelection.focus();
                });
            }
        );
    }

    function populatePeriodSelection() {
        $periodSelection.empty();
        $periodSelection.append($("<option />").text(ALL_TOKENS));
        for (var id in periodsById) {
            var name = periodsById[id].name;
            $periodSelection.append($("<option />").val(id).text(name));
        }
        $periodSelection.append($("<option />").text(CREATE));
    }

    self.showForm = function() {

        $newPeriodSection.hide();

        var periods = getPeriods();
        for (var s = 0; s < periods.length; s++) {
            periodsById[periods[s].id] = {
                'name':   periods[s].name,
                'start':  periods[s].start,
                'end':    periods[s].end
            };
        }

        console.log("PeriodForm showForm: periodsById=" + JSON.stringify(periodsById));

        populatePeriodSelection();

        $form.css({visibility: "visible"});

        var readOnly = false; // TODO

        $form.find(':input').prop("readonly", readOnly);

        $start.datetimepicker("option", "disabled", readOnly);
        $end  .datetimepicker("option", "disabled", readOnly);

        $form.dialog("open");
    };

}
