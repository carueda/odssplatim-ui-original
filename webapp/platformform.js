
function PlatformForm(app) {

    var self = this;

    $(document).tooltip();

    var $form               = $("#platform-form"),
        $newPlatformSection = $("#newPlatformSection"),
        $platformField      = $("#platformField"),
        $showAllPlatforms   = $("#showAllPlatforms")
    ;



    $showAllPlatforms.change(function() {
        var v = $showAllPlatforms.is(":checked");
        console.log("$showAllPlatforms.val() = " + JSON.stringify(v));
        if (v) {
            app.getAllPlatforms();
        }
        else {
            // TODO
            app.refresh();
        }
        $form.dialog("close");
    });

    $form.dialog({
        autoOpen: false,
        //height: 300,
        width: 450,
        modal: true,
        buttons: {
            //Add:      addPlatform,
            //Delete:   deletePlatform,
            Cancel:   function() {$form.dialog("close");}
        }
    });

    function addPlatform() {
        var platform_id = $platformField.val();
        if (platform_id.trim() === "") {
            pstatus("Platform ID missing");
            return;
        }
        var platformInfo = {
            'id':     platform_id,
            'name':    platform_id     // same as ID for the moment
        };

        console.log("addPlatform: " +JSON.stringify(platformInfo));
        pstatus("saving new platform '" +platform_id+ "'");

        $.ajax({
            url:      odssplatimConfig.rest + "/platforms",
            type:     "POST",
            dataType: "json",
            data:     platformInfo,

            success: function(res) {
                success();
                $platformField.val("");
                console.log("POST platform response " + JSON.stringify(res));

                app.timelineWidget.addGroup({platform_id: platform_id});
                app.timelineWidget.redraw();
                $form.dialog("close");
                pstatus("new platform '" +platform_id+ "' added");
            },

            error: function (xhr, ajaxOptions, thrownError) {
                perror("error: " + thrownError);
            }
        }).always(function() {
            pprogress();
        });
    }

    function deletePlatform() {
        /*
         * NOTE: We just remove the platform from the platform collection,
         * but for simplicity in this prototype NO removal of associated
         * tokens or any other validation is performed.
         */

        var platform_id = $platformField.val();
        if (platform_id.trim() === "") {
            pstatus("Platform ID missing");
            return;
        }

        confirmDialog(
            "Remove platform '" + platform_id + "' from the database?" +
            "<br/>" +
            "<br/>" +
            "We just remove the platform from the platform collection, " +
            "but for simplicity in this prototype NO removal of associated " +
            "tokens or any other validation is performed. "
             ,

            function() {
                // removal confirmed.
                console.log("deletePlatform: '" +platform_id+ "'");
                pstatus("deleting platform '" +platform_id+ "'");

                $.ajax({
                    url:      odssplatimConfig.rest + "/platforms/" + platform_id,
                    type:     "DELETE",
                    dataType: "json",

                    success: function(res) {
                        success();
                        $platformField.val("");
                        var response = JSON.stringify(res);
                        console.log("Server response: " + response);
                        var ok = function() {
                            $form.dialog("close");
                            pstatus("platform '" +platform_id+ "' deleted");
                            app.refresh();
                        };
                        messageDialog(response, {title: "Server response", onOK: ok});
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

    self.showForm = function() {

        //$newPlatformSection.hide();

        console.log("PlatformForm showForm");

        $form.css({visibility: "visible"});

        var readOnly = false; // TODO

        $form.find(':input').prop("readonly", readOnly);

        $form.dialog("open");
    };


}
