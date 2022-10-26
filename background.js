// waiting to capture image
chrome.runtime.onMessage.addListener((message, sender, senderResponse) => {
  if (message.name === 'capture') {
    chrome.tabs.captureVisibleTab(null, {}, (dataUri) => {
      chrome.tabs.query({currentWindow: true, active : true},
        function(tabArray){
          let tabId = tabArray[0].id;
          // send message back to select.js to crop image
          chrome.tabs.sendMessage(tabId, {name: 'crop', data: dataUri});
        });
    })
    return true;
  }
})