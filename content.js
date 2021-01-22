let extensionOn = null;

chrome.storage.sync.get(null, (storage) => {
  extensionOn = storage.enabled || true;

  if (extensionOn) {
    listenForTabPress();
    listenForMessage();
  }
});


function getStyle(element, name) {
  return element.currentStyle ? element.currentStyle[name] : window.getComputedStyle ? window.getComputedStyle(element, null).getPropertyValue(name) : null;
};

function checkUrlForSearchBox() {
  console.log("checking url");
  switch (location.hostname) {
    case "dictionary.cambridge.org":      // For some reason no "www" required in this case
      return applyFocus(document.getElementById("searchword"));
    default:
      return null;
  }
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

function listenForTabPress() {
  window.addEventListener("keydown", (e) => {
    // If the searchbar is already focused don't focus it again, instead let people tab through the list of suggestions
    const searchBoxNotFocused = document.activeElement.tagName !== "INPUT";
    if (searchBoxNotFocused && e.key === "Tab") {
      focusSearchBox();
      e.preventDefault();
    }
  });
}

function listenForMessage() {
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "focus") focusSearchBox();
  });
}

function focusSearchBox() {
  const urlFound = checkUrlForSearchBox();
  if (!urlFound) checkHtmlForSearchBox();
}

function applyFocus(searchBox) {
  searchBox.focus();
  return true;
}