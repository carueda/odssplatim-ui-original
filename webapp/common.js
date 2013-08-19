function pushBlocks(tokenInfo, index, data) {

    // note: blocks always editable even for accepted tokens because the
    // widget restricts too much if we indicate editable=false.

    var start = {
        'start':      tokenInfo.early_start,
        'end':        tokenInfo.late_start,
        'content':    "", //"start",
        'group':      tokenInfo.group,
        'className':  tokenInfo.status + " " + "block-start",
        'tokenInfo':  {'kind': 'start', 'index': index}
    };

    var body = {
        'start':      tokenInfo.late_start,
        'end':        tokenInfo.early_end,
        'content':    tokenInfo.content,
        'group':      tokenInfo.group,
        'className':  tokenInfo.status + " " + "block-body",
        'tokenInfo':  {'kind': 'body', 'index': index}
    };

    var end = {
        'start':      tokenInfo.early_end,
        'end':        tokenInfo.late_end,
        'content':    "", //"end",
        'group':      tokenInfo.group,
        'className':  tokenInfo.status + " " + "block-end",
        'tokenInfo':  {'kind': 'end', 'index': index}
    };

    var background = {
        'start':      tokenInfo.early_start,
        'end':        tokenInfo.late_end,
        'content':    "",
        'group':      tokenInfo.group,
        'className':  'backgroud-block',
        'tokenInfo':  {'kind': 'background', 'index': index}
    };

    // push the 4 blocks associated to each token:
    data.push(background);
    data.push(start);
    data.push(body);
    data.push(end);
}

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
        $("#status").text(msg)
            .fadeIn(0).delay(2000).fadeOut(1000);
    }
    else {
        $("#status").text(msg).fadeIn(1000);
    }
}

function pprogress(msg) {
    if ( msg == undefined || msg == "") {
        $("#status").text("");
    }
    else {
        pstatus(msg, false);
    }
}

function perror(err) {
    pprogress();
    $("#error").text(err);
    if (err !== undefined && err !== "") {
        console.log(err);
    }
}

function success() {
    pprogress();
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
