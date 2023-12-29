// Incomming messages
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {

    if (request === "getUrl") {
      let thisSite = sender.tab.url.replace(/^.*\/\//, "").replace(/\/.*/, "");

      if (!/^www/.test(thisSite)) thisSite = "www." + thisSite;
      sendResponse({ url: thisSite });

    } else if (request === "backgroundRunning") {
      sendResponse(true);
    }
  }
);

// Shortcut (Alt + S by default)
chrome.commands.onCommand.addListener((command) => {
  chrome.storage.local.get((storage) => {
    const extensionOn = storage.power ? storage.power.status : true;

    if (extensionOn && command === 'focus-search-bar') {
      // Send message to content script 
      messageContentScript("focus");
    }
  });
});

// On Tab Change
chrome.tabs.onActivated.addListener(() => {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
    chrome.storage.local.get((storage) => {
      const extensionOn = storage.power ? storage.power.status : true;
      const autofocus = storage.autofocus || {};
      let thisSite = tab[0].url.replace(/^.*\/\//, "").replace(/\/.*/, "");

      if (!/^www/.test(thisSite)) thisSite = "www." + thisSite;

      if (extensionOn && autofocus[thisSite]) {
        messageContentScript("focus");
      }
    });
  });
});

// Outgoing messages
function messageContentScript(msg) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
    chrome.tabs.sendMessage(tab[0].id, msg);
  });
}