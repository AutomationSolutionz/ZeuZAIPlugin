document.forms[0].onsubmit = function(e) {
    e.preventDefault(); // Prevent submission
    var siblings = document.getElementById('siblings').value;
    chrome.runtime.getBackgroundPage(function(bgWindow) {
        bgWindow.setSiblings(siblings);
        window.close();     // Close dialog
    });
};


chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.message === "hi")
      sendResponse({message: "hi to you"});
  });


// get siblings from inspect.js
//chrome.storage.local.get(['siblings'], function (result) {
chrome.runtime.onMessage.addListener(
    
    var toAdd=document.getElementById('siblings');

    for(var i = 0, len = request.message.length;i<len;i++){
        var newLi = document.createElement('li');
        newLi.className = 'sibling';
        newLi.innerHTML = request.message[i];
        toAdd.appendChild(newLi);
    }
});