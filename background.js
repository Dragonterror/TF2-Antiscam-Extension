chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        checkForBlockedContent(tabId);
    }
});

async function checkForBlockedContent() {
    const tabs = await chrome.tabs.query({});
    tabs.forEach(async tab => {
        if (tab.url && tab.url.startsWith('http')) {
            const code = await fetchHTML(tab.id);
            const allowedSites = await getAllowedSites();
            if (!containsAllowedSite(tab.url, allowedSites) && containsBlockedContent(code)) {
                redirectToBlockedPage(tab.id);
            }
        }
    });
}

async function getAllowedSites() {
    return new Promise(resolve => {
        chrome.storage.sync.get('allowedSites', function (data) {
            resolve(data.allowedSites || []);
        });
    });
}

function containsAllowedSite(url, allowedSites) {
    return allowedSites.some(site => url.includes(site));
}


async function fetchHTML(tabId) {
    const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: () => document.documentElement.outerHTML
    });
    return results[0].result;
}

function containsBlockedContent(html) {
    const blockedParts = ['tf2fortune']; // Array of blocked parts
    return blockedParts.some(part => html.includes(part));
}

function redirectToBlockedPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        chrome.tabs.update(tab.id, { url: chrome.runtime.getURL("blocked.html") });
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.redirectToBlockedPage) {
        redirectToBlockedPage();
    }
});
