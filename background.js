let betterHeader = {}

function getHeader(req){
    if(req.url.includes('TweetDetail')){
        const headers = req.requestHeaders;
        console.log(req)
        for(let i = 0; i < headers.length; i++){
            if(!betterHeader[headers[i].name]) betterHeader[headers[i].name] = headers[i].value;
        }
    }
}

let dataData = null;
let onceData = false;

async function getData(req) {
    if(req.url.includes('TweetDetail') && !onceData){
        onceData = true;
        const res = await fetch(req.url, {
            "method": "GET",
            "body": null,
            headers: {
                "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,la;q=0.6",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "Referrer-Policy": "strict-origin-when-cross-origin",
                ...betterHeader
            }
        });
        dataData = await res.json();
        let biggest = 0;
        let video = null;
        const medias = dataData.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.tweet.legacy.entities.media[0].video_info.variants
        for(let i = 0; i < medias.length; i++){
            if(medias[i].bitrate > biggest){
                biggest = medias[i].bitrate;
                video = medias[i].url;
            }
        }
        chrome.storage.local.set({'twitter_url': video}, () => {});
    }
}
chrome.webRequest.onSendHeaders.addListener(
    getHeader,
    { urls: ["<all_urls>"] },
    ["requestHeaders"]
);

chrome.webRequest.onCompleted.addListener(
    getData,
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
);
