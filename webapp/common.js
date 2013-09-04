function strip(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent||tmp.innerText;
}


function parseDate(str) {
    var m = moment(str);
    return m.toDate();
}

function unparseDate(date) {
    if (date === undefined) {
        return undefined;
    }
    var m = moment(date);
    var f = m.format("YYYY-MM-DD HH:mm");
    //console.log("unparseDate " + date+ " => " + f);
    return f;
}

function prepareHover() {
//    console.log("prepareHover");
//    $(".timeline-event-range").hover(
//        function () {
//            var domEl = $(this).get(0);
//            var className = "block-selected";
//            links.Timeline.addClassName(domEl, className);
//            //$(this).addClass("block-selected");
//        },
//        function () {
//            var domEl = $(this).get(0);
//            var className = "block-selected";
//            links.Timeline.removeClassName(domEl, className);
//            //$(this).removeClass("block-selected");
//        }
//    );
}

function pstatus(msg, autohide) {
    if ( msg == undefined || msg === "") {
        $("#status").text("");
    }
    else if (autohide == undefined || autohide == true) {
        $("#status").stop(true, true).text(msg)
            .fadeIn(0).delay(2000).fadeOut(1000);
    }
    else {
        $("#status").text(msg).fadeIn(1000);
    }
}

function pprogress(msg) {
    pstatus(msg);
//    if ( msg == undefined || msg == "") {
//        $("#status").text("");
//    }
//    else {
//        pstatus(msg, false);
//    }
}

function perror(err) {
    pprogress();
    $("#error").text(err);
    if (err !== undefined && err !== "") {
        console.log(err);
    }
}

function success() {
    //pprogress();
    $("#error").text("");
}


// adapted from http://jsfiddle.net/didierg/znq9M/
function confirmDialog(message, onOK, onCancel) {
    $('<div>' + message + '</div>').dialog({
        modal: true,
        title: "Confirm",
        buttons : {
            "OK" : function() {
                $(this).dialog("close");
                if (onOK && $.isFunction(onOK)) {
                    onOK();
                }
                $(this).dialog("destroy");
            },
            "Cancel" : function() {
                $(this).dialog("close");
                if (onCancel && $.isFunction(onCancel)) {
                    onCancel();
                }
                $(this).dialog("destroy");
            }
        }
    });

}

function messageDialog(message, opts) {
    var opts = opts || {};
    $('<div>' + message + '</div>').dialog({
        modal: true,
        title: opts.title || "",
        buttons : {
            "OK" : function() {
                if (opts.onOK && $.isFunction(opts.onOK)) {
                    opts.onOK();
                }
                $(this).dialog("close");
                $(this).dialog("destroy");
            }
        }
    });
}
