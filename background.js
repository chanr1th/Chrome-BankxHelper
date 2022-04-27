'use strict';

chrome.runtime.onInstalled.addListener(function() {
    setUpContextMenus();
});

function setUpContextMenus() {
    chrome.contextMenus.create({
        title: 'Show element info'
        , type: 'normal'
        , id: 'show_element_info'
        , contexts: ['all']
    });
}
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === 'show_element_info') {
        chrome.tabs.sendMessage(tab.id, "showPopover", {frameId: info.frameId});
    }
});
