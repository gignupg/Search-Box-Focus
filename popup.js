let extensionOn = null;
let autofocusList = null;

// Initializing tooltip
M.Tooltip.init(document.querySelectorAll('.tooltipped'), { enterDelay: 500 });

$(".power-button").addEventListener("click", toggleExtensionOnOff);

$("#autofocus").addEventListener("change", updateAutofocusList);

$("#autofocus-tooltip").dataset.tooltip = "My awesome tooltip text";

chrome.storage.sync.get(null, (storage) => {
    extensionOn = storage.enabled || true;
    autofocusList = storage.autofocusList || {};

    updatePopup();
});

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
        // Display the options
        $("#options").classList.remove("hide");

    } else {
        // Changing the hover color of the power button
        $(".power-button").classList.remove("turn-off");
        $(".power-button").classList.add("turn-on");
        // Hide the options
        $("#options").classList.add("hide");
    }

    // Update switch
    chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
        const thisSite = tab[0].url.replace(/^.*\/\//, "").replace(/\/.*/, "");

        // Check if autofocus is on/off
        if (autofocusList[thisSite]) {
            $("#autofocus").checked = true;
            $("#autofocus-tooltip").dataset.tooltip = `Autofocus enabled for "${thisSite}"`;

        } else {
            $("#autofocus").checked = false;
            $("#autofocus-tooltip").dataset.tooltip = `Autofocus disabled for "${thisSite}"`;
        }
    });
}

function updateAutofocusList() {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
        const addToList = $("#autofocus").checked;
        const thisSite = tab[0].url.replace(/^.*\/\//, "").replace(/\/.*/, "");

        // Update list locally
        if (addToList) {
            autofocusList[thisSite] = true;
            $("#autofocus-tooltip").dataset.tooltip = `Autofocus enabled for "${thisSite}"`;

        } else {
            delete autofocusList[thisSite];
            $("#autofocus-tooltip").dataset.tooltip = `Autofocus disabled for "${thisSite}"`;
        }

        // Update chrome storage
        chrome.storage.sync.set({ autofocusList: autofocusList });
    });
}

function messageContentScript(message) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
        chrome.tabs.sendMessage(tab[0].id, message);
    });
};