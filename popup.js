document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('allowForm');
    const message = document.getElementById('message');
    const allowedSitesList = document.getElementById('allowedSitesList');

    // Load allowed sites from storage and display them
    chrome.storage.sync.get('allowedSites', function (data) {
        const allowedSites = data.allowedSites || [];
        allowedSites.forEach(site => {
            const listItem = document.createElement('li');
            listItem.textContent = site;
            allowedSitesList.appendChild(listItem);
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Disallow';
            removeButton.addEventListener('click', function () {
                disallowSite(site);
            });
            listItem.appendChild(removeButton);
        });
    });

    // Form submission handler
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const allowUrl = form.elements['allowUrl'].value.trim();
        if (allowUrl) {
            addAllowedSite(allowUrl);
            form.reset();
        } else {
            message.textContent = 'Please enter a valid URL.';
        }
    });

    // Function to add allowed site
    function addAllowedSite(allowUrl) {
        chrome.storage.sync.get('allowedSites', function (data) {
            let allowedSites = data.allowedSites || [];
            allowedSites.push(allowUrl);
            chrome.storage.sync.set({ allowedSites }, function () {
                message.textContent = `Added ${allowUrl} to allowed sites.`;
                setTimeout(() => {
                    message.textContent = '';
                }, 2000);
                // Add site to the list
                const listItem = document.createElement('li');
                listItem.textContent = allowUrl;
                allowedSitesList.appendChild(listItem);
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Disallow';
                removeButton.addEventListener('click', function () {
                    disallowSite(allowUrl);
                });
                listItem.appendChild(removeButton);
            });
        });
    }

    // Function to remove allowed site
    function disallowSite(allowUrl) {
        chrome.storage.sync.get('allowedSites', function (data) {
            let allowedSites = data.allowedSites || [];
            allowedSites = allowedSites.filter(site => site !== allowUrl);
            chrome.storage.sync.set({ allowedSites }, function () {
                message.textContent = `Removed ${allowUrl} from allowed sites.`;
                setTimeout(() => {
                    message.textContent = '';
                }, 2000);
                // Remove site from the list
                const listItems = allowedSitesList.querySelectorAll('li');
                listItems.forEach(listItem => {
                    if (listItem.textContent === allowUrl) {
                        listItem.remove();
                    }
                });
            });
        });
    }
});
