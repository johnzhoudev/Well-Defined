console.log('background running');

chrome.runtime.onMessage.addListener(triggerJavascript);

function triggerJavascript(message, sender, response){



    if (message.type === "popup status"){

        chrome.tabs.executeScript({
            file:"page.js"
        })

    }
}