const browserAppData = this.browser || this.chrome;
const tabs = {};
const inspectFile = 'inspect.js';
const activeIcon = 'active-64.png';
const defaultIcon = 'default-64.png';

const inspect = {
  toggleActivate: (id, type, icon) => {
    this.id = id;
    browserAppData.tabs.executeScript(id, { file: inspectFile }, () => { browserAppData.tabs.sendMessage(id, { action: type }); });
    browserAppData.browserAction.setIcon({ tabId: id, path: { 19: 'icons/' + icon } });
  }
};

function isSupportedProtocolAndFileType(urlString) {
  if (!urlString) { return false; }
  const supportedProtocols = ['https:', 'http:', 'file:'];
  const notSupportedFiles = ['xml', 'pdf', 'rss'];
  const extension = urlString.split('.').pop().split(/\#|\?/)[0];
  const url = document.createElement('a');
  url.href = urlString;
  return supportedProtocols.indexOf(url.protocol) !== -1 && notSupportedFiles.indexOf(extension) === -1;
}

function toggle(tab) {
  if (isSupportedProtocolAndFileType(tab.url)) {
    if (!tabs[tab.id]) {
      // tabs[tab.id] = Object.create(inspect);
      // inspect.toggleActivate(tab.id, 'activate', activeIcon);
        
      // check key exists
      chrome.storage.local.get(['key'], function(result) {
          // console.log('Value currently is ' + result.key);
          
          if(result.key != null){
              // activate
              tabs[tab.id] = Object.create(inspect);
              inspect.toggleActivate(tab.id, 'activate', activeIcon);
          }
          else{
              // get server input
              var server_url = prompt("Please enter your ZeuZ server address", "");

              // get user api key
              var api_key = prompt("Please enter your API key", "");

              if(server_url != null && api_key != null){
                  
                  //process the url
                  
                  var lastChar = server_url.substr(server_url.length - 1);
                  if(lastChar == "/"){
                      server_url = server_url.slice(0, -1);  // remove last char '/'
                  }
                  
                  if(server_url.startsWith("http") == false){
                      server_url = "http://" + server_url;  // add http:// in the beginning
                  }
                  
                  // save server url and api key
                  chrome.storage.local.set({key: server_url + "&#&" + api_key}, function() {
                    console.log('Value is set to ' + server_url + "&#&" + api_key);
                    alert("Logged in successfully!");
                  });
                
                  // activate plugin
                  tabs[tab.id] = Object.create(inspect);
                  inspect.toggleActivate(tab.id, 'activate', activeIcon);
              }
              else{
                  console.log("Sorry! Server and key cannot be empty.");
                  alert("Sorry! Server and api key cannot be empty.");
              }
              
          }
          
      });
        
        
    } else {
      // deactivate plugin
      inspect.toggleActivate(tab.id, 'deactivate', defaultIcon);
      for (const tabId in tabs) {
        if (tabId == tab.id) delete tabs[tabId];
      }
        
      // ask if user want to log out
      var r = confirm("Would you like to close the plugin and logout?");
      if (r == true) {
          // remove url and key
          chrome.storage.local.remove(['key'], function() {
            console.log("Logged in successfully!");
            alert("Logged out successfully!");
          });
      } else {
          console.log("Previous authentication info will be kept!");
      }
    }
  }
}

function deactivateItem(tab) {
  if (tab[0]) {
    if (isSupportedProtocolAndFileType(tab[0].url)) {
      for (const tabId in tabs) {
        if (tabId == tab[0].id) {
          delete tabs[tabId];
          inspect.toggleActivate(tab[0].id, 'deactivate', defaultIcon);
        }
      }
    }
  }
}

function getActiveTab() {
  browserAppData.tabs.query({ active: true, currentWindow: true }, tab => { deactivateItem(tab); });
}

browserAppData.commands.onCommand.addListener(command => {
  if (command === 'toggle-xpath') {
    browserAppData.tabs.query({ active: true, currentWindow: true }, tab => {
      toggle(tab[0]);
    });
  }
});

browserAppData.tabs.onUpdated.addListener(getActiveTab);
browserAppData.browserAction.onClicked.addListener(toggle);
