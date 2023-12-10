let betterHeader = {}

function getHeader(req){
    if(req.url.includes('TweetDetail')){
        const headers = req.requestHeaders;
        for(let i = 0; i < headers.length; i++){
            if(!betterHeader[headers[i].name]) betterHeader[headers[i].name] = headers[i].value;
        }
    }
}

let dataData = null;
let last = "";

async function getData(req) {
    if(req.url.includes('TweetDetail') && last !== req.url){
        last = req.url;
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
        try {
            const entries = dataData.data.threaded_conversation_with_injections_v2.instructions[0]?.entries;
            let savedEntry = null;
            for (const entry of entries) {
                let content = entry?.content?.itemContent?.tweet_results?.result?.legacy?.entities;
                if(content === undefined)
                    content = entry?.content?.itemContent?.tweet_results?.result?.tweet.legacy.entities;
                if (content?.media) {
                    const med = content.media[0];
                    if (med.type === 'video')
                        savedEntry = med.video_info.variants;
                }
            }
            if (savedEntry) {
                let video = "";
                let biggest = 0;
                for(let i = 0; i < savedEntry.length; i++){
                    if(savedEntry[i].bitrate)
                        if(savedEntry[i].bitrate > biggest){
                            biggest = savedEntry[i].bitrate;
                            video = savedEntry[i].url;
                        }
                }
                console.log(video);
                if (video.trim().length > 1 && biggest > 0)
                    chrome.storage.local.set({ 'twitter_url': video }, () => {});
            }
        } catch (e) {
            console.error(e);
        }
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
