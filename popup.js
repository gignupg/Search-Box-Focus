let extensionOn = true;
let tabList = null;
let autofocus = null;
let thisSite = null;
let tabId = null;

chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
    thisSite = tab[0].url.replace(/^.*\/\//, "").replace(/\/.*/, "");
    tabId = tab[0].id;
});

// Initializing tooltip
M.Tooltip.init(document.querySelectorAll('.tooltipped'), { enterDelay: 500 });

$(".power-button").addEventListener("click", toggleExtensionOnOff);

$("#tab-switch").addEventListener("change", toggleTabOnOff);

$("#autofocus-switch").addEventListener("change", updateAutofocusList);

$("#shortcuts").addEventListener("click", () => {
    chrome.tabs.create({ active: true, url: "chrome://extensions/shortcuts" });
});

$("#heading").addEventListener("click", () => {
    chrome.tabs.create({ active: true, url: "https://chrome.google.com/webstore/detail/search-box-focus-hit-tab/amgmdnojamodmpfjaokfgpijhpcednjm" });
});

$("#logo").addEventListener("click", () => {
    chrome.tabs.create({ active: true, url: "https://chrome.google.com/webstore/detail/search-box-focus-hit-tab/amgmdnojamodmpfjaokfgpijhpcednjm" });
});

chrome.storage.sync.get(null, (storage) => {
    if (storage.enabled !== undefined) {
        extensionOn = storage.enabled;
    }

    tabList = storage.tabList || {};
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

    $("#logo").src = "icons/icons8-google-web-search-full-48" + suffix;

    if (extensionOn) {
        // Changing the hover color of the power button
        $(".power-button").classList.remove("turn-on");
        $(".power-button").classList.add("turn-off");
        // Display the options
        $("#options").classList.remove("hide");

        updateDisplayedShortcuts();

        // Update the tab switch
        if (tabList[thisSite]) {
            $("#tab-switch").checked = false;
            $("#tab-tooltip").dataset.tooltip = `Tab disabled for "${thisSite}"`;

        } else {
            $("#tab-switch").checked = true;
            $("#tab-tooltip").dataset.tooltip = `Tab enabled for "${thisSite}"`;
        }

        // Turn the visual display of autofocus on/off
        if (autofocus[thisSite]) {
            $("#autofocus-switch").checked = true;
            $("#autofocus-tooltip").dataset.tooltip = `Autofocus enabled for "${thisSite}"`;

        } else {
            $("#autofocus-switch").checked = false;
            $("#autofocus-tooltip").dataset.tooltip = `Autofocus disabled for "${thisSite}"`;
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

                if (tabList[thisSite]) {
                    $("#shortcut-display").textContent = command.shortcut;

                } else {
                    $("#shortcut-display").textContent = `Tab or ${command.shortcut}`;
                }
            }
        });

        if (!commandExists) {
            if (tabList[thisSite]) {
                $("#shortcut-display").textContent = "";

            } else {
                $("#shortcut-display").textContent = "Tab";
            }
        }
    });
}

function updateAutofocusList() {
    const addToList = $("#autofocus-switch").checked;

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
}

function toggleExtensionOnOff() {
    extensionOn = !extensionOn;
    updatePopup();
    chrome.storage.sync.set({ enabled: extensionOn });
    // Update background state
    chrome.runtime.sendMessage("updateState");
    // Update content state
    chrome.tabs.sendMessage(tabId, { action: "extension", state: extensionOn });
}

function toggleTabOnOff() {
    if (tabList[thisSite]) {
        tabList[thisSite] = false;
        $("#tab-tooltip").dataset.tooltip = `Tab enabled for "${thisSite}"`;

    } else {
        tabList[thisSite] = true;
        $("#tab-tooltip").dataset.tooltip = `Tab disabled for "${thisSite}"`;
    }

    updateDisplayedShortcuts();
    chrome.storage.sync.set({ tabList: tabList });
    // Update background state
    chrome.runtime.sendMessage("updateState");
    // Update content state
    chrome.tabs.sendMessage(tabId, { action: "tabList", list: tabList });
}

function $(selector, multiple = false) {
    if (multiple) {
        return document.querySelectorAll(selector);
    }

    return document.querySelector(selector);
}