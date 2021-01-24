let extensionOn = null;
let autofocus = null;
let blacklist = null;

// Initializing tooltip
M.Tooltip.init(document.querySelectorAll('.tooltipped'), { enterDelay: 500 });

$(".power-button").addEventListener("click", toggleExtensionOnOff);

$("#shortcut").addEventListener("click", () => {
    chrome.tabs.create({ active: true, url: "chrome://extensions/shortcuts" });
});

$("#autofocus").addEventListener("change", () => updateList(autofocus, "autofocus"));

$("#blacklist").addEventListener("change", () => updateList(blacklist, "blacklist"));

$("#autofocus-tooltip").dataset.tooltip = "My awesome tooltip text";

chrome.storage.sync.get(null, (storage) => {
    if (storage.enabled !== undefined) {
        extensionOn = storage.enabled;
    }

    autofocus = storage.autofocus || {};
    blacklist = storage.blacklist || {};

    updatePopup();
});

function toggleExtensionOnOff() {
    extensionOn = !extensionOn;
    updatePopup();
    chrome.storage.sync.set({ enabled: extensionOn });
    // Update background state
    chrome.runtime.sendMessage("updateState");
    // Update content state
    messageContentScript({ action: "extension", state: extensionOn });
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

        // Update autofocus switch and shortcuts
        chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
            const thisSite = tab[0].url.replace(/^.*\/\//, "").replace(/\/.*/, "");

            // Make sure the shortcuts are displayed correctly
            updateDisplayedShortcuts();

            // Turn the visual display of autofocus on/off
            if (autofocus[thisSite]) {
                $("#autofocus").checked = true;
                $("#autofocus-tooltip").dataset.tooltip = tooltipText("autofocus", thisSite, true);

            } else {
                $("#autofocus").checked = false;
                $("#autofocus-tooltip").dataset.tooltip = tooltipText("autofocus", thisSite, false);
            }

            // Turn blacklist on/off
            if (blacklist[thisSite]) {
                $("#blacklist").checked = true;
                $("#blacklist-tooltip").dataset.tooltip = tooltipText("blacklist", thisSite, true);
                // Visually disable the extension
                $("#autofocus-tooltip").dataset.tooltip = tooltipText("autofocus", thisSite, false);
                $("#autofocus").disabled = true;
                $(".fadable", true).forEach((elem) => elem.classList.add("disabled"));
                // Physically disable the extension

            } else {
                $("#blacklist").checked = false;
                $("#blacklist-tooltip").dataset.tooltip = tooltipText("blacklist", thisSite, false);
                // Visually enable the extension
                $("#autofocus").disabled = false;
                $(".fadable", true).forEach((elem) => elem.classList.remove("disabled"));
                // Physically enable the extension
            }
        });

    } else {
        // Changing the hover color of the power button
        $(".power-button").classList.remove("turn-off");
        $(".power-button").classList.add("turn-on");
        // Hide the options
        $("#options").classList.add("hide");
    }
}

function updateList(list, name) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
        const addToList = $("#" + name).checked;
        const thisSite = tab[0].url.replace(/^.*\/\//, "").replace(/\/.*/, "");

        // Update list locally
        if (addToList) {
            list[thisSite] = true;

        } else {
            delete list[thisSite];
        }

        // Update chrome storage
        chrome.storage.sync.set({ [name]: list });

        updatePopup();

        if (name === "blacklist") {
            messageContentScript({ action: "blacklist", list: list });

        } else {
            // Message background script that autofocus has changed
            chrome.runtime.sendMessage("updateState");
        }
    });
}

function messageContentScript(message) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
        chrome.tabs.sendMessage(tab[0].id, message);
    });
};

function updateDisplayedShortcuts() {
    chrome.commands.getAll((commands) => {
        commands.forEach(command => {
            if (command.name === "focus-search-bar" && command.shortcut) {
                $("#shortcut-display").textContent = `Tab or ${command.shortcut}`;    // innerHTML didn't work for some reason
            }
        });
    });
}

function tooltipText(list, url, enabled) {
    if (list === "blacklist") {
        if (enabled) {
            return `Remove "${url}" from blacklist`;
        } else {
            return `Add "${url}" to blacklist (disables the extension on this site)`;
        }

    } else if (list === "autofocus") {
        if (enabled) {
            return `Autofocus enabled for "${url}"`;
        } else {
            return `Autofocus disabled for "${url}"`;
        }
    }
}