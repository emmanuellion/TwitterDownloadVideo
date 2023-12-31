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
            let savedEntrys = null;
            for (const entry of entries) {
                let content = entry?.content?.itemContent?.tweet_results?.result?.legacy?.entities;
                if(content === undefined)
                    content = entry?.content?.itemContent?.tweet_results?.result?.tweet.legacy.entities;
                if (content?.media)
                    savedEntrys = content.media;
            }
            if (savedEntrys) {
                let str = "";
                for(let i = 0; i < savedEntrys.length; i++){
                    if(savedEntrys[i].type === "video"){
                        let video = "";
                        let biggest = 0;
                        const vars = savedEntrys[i].video_info.variants;
                        for(let j = 0; j < vars.length; j++) {
                            if (vars[j].bitrate){
                                if (vars[j].bitrate > biggest) {
                                    biggest = vars[j].bitrate;
                                    video = vars[j].url;
                                }
                            }
                        }
                        str += video;
                        if(i+1<savedEntrys.length)
                            str += "<br/>"
                    }
                }
                console.log(str);
                if (str.trim().length > 1)
                    chrome.storage.local.set({ 'twitter_url': str }, () => {});
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
