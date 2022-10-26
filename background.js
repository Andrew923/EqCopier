// waiting to capture image then send to be cropped
chrome.runtime.onMessage.addListener((message, sender, senderResponse) => {
  if (message.name === 'capture') {
    chrome.tabs.captureVisibleTab(null, {format: "png"}, (dataUri) => {
      chrome.tabs.query({currentWindow: true, active : true},
        function(tabArray){
          let tabId = tabArray[0].id;
          chrome.tabs.sendMessage(tabId, {name: 'crop', data: dataUri});
        });
      senderResponse({success: true});
    })
    return true;
  }
})