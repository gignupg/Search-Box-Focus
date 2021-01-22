let extensionOn = null;

chrome.storage.sync.get(null, (storage) => {
    extensionOn = storage.enabled || true;
    updatePopup();
});

$(".power-button").addEventListener("click", toggleExtensionOnOff);

function toggleExtensionOnOff() {
    extensionOn = !extensionOn;
    updatePopup();
    chrome.storage.sync.set({ enabled: extensionOn });
}

function $(selector, multiple = false) {
    if (multiple) {
        return document.querySelectorAll(selector);
    }

    return document.querySelector(selector);
}

function updatePopup() {
    const suffix = `${extensionOn ? "" : "_disabled"}.png`;
    chrome.browserAction.setIcon({
        path: {
            "16": "icons/icons8-google-web-search-16" + suffix,
            "48": "icons/icons8-google-web-search-48" + suffix,
            "128": "icons/icons8-google-web-search-128" + suffix
        }
    });

    $(".logo").src = "icons/icons8-google-web-search-full-48" + suffix;

    if (extensionOn) {
        // Changing the hover color of the power button
        $(".power-button").classList.remove("turn-on");
        $(".power-button").classList.add("turn-off");

    } else {
        // Changing the hover color of the power button
        $(".power-button").classList.remove("turn-off");
        $(".power-button").classList.add("turn-on");
    }
}