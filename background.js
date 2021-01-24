let extensionOn = null;
let autofocus = null;
let blacklist = null;

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
    if (extensionOn && !blacklist[thisSite] && command === 'focus-search-bar') {
      messageContentScript({ action: "focus" });
    }
  });
});

// Autofocus
chrome.tabs.onActivated.addListener(() => {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
    const thisSite = tab[0].url.replace(/^.*\/\//, "").replace(/\/.*/, "");
    if (extensionOn && !blacklist[thisSite] && autofocus[thisSite]) {
      messageContentScript({ action: "focus" });
    }
  });
});

function updateState() {
  chrome.storage.sync.get(null, (storage) => {
    if (storage.enabled !== undefined) {
      extensionOn = storage.enabled;
    }

    autofocus = storage.autofocus || {};
    blacklist = storage.blacklist || {};
  });
}

// Outgoing messages
function messageContentScript(msg) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
    chrome.tabs.sendMessage(tab[0].id, msg);
  });
}