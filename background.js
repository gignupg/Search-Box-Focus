chrome.commands.onCommand.addListener((command) => {
  if (command === 'focus-search-bar') {
    messageContentScript();
  }
});

chrome.tabs.onActivated.addListener(function () {
  messageContentScript();
});

function messageContentScript() {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
    chrome.tabs.sendMessage(tab[0].id, { action: "focus" });
  });
}