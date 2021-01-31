let extensionOn = true;
let tabList = null;
let autofocus = null;

updateState();

// Incomming messages
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request === "getUrl") {
      const hostname = sender.tab.url.replace(/^.*\/\//, "").replace(/\/.*/, "");
      sendResponse({ url: hostname });

    } else if (request === "updateState") {
      updateState();
    }
  }
);

// Shortcut
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
    const thisSite = tab[0].url.replace(/^.*\/\//, "").replace(/\/.*/, "");
    if (extensionOn && command === 'focus-search-bar') {
      messageContentScript({ action: "focus" });
    }
  });
});

// On tab change let the content script know to update tabList and to autofocus if enabled
chrome.tabs.onActivated.addListener(() => {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
    const thisSite = tab[0].url.replace(/^.*\/\//, "").replace(/\/.*/, "");
    if (extensionOn) {
      if (autofocus[thisSite]) {
        messageContentScript({ action: "focus" });
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

// Outgoing messages
function messageContentScript(msg) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
    chrome.tabs.sendMessage(tab[0].id, msg);
  });
}