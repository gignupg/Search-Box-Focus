let extensionOn = true;
let tabList = null;
let autofocus = null;

updateState();

// Incomming messages
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request === "getUrl") {
      let thisSite = sender.tab.url.replace(/^.*\/\//, "").replace(/\/.*/, "");
      if (!/^www/.test(thisSite)) thisSite = "www." + thisSite;

      sendResponse({ url: thisSite });

    } else if (request === "updateState") {
      updateState();

    } else if (request === "backgroundRunning") {
      sendResponse(true);
    }
  }
);

// Shortcut (Alt + S by default)
chrome.commands.onCommand.addListener((command) => {
  if (extensionOn && command === 'focus-search-bar') {
    // Send message to content script 
    messageContentScript({ action: "focus" });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
      isContentScriptRunning(tab[0]);
    });
  }
});

// On tab change let the content script know to update tabList and to autofocus if enabled
chrome.tabs.onActivated.addListener(() => {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
    let thisSite = tab[0].url.replace(/^.*\/\//, "").replace(/\/.*/, "");
    if (!/^www/.test(thisSite)) thisSite = "www." + thisSite;
    if (extensionOn) {
      if (autofocus[thisSite]) {
        messageContentScript({ action: "focus" });
        isContentScriptRunning(tab[0]);
      }

      messageContentScript({ action: "tabList", list: tabList });
    }
  });
});

function updateState() {
  chrome.storage.sync.get(null, (storage) => {
    if (storage.enabled !== undefined) {
      extensionOn = storage.enabled;
    }

    tabList = storage.tabList || {};
    autofocus = storage.autofocus || {};
  });
}

function isContentScriptRunning(tab) {
  let contentOn = null;

  // send message to backgroundscript to see if it is enabled
  chrome.tabs.sendMessage(tab.id, { action: "contentRunning" }, (response) => {
    contentOn = response;
  });

  // After 1 second, if there is no response show the reload dialog
  setTimeout(() => {
    if (tab.url === "chrome://extensions/" || tab.url === "chrome://newtab/") {
      alert("Search Box Focus has no access to this site, sorry!");

    } else if (!contentOn) {
      // Tell the user to reload the page!
      let confirmation = confirm('To use Search Box Focus please reload the page! Reload now?');
      if (confirmation == true) {
        chrome.tabs.reload(tab.id);
      }
    }
  }, 2000);
}

// Outgoing messages
function messageContentScript(msg) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
    chrome.tabs.sendMessage(tab[0].id, msg);
  });
}