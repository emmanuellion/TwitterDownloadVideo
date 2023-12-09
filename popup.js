chrome.storage.local.get(['twitter_url'], (json) => {
    const div = document.createElement('div');
    div.textContent = json['twitter_url'];
    document.querySelector('#body').appendChild(div);
});
