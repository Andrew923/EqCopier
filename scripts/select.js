// on first run, injects selection element so 
// that the css actually does something
var element = document.createElement("div");
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
    switch(message.name) {
        // receive message from background.js to crop image
        case "crop":
            // math to crop image when the image loads
            let img = document.createElement('img');
            img.src = message.data;
            img.addEventListener('load', function() {
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
                chrome.runtime.sendMessage({name: "POST", data: croppedUri});
            });
            break;
        // message from popup.js that button was clicked
        case "button":
            // jQuery to select window
            $(window)
            .on('mousedown', function($event) { 
                if (selected) { return; }
                isSelecting = true;
                $('#selection').removeClass('complete');
                start.x = $event.clientX;
                start.y = $event.clientY;
            }).on('mousemove', function($event) {
                if (selected) { return; }
                if (!isSelecting) { return; }
                end.x = $event.clientX;
                end.y = $event.clientY;
                //debugging purposes
                console.log("X: " + start.x + "-" + end.x + " Y: " + start.y + "-" + end.y);
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
                $('#selection').addClass('complete');
                selected = true;
                // send message to background.js to capture entire screen
                chrome.runtime.sendMessage({name: 'capture'});
            });
            break;
        // result 
        case "result":
            let latex = message.data;
            console.log(latex);
            alert(latex);
            break;
    }
    
});
