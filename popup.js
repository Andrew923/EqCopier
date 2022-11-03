// wait for popup to load
document.addEventListener('DOMContentLoaded', function () {
    // get id of current tab
    chrome.tabs.query({ currentWindow: true, active: true },function (tabs) {
        let tabId = tabs[0].id;
        
        // these are injected in manifest now, but might want to change back to here
        // so that selecting text isn't bugged

        //inject selecting script
        // chrome.scripting.executeScript({
        //     target: {tabId: tabId},
        //     files: ['scripts/select.js'],
        // },(injectionResults) => {
        //     for (const frameResult of injectionResults)
        //     console.log('Frame Title: ' + frameResult.result);
        // });
        // inject selecting css
        // chrome.scripting.insertCSS({
        // files: ['select.css'],
        // target: {tabId: tabId}
        // });
        
        // listen for button click
        const button = document.getElementById('button-ss');
        button.addEventListener('click', function () {
            // send a message to the tab under the name 'button'
            chrome.tabs.sendMessage(tabId, {name: 'button'});
        });

        const copyButton = document.getElementById('button-copy');
        copyButton.addEventListener('click', function () {
            text = document.getElementById("output");
            text.select();
            navigator.clipboard.writeText(text.value);
        });
    });
});