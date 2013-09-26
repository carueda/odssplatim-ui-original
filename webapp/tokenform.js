
function TokenForm(app) {

    var self = this;

    $(document).tooltip();

    $.datepicker.setDefaults({dateFormat: "yy-mm-dd"});

    var form         = $("#token-form"),
        state        = $("#token-state"),
        on_timeline  = $("#token-on_timeline"),

        start         = $("#token-start"),
        end           = $("#token-end"),

        editing       = { accept: undefined, cancel: undefined }
     ;

    var tokenInfo, index, row;

    start.datetimepicker({timeFormat: "HH:mm", numberOfMonths: 2});
    end.  datetimepicker({timeFormat: "HH:mm"});

    form.dialog({
        autoOpen: false,
        //height: 300,
        width: 500,
        modal: true,
        buttons: {
            Set:       acceptForm,
            Delete:    _deleteToken,
            Cancel:    cancelForm
        },
        close: function() {
            console.log("TokenForm close: editing=" +JSON.stringify(editing));
            if (editing.cancel !== undefined) {
                editing.cancel();
                editing.cancel = undefined;
            }

            editing.accept = undefined;
            editing.cancel = undefined;
            // allFields.val( "" ).removeClass( "ui-state-error" );
        }
    });

    function acceptForm() {
        console.log("acceptForm: editing=" +JSON.stringify(editing));

        var newTokenInfo = {
            'start':    start.val(),
            'end':      end.val(),
            'state':    state.val()
        };
        console.log("!! acceptForm: newTokenInfo=" +JSON.stringify(newTokenInfo));

        if (editing.accept !== undefined) {
            editing.accept(newTokenInfo);
            editing.accept = undefined;
        }
        form.dialog("close");
    }

    function _deleteToken() {
        console.log("_deleteToken index=" +index+ " row=" +row);
        app.deleteToken(tokenInfo, index, row);
        form.dialog("close");
    }

    function cancelForm() {
        console.log("cancelForm: editing=" +JSON.stringify(editing));
        if (editing.cancel !== undefined) {
            editing.cancel();
            editing.cancel = undefined;
        }
        form.dialog("close");
    }

    self.showForm = function(args) {

        console.log("TokenForm showForm: args=" + JSON.stringify(args));

        tokenInfo  = args.tokenInfo;
        index      = args.index;
        row        = args.row;

        editing.accept = args.accept;
        editing.cancel = args.cancel;

        console.log("TokenForm showForm: tokenInfo=" + JSON.stringify(tokenInfo));
        console.log("TokenForm showForm: editing=" + JSON.stringify(editing));

        form.css({visibility: "visible"});

        var readOnly = "status_accepted" === tokenInfo.status;

        form.find(':input').prop("readonly", readOnly);

        state.prop("disabled", readOnly);

        on_timeline.prop("readonly", true); // always readonly

        start.datetimepicker("option", "disabled", readOnly);
        end  .datetimepicker("option", "disabled", readOnly);

        state.val(tokenInfo.state);
        on_timeline.val(strip(tokenInfo.platform_name));

        start.val(unparseDate(tokenInfo.start));
        end  .val(unparseDate(tokenInfo.end));

        form.dialog("open");
    };

}
