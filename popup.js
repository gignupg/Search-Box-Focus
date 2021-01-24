let extensionOn = true;
let tabEnabled = true;
let autofocus = null;

// Initializing tooltip
M.Tooltip.init(document.querySelectorAll('.tooltipped'), { enterDelay: 500 });

$(".power-button").addEventListener("click", toggleExtensionOnOff);

$("#tab-switch").addEventListener("change", toggleTabOnOff);

$("#autofocus-switch").addEventListener("change", updateAutofocusList);

$("#shortcuts").addEventListener("click", () => {
    chrome.tabs.create({ active: true, url: "chrome://extensions/shortcuts" });
});

chrome.storage.sync.get(null, (storage) => {
    if (storage.enabled !== undefined) {
        extensionOn = storage.enabled;
    }

    if (storage.tabEnabled !== undefined) {
        tabEnabled = storage.tabEnabled;
    }

    autofocus = storage.autofocus || {};

    updatePopup();
});

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

        updateDisplayedShortcuts();

        // Update the autofocus switch
        chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
            const thisSite = tab[0].url.replace(/^.*\/\//, "").replace(/\/.*/, "");

            // Turn the visual display of autofocus on/off
            if (autofocus[thisSite]) {
                $("#autofocus-switch").checked = true;
                $("#autofocus-tooltip").dataset.tooltip = `Autofocus enabled for "${thisSite}"`;

            } else {
                $("#autofocus-switch").checked = false;
                $("#autofocus-tooltip").dataset.tooltip = `Autofocus disabled for "${thisSite}"`;
            }
        });

        // Update the tab switch
        if (tabEnabled) {
            $("#tab-switch").checked = true;

        } else {
            $("#tab-switch").checked = false;
        }

    } else {
        // Changing the hover color of the power button
        $(".power-button").classList.remove("turn-off");
        $(".power-button").classList.add("turn-on");
        // Hide the options
        $("#options").classList.add("hide");
    }
}

function updateDisplayedShortcuts() {
    // Make sure the shortcuts are displayed correctly
    chrome.commands.getAll((commands) => {
        let commandExists = false;
        commands.forEach(command => {
            if (command.name === "focus-search-bar" && command.shortcut) {
                commandExists = true;

                if (tabEnabled) {
                    $("#shortcut-display").textContent = `Tab or ${command.shortcut}`;    // innerHTML didn't work for some reason

                } else {
                    $("#shortcut-display").textContent = command.shortcut;
                }
            }
        });

        if (!commandExists) {
            if (tabEnabled) {
                $("#shortcut-display").textContent = "Tab";

            } else {
                $("#shortcut-display").textContent = "";
            }
        }
    });
}

function updateAutofocusList() {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
        const addToList = $("#autofocus-switch").checked;
        const thisSite = tab[0].url.replace(/^.*\/\//, "").replace(/\/.*/, "");

        // Update list locally
        if (addToList) {
            autofocus[thisSite] = true;
            $("#autofocus-tooltip").dataset.tooltip = `Autofocus enabled for "${thisSite}"`;

        } else {
            delete autofocus[thisSite];
            $("#autofocus-tooltip").dataset.tooltip = `Autofocus disabled for "${thisSite}"`;
        }

        // Update chrome storage
        chrome.storage.sync.set({ autofocus: autofocus });
        // Message background script that autofocus has changed
        chrome.runtime.sendMessage("updateState");
    });
}

function toggleExtensionOnOff() {
    extensionOn = !extensionOn;
    updatePopup();
    chrome.storage.sync.set({ enabled: extensionOn });
    // Update background state
    chrome.runtime.sendMessage("updateState");
    // Update content state
    messageContentScript({ action: "extension", state: extensionOn });
}

function toggleTabOnOff() {
    tabEnabled = !tabEnabled;
    updateDisplayedShortcuts();
    chrome.storage.sync.set({ tabEnabled: tabEnabled });
    // Update background state
    chrome.runtime.sendMessage("updateState");
    // Update content state
    messageContentScript({ action: "tab", state: tabEnabled });
}

function $(selector, multiple = false) {
    if (multiple) {
        return document.querySelectorAll(selector);
    }

    return document.querySelector(selector);
}

function messageContentScript(message) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
        chrome.tabs.sendMessage(tab[0].id, message);
    });
};