// datauri to blob to formdata
function getformData(dataURI) {
  const splitDataURI = dataURI.split(',')
  const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
  const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

  const ia = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++){
    ia[i] = byteString.charCodeAt(i)
  }
  var blob = new Blob([ia], { type: mimeString })
  const formData = new FormData();
  formData.append('file', blob, 'image.png');
  return formData
}
var tabId = -1;
// waiting to capture image
chrome.runtime.onMessage.addListener((message, sender, senderResponse) => {
  if (message.name === 'capture') {
    chrome.tabs.captureVisibleTab(null, {}, (dataUri) => {
      chrome.tabs.query({currentWindow: true, active : true},
        function(tabArray){
          tabId = tabArray[0].id;
          // send message back to select.js to crop image
          chrome.tabs.sendMessage(tabId, {name: 'crop', data: dataUri});
        });
    })
    return true;
  } 
  //message for post request to api
  else if (message.name === 'POST') {
    const uri = message.data;
    const formData = getformData(uri);
    fetch('http://44.206.243.86/predict/',
      {method:'POST', body: formData})
      .then(response => response.text())
      .then(result => {
        chrome.tabs.sendMessage(tabId, {name:'result', data: String(result).replaceAll('\\\\', '\\')} );
      })
      .catch(error => console.log('uh ohs: ', error));
  }
})