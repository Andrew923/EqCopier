document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ currentWindow: true, active: true },function (tabs) {
        let tabId = tabs[0].id;
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ['scripts/select.js'],
        },(injectionResults) => {
            for (const frameResult of injectionResults)
            console.log('Frame Title: ' + frameResult.result);
        });

        chrome.scripting.insertCSS({
        files: ['select.css'],
        target: {tabId: tabId}
        });

        const button = document.getElementById('button-ss');
        button.addEventListener('click', function () {
            // chrome.tabs.sendMessage(tabId, {name: 'button'});
            const port = chrome.tabs.connect(tabId, {name: "screenshot"});
            port.postMessage({id: "button-click"});
            port.onMessage.addListener(function (msg) {
                if (msg.success) {
                    alert('woohoo!');
                } else {
                    alert('boohoo :(');
                }
            });
        });
    });
});