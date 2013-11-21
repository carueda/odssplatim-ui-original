function assert(value, desc) {
    if (!value) {
        perror("Assertion failed: " + desc);
    }
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

function tablify(obj, simple) {
    simple = simple === undefined || simple;

    function escape(s) {
        return s === undefined || s === null ? s :
                s.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }

    if (obj === null) {
        return null;
    }
    if (typeof obj === "string") {
        return escape(obj);
    }
    if (typeof obj === "function") {
        return "function";
    }
    if (typeof obj !== "object") {
        return escape(JSON.stringify(obj));
        //return obj;
    }

    var result = '<table>';  // assuming there are own properties

    var own = 0;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            own += 1;
            (function(key) {
                result +=
                    '<tr>' +
                    '<td style="vertical-align:middle">' +
                         '<b>' +key+ '</b>:' +
                    '</td>';

                if (!simple) {
                    result +=
                        '<td style="vertical-align:top; border:1pt solid #d9d9d9">' +
                        escape(JSON.stringify(obj[key])) +
                        '</td>';
                }
                result +=
                    '<td style="vertical-align:top; border:1pt solid #d9d9d9">' +
                    tablify(obj[key]) +
                    '</td>' +
                    '</tr>';
            })(key);
        }
    }
    if (own == 0) {
        // no own properties
        return escape(JSON.stringify(obj));
    }

    result += '</table>';
    return result;
}
