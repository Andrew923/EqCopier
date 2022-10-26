// on first run, injects selection element so 
// that the css actually does something
let element = document.createElement("div");
element.id = "selection";
const body = document.querySelector("body");
body.insertAdjacentElement("beforeend", element);

// function for copying image to clipboard given url
async function copyImage(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    const item = new ClipboardItem({'image/png': blob});
    await navigator.clipboard.write([item]);   
}

var selected = false;
var start = {};
var end = {};
var isSelecting = false;

// message listener
chrome.runtime.onMessage.addListener((message, sender, senderResponse) => {
    // receive message from background.js to crop image
    if (message.name === 'crop' && message.data) {
        img = document.createElement('img');
        // math to crop image when the image loads
        img.onload = function() {
            var canvas = document.createElement('canvas');
            var WIDTH = Math.abs(start.x - end.x);
            var HEIGHT = Math.abs(start.y - end.y);
            canvas.width = WIDTH;
            canvas.height = HEIGHT;
            var context = canvas.getContext('2d');
            context.drawImage(img, start.x < end.x ? start.x : end.x,
                                start.y < end.y ? start.y : end.y, 
                                WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
            var croppedUri = canvas.toDataURL('image/png');
            copyImage(croppedUri);
        };
        img.src = message.data;
    }
    // message from popup.js that button was clicked
    else if (message.name === 'button') {
        if (selected) { return; }
        // jQuery to select window
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
                    // send message to background.js to capture entire screen
                    chrome.runtime.sendMessage({name: 'capture'});
                }
        });
        selected = true;
    }
});
