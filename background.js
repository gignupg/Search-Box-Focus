// Message received
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request === "getUrl") {
      const hostname = sender.tab.url.replace(/^.*\/\//, "").replace(/\/.*/, "");
      sendResponse({ url: hostname });
    }
  }
);

// Shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'focus-search-bar') {
    messageContentScript("focus");
  }
});

// Autofocus
chrome.tabs.onActivated.addListener(() => {
  messageContentScript("autofocus");
});

function messageContentScript(msg) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
    chrome.tabs.sendMessage(tab[0].id, { action: msg });
  });
}

