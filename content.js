let extensionOn = null;
let tabPressed = 0;

chrome.storage.sync.get(null, (storage) => {
  extensionOn = storage.enabled || true;

  if (extensionOn) {
    const searchBox = checkUrlForSearchBox() || checkHtmlForSearchBox();
    listenForTabPress(searchBox);
    listenForMessage(searchBox);
  }
});

function getStyle(element, name) {
  return element.currentStyle ? element.currentStyle[name] : window.getComputedStyle ? window.getComputedStyle(element, null).getPropertyValue(name) : null;
};

function checkUrlForSearchBox() {
  switch (location.hostname) {
    case "dictionary.cambridge.org":      // For some reason no "www" required in this case
      return document.getElementById("searchword");
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

      if (!isHidden && !isDisabledOrReadonly && elementInViewport(input) && isValidFocusableField) {
        return input;
      }
    }

    if (inputs.length > 0)
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (elementInViewport(input)) {
          return input;
        }
      }
  }
};

function elementInViewport(el) {
  var bounding = el.getBoundingClientRect();
  const isInViewport = (
    bounding.top >= 0 &&
    bounding.left >= 0 &&
    bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
  );

  return isInViewport;
};

function listenForTabPress(searchBox) {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      searchBox.focus();
      e.preventDefault();
    }
  });
}

function listenForMessage(searchBox) {
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "focus") {
      searchBox.focus();
    } else if (request.action === "initialize") {
      console.log("do something");
    }
  });
}