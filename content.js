// Autofocus when loading a website
chrome.storage.sync.get(null, (storage) => {
  const extensionOn = storage.power ? storage.power.status : true;

  // Autofocus on?
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
document.addEventListener("keydown", (e) => {
  chrome.storage.sync.get(null, (storage) => {
    const extensionOn = storage.power ? storage.power.status : true;
    const tabOn = storage.tabulation ? storage.tabulation.status : true;
    const tabList = storage.tabList || {};

    // Autofocus required
    chrome.runtime.sendMessage("getUrl", function (response) {
      thisSite = response.url;

      if (extensionOn && tabOn && !tabList[thisSite]) {
        const searchBoxNotFocused = document.activeElement.tagName !== "INPUT";

        // If the searchbar is already focused don't focus it again, instead let people tab through the list of suggestions
        if (searchBoxNotFocused && e.key === "Tab") {
          focusSearchBox();
          e.preventDefault();
        }
      }
    });
  });
});

// Listen for messages
chrome.runtime.onMessage.addListener((msg) => {
  if (msg === "focus") focusSearchBox();
});

function getStyle(element, name) {
  return element.currentStyle ? element.currentStyle[name] : window.getComputedStyle ? window.getComputedStyle(element, null).getPropertyValue(name) : null;
};

function checkUrlForSearchBox() {
  chrome.runtime.sendMessage("getUrl", function (response) {
    switch (response.url) {
      case "www.dictionary.cambridge.org":
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
  searchBox.select();
  return true;
}