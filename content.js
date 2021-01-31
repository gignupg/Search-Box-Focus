let extensionOn = true;
let tabList = null;
let thisSite = null;

// Read chrome storage, update variables and focus search box if necessary
chrome.storage.sync.get(null, (storage) => {
  if (storage.enabled !== undefined) {
    extensionOn = storage.enabled;
  }

  tabList = storage.tabList || {};

  // Autofocus required
  chrome.runtime.sendMessage("getUrl", function (response) {
    const autofocus = storage.autofocus || {};
    thisSite = response.url;

    // If current url is in autofocus list, focus the search box
    if (extensionOn && autofocus[thisSite]) {
      focusSearchBox();
    }
  });
});

// Listen for Tab Press
window.addEventListener("keydown", (e) => {
  if (extensionOn && !tabList[thisSite]) {
    const searchBoxNotFocused = document.activeElement.tagName !== "INPUT";

    // If the searchbar is already focused don't focus it again, instead let people tab through the list of suggestions
    if (searchBoxNotFocused && e.key === "Tab") {
      focusSearchBox();
      e.preventDefault();
    }
  }
});

// Listen for messages
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "focus") focusSearchBox();
  if (msg.action === "extension") extensionOn = msg.state;
  if (msg.action === "tabList") tabList = msg.list;
});

function getStyle(element, name) {
  return element.currentStyle ? element.currentStyle[name] : window.getComputedStyle ? window.getComputedStyle(element, null).getPropertyValue(name) : null;
};

function checkUrlForSearchBox() {
  chrome.runtime.sendMessage("getUrl", function (response) {
    switch (response.url) {
      case "dictionary.cambridge.org":
        return applyFocus(document.getElementById("searchword"));
      default:
        return null;
    }
  });
}

function checkHtmlForSearchBox() {
  if (document.activeElement.tagName != "INPUT") {
    const inputs = document.body.getElementsByTagName("input");

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const isHiddenByDisplay = getStyle(input, 'display') === 'none';
      const isHiddenByVisibility = getStyle(input, 'visibility') === 'hidden';
      const isHidden = isHiddenByDisplay || isHiddenByVisibility;
      const validInputTypes = ['text', 'search', 'email', 'number', 'password', 'tel', 'url'];

      const isValidFocusableField = validInputTypes.find(x => x === input.type);
      const isDisabledOrReadonly = input.disabled || input.readOnly;

      if (!isHidden && !isDisabledOrReadonly && isValidFocusableField) {
        return applyFocus(input);
      }
    }

    if (inputs.length > 0) {
      for (let i = 0; i < inputs.length; i++) {
        return applyFocus(inputs[i]);
      }
    }
  }
}

function focusSearchBox() {
  const urlFound = checkUrlForSearchBox();
  if (!urlFound) checkHtmlForSearchBox();
}

function applyFocus(searchBox) {
  searchBox.focus();
  return true;
}