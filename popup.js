let extensionOn = true;
let tabOn = true;
let tabList = null;
let autofocus = null;
let thisSite = null;

// Initializing tooltip
M.Tooltip.init(document.querySelectorAll('.tooltipped'), { enterDelay: 500 });

$(".power-button").addEventListener("click", toggleExtensionOnOff);

$("#tab-power-button").addEventListener("click", tabPermanentlyOnOff);

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

chrome.storage.local.get((storage) => {
    extensionOn = storage.power ? storage.power.status : true;
    tabOn = storage.tabulation ? storage.tabulation.status : true;
    tabList = storage.tabList || {};
    autofocus = storage.autofocus || {};

    // Updating "thisSite"
    chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
        thisSite = tab[0].url.replace(/^.*\/\//, "").replace(/\/.*/, "");
        // Add www. to the url if it's not already there. 
        if (!/^www/.test(thisSite)) thisSite = "www." + thisSite;

        updatePopup();
    });
});

function updatePopup() {
    const suffix = `${extensionOn ? "" : "_disabled"}.png`;
    chrome.action.setIcon({
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

        // Visually disable the whole Tab section if necessary
        if (!tabOn) {
            $("#tab-switch").disabled = true;
            $("#tab-text").style.color = "gray";
            $("#tab-section").classList.add("gray-bg");
            $("#tab-power-button").style.color = "gray";
        }

        updateDisplayedShortcuts();

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

                if (!tabOn || tabList[thisSite]) {
                    $("#shortcut-display").textContent = command.shortcut;

                } else {
                    $("#shortcut-display").textContent = `Tab or ${command.shortcut}`;
                }
            }
        });

        if (!commandExists) {
            if (!tabOn || tabList[thisSite]) {
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
    chrome.storage.local.set({ autofocus: autofocus });
}

function toggleExtensionOnOff() {
    extensionOn = !extensionOn;
    updatePopup();
    chrome.storage.local.set({ power: { status: extensionOn } });
}

function tabPermanentlyOnOff() {
    if (tabOn) {
        tabOn = false;
        $("#tab-switch").disabled = true;
        $("#tab-text").style.color = "gray";
        $("#tab-section").classList.add("gray-bg");
        $("#tab-power-button").style.color = "gray";

    } else {
        tabOn = true;
        $("#tab-switch").disabled = false;
        $("#tab-text").style.color = "black";
        $("#tab-section").classList.remove("gray-bg");
        $("#tab-power-button").style.color = "rgb(70, 70, 70)";
    }

    updateDisplayedShortcuts();
    chrome.storage.local.set({ tabulation: { status: tabOn } });
}

function toggleTabOnOff() {
    if (tabList[thisSite]) {
        delete tabList[thisSite];
        $("#tab-tooltip").dataset.tooltip = `Tab enabled for "${thisSite}"`;

    } else {
        tabList[thisSite] = true;
        $("#tab-tooltip").dataset.tooltip = `Tab disabled for "${thisSite}"`;
    }

    updateDisplayedShortcuts();
    chrome.storage.local.set({ tabList: tabList });
}

function $(selector, multiple = false) {
    if (multiple) {
        return document.querySelectorAll(selector);
    }

    return document.querySelector(selector);
}