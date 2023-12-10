chrome.storage.local.get(['twitter_url'], (json) => {
    const div = document.createElement('div');
    div.innerHTML = json['twitter_url'];
    document.querySelector('#body').appendChild(div);
});
