// Focuses the search bar when the page is first loaded or refreshed
focusSearchBar();

chrome.runtime.onMessage.addListener(
  function (request) {
    if (request.action == "focus") {
      focusSearchBar();
    }
  }
);

function getStyle(element, name) {
  return element.currentStyle ? element.currentStyle[name] : window.getComputedStyle ? window.getComputedStyle(element, null).getPropertyValue(name) : null;
};

function focusSearchBar() {
  if (document.activeElement.tagName != "INPUT") {
    const inputs = document.body.getElementsByTagName("input");
    let focused = false;

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const isHiddenByDisplay = getStyle(input, 'display') === 'none';
      const isHiddenByVisibility = getStyle(input, 'visibility') === 'hidden';
      const isHidden = isHiddenByDisplay || isHiddenByVisibility;
      const validInputTypes = ['text', 'search', 'email', 'number', 'password', 'tel', 'url'];

      const isValidFocusableField = validInputTypes.find(x => x === input.type);
      const isDisabledOrReadonly = input.disabled || input.readOnly;

      if (!isHidden && !isDisabledOrReadonly && elementInViewport(input) && isValidFocusableField) {
        input.focus();
        focused = true;
        break;
      }
    }

    if (!focused && inputs.length > 0)
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (elementInViewport(input)) {
          input.focus();
          focused = true;
          break;
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