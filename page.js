console.log("Well-Defined Page JS Running.");


//Get selected text
var selectedText = window.getSelection().toString().trim();

//send selected text to popup
chrome.runtime.sendMessage({
    type:"word",
    content:selectedText

    //selected text could be ""
});