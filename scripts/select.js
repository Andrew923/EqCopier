// on first run, injects selection element so 
// that the css actually does something
let element = document.createElement("div");
element.id = "selection";
const body = document.querySelector("body");
body.insertAdjacentElement("beforeend", element);

// function for copying image to clipboard given url
async function copyImage(url) {
    var response = await fetch(url);
    var blob = await response.blob();
    var item = new ClipboardItem({'image/png': blob});
    await navigator.clipboard.write([item]);   
}

// selection variables
var selected = false;
var start = {};
var end = {};
var isSelecting = false;

// message listener
chrome.runtime.onMessage.addListener((message, sender, senderResponse) => {
    // receive message from background.js to crop image
    if (message.name === 'crop') {
        // math to crop image when the image loads
        let img = document.createElement('img');
        img.src = message.data;
        img.addEventListener('load', function() {
            const canvas = document.createElement('canvas');
            const WIDTH = Math.abs(start.x - end.x);
            const HEIGHT = Math.abs(start.y - end.y);
            canvas.width = WIDTH;
            canvas.height = HEIGHT;
            const context = canvas.getContext('2d');
            context.drawImage(img, start.x < end.x ? start.x : end.x,
                                start.y < end.y ? start.y : end.y, 
                                WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
            const croppedUri = canvas.toDataURL('image/png');
            copyImage(croppedUri);
        });
    }
    // message from popup.js that button was clicked
    else if (message.name === 'button') {
        // jQuery to select window
        $(window)
            .on('mousedown', function($event) { 
                if (selected) { return; }
                body.onmousedown = "return false";
                body.onselectstart = "return false";
                isSelecting = true;
                $('#selection').removeClass('complete');
                start.x = $event.pageX;
                start.y = $event.pageY;
            }).on('mousemove', function($event) {
                if (selected) { return; }
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
            }).one('mouseup', function($event) {
                if (selected) { return; }
                isSelecting = false;
                body.onmousedown = "return true";
                body.onselectstart = "return true";
                // make sure capture window isn't too small
                if (Math.abs($event.pageX - start.x) < 5 || Math.abs($event.pageY - start.y) < 5) {
                    console.log("Capture window too small");
                    $('#selection').css({
                        left: 0,
                        top: 0,
                        width: 0,
                        height: 0
                    });
                } else {
                    $('#selection').addClass('complete');
                    selected = true;
                    // send message to background.js to capture entire screen
                    chrome.runtime.sendMessage({name: 'capture'});
                }
        });   
    }
});
