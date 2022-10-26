let element = document.createElement("div");
element.id = "selection";
const body = document.querySelector("body");
body.insertAdjacentElement("beforeend", element);

async function copyImage(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    const item = new ClipboardItem({'image/png': blob});
    await navigator.clipboard.write([item])
}

var selected = false;
var start = {};
var end = {};
var isSelecting = false;

chrome.runtime.onMessage.addListener((message, sender, senderResponse) => {
    if (message.name === 'crop' && message.data) {
        img = document.createElement('img');
        img.onload = function() {
            var canvas = document.createElement('canvas');
            var WIDTH = Math.abs(start.x - end.x);
            var HEIGHT = Math.abs(start.y - end.y);
            canvas.width = WIDTH;
            canvas.height = HEIGHT;
            var context = canvas.getContext('2d');
            context.drawImage(img, start.x < end.x ? start.x : end.x,
                                start.y < end.y ? start.y : end.y, 
                                Math.abs(start.x - end.x), 
                                Math.abs(start.y - end.y), 0, 0, WIDTH, HEIGHT);
            var croppedUri = canvas.toDataURL('image/png');
            copyImage(croppedUri);
        };
        img.src = message.data;
    } 
    // else if (message.name === 'button') {
    //     $(window)
    //         .on('mousedown', function($event) {
    //             if (selected) { return; }
    //             body.onmousedown = "return false";
    //             body.onselectstart = "return false";
    //             isSelecting = true;
    //             $('#selection').removeClass('complete');
    //             start.x = $event.pageX;
    //             start.y = $event.pageY;
    //         }).on('mousemove', function($event) {
    //             if (!isSelecting) { return; }
    //             if (selected) { return; }
    //             end.x = $event.pageX;
    //             end.y = $event.pageY;
    //             width = Math.abs(start.x - end.x);
    //             height = Math.abs(start.y - end.y);
                
    //             $('#selection').css({
    //                 left: start.x < end.x ? start.x : end.x,
    //                 top: start.y < end.y ? start.y : end.y,
    //                 width: width,
    //                 height: height
    //             });
    //         }).on('mouseup', function($event) {
    //             if (selected) { return; }
    //             isSelecting = false;
    //             body.onmousedown = "return true";
    //             body.onselectstart = "return true";
    //             // make sure capture window isn't too small
    //             if (Math.abs($event.pageX - start.x) < 10 || Math.abs($event.pageY - start.y) < 10) {
    //                 $('#selection').css({
    //                     left: 0,
    //                     top: 0,
    //                     width: 0,
    //                     height: 0
    //                 });
    //             } else {
    //                 $('#selection').addClass('complete');
    //                 chrome.runtime.sendMessage({name: 'capture'}, (response) => {
    //                     if (response.success) {
    //                         console.log("Screenshot saved");
    //                     } else {
    //                         console.log("Could not save screenshot")
    //                     }
    //                 });
    //             }
    //     });
    //     selected = true;
    // }
});


chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
      if (port.name === "screenshot") {
        const command = msg.id;
        if (command === "button-click") {
            if (selected) {return;}
            $(window)
                .on('mousedown', function($event) {
                    body.onmousedown = "return false";
                    body.onselectstart = "return false";
                    isSelecting = true;
                    $('#selection').removeClass('complete');
                    start.x = $event.pageX;
                    start.y = $event.pageY;
                }).on('mousemove', function($event) {
                    if (!isSelecting) { return; }
                    end.x = $event.pageX;
                    end.y = $event.pageY;
                    width = Math.abs(start.x - end.x);
                    height = Math.abs(start.y - end.y);
                    
                    $('#selection').css({
                        left: start.x < end.x ? start.x : end.x,
                        top: start.y < end.y ? start.y : end.y,
                        width: width,
                        height: height
                    });
                }).on('mouseup', function($event) {
                    isSelecting = false;
                    body.onmousedown = "return true";
                    body.onselectstart = "return true";
                    // make sure capture window isn't too small
                    if (Math.abs($event.pageX - start.x) < 10 || Math.abs($event.pageY - start.y) < 10) {
                        $('#selection').css({
                            left: 0,
                            top: 0,
                            width: 0,
                            height: 0
                        });
                    } else {
                        $('#selection').addClass('complete');
                        chrome.runtime.sendMessage({name: 'capture'}, (response) => {
                            if (response.success) {
                                port.postMessage({success: true});
                                console.log("Screenshot saved");
                            } else {
                                console.log("Could not save screenshot")
                            }
                        });
                    }
            });
            selected = true;
        }
        
      }
    });
  });