console.log('popup active');

//Initiate variables
var definitionData;

//Array of index numbers in definitionData that have acceptable shortdef attributes
var arrayOfAcceptableDefinitions = new Array();

var printedDefinitionsCount = 0;

var currentWord;

//Send message to background script saying popup active, telling it to inject page.js into activeTab
chrome.runtime.sendMessage({
    type:"popup status",
    content:"active"
});

console.log('sentmessage');


//Listener for receiving the word from the page.js script.
chrome.runtime.onMessage.addListener(messageReceived);

//Listener for pressing <enter>, attached to the input element id="userInput"
$('#userInput').keydown(userSearch);

function userSearch(keydownEvent){
    if (keydownEvent.which == 13){ //enter
        let searchedWord = $('#userInput').val();
        updateDefinition(searchedWord);

        $('#moreDefinitionsButton').css("display", "none");

    }

}

//Set more definitions button display to none by default. Changed in updateDefinition()
$('#moreDefinitionsButton').css("display", "none");


//Receives word response message from page script and invokes updateDefinition.
function messageReceived(message, sender, response){
    if (message.type === "word"){

        updateDefinition(message.content);
            
        }
}

function suggestionClicked(event){

    var triggeredSuggestion = $(event.target);
    $('#moreDefinitionsButton').css("display", "none");

    updateDefinition(triggeredSuggestion.attr("word"));

    $('#userInput').val(triggeredSuggestion.attr("word"));

}


//Input new word; definition will be retrieved and invoke writeDefInPopup().
function updateDefinition(word){
    //Reset counters
    printedDefinitionsCount = 0;

    //Write word into the search bar
    $('#userInput').val(word);


    //Gets JSON data for word and initiates dataReceived function.
    currentWord = word;

    getDefinitionData(word, dataReceived);

    function dataReceived(data, textStatus, jqXHR){
        //data is an array of objects, and will be length 0 if empty
        definitionData = data;

        console.log(data);


        //Empty definitionDivision
        $('#definitionDivision').empty();
        $('#didYouMeanDiv').empty();

        //If data is invalid and is an empty array,
        if(data.length == 0){
            $('#definitionDivision').prepend('<p><strong>No results for: </strong> <i>' +  currentWord + '</i></p>');
            return;
        }

        //Did you mean function
        //each span element represents one suggestion, and it's id is 'suggestion[num]' and it has the attr "word" 
        if (typeof data[0].shortdef === "undefined"){

            $('#didYouMeanDiv').append('<span><strong>Did you mean: </strong></span>')


            for (var numInSuggestionsArray = 0; numInSuggestionsArray < data.length; numInSuggestionsArray++){

                let idValue = "suggestion" + numInSuggestionsArray;

                $('#didYouMeanDiv').append('<span class="suggestion" id=' + idValue + ' style="color:blue;text-decoration:underline;cursor:pointer;">'+ data[numInSuggestionsArray] + "</span>");
                $('#didYouMeanDiv').append('<span>   </span>');

                $('#' + idValue).attr("word", data[numInSuggestionsArray]);

                //Add click listeners for each span
                $('#' + idValue).click(suggestionClicked);
            }

            return;
        }



        //Get acceptable definitions (as some shortdef elements are empty arrays)
        arrayOfAcceptableDefinitions = [];

        for (let numInArray = 0; numInArray < data.length; numInArray++){

            if (data[numInArray].shortdef.length != 0){
                arrayOfAcceptableDefinitions.push(numInArray);
            }
        }


        //If there is more than 1 definition, display see more button
        if(arrayOfAcceptableDefinitions.length > 1){
            $('#moreDefinitionsButton').css("display", "block");
        }

        
        
        writeDefinitionInPopup(word, data, arrayOfAcceptableDefinitions[0]);
    }
}

//Input the word and a function to execute after getting the JSON. The function receives the JSON data.
function getDefinitionData(word, dataReceivedFunction){

    //get json data from merriam-webster

    let url = 'https://dictionaryapi.com/api/v3/references/collegiate/json/';
    url += word;
    url += '?key=c9e2b04a-555d-4638-95e7-52b0433b55ee'
    
    //get definition data
    $.getJSON(url, dataReceivedFunction);

}

//Input word, JSON data and the number in the data array (that is, which definition it is) and write it on the popup.
function writeDefinitionInPopup(word, data, numInDataArray){
    //Add word to popup
    $("#definitionDivision").append('<h2>' + word + '</h2>');

    //append part of speech
    $("#definitionDivision").append('<h3><i>' + data[numInDataArray].fl + '</i></h3>');

    //append all shortdefinitions
    for (var i = 1; i <= data[numInDataArray].shortdef.length; i++){

        $('#definitionDivision').append('<p>' + i + ": " + data[numInDataArray].shortdef[i-1] + "</p>");

    }

    //Update printedDefinitionsCount
    printedDefinitionsCount ++;

}

//Adding more definitions
function writeMoreDefinitionsInPopup(word, data, numInDataArray, entryNumber){
    //Add word to popup
    $("#definitionDivision").append('<h2>' + word + " (" + entryNumber + ")" + '</h2>');

    //append part of speech
    $("#definitionDivision").append('<h3><i>' + data[numInDataArray].fl + '</i></h3>');

    //append all shortdefinitions
    for (var i = 1; i <= data[numInDataArray].shortdef.length; i++){

        $('#definitionDivision').append('<p>' + i + ": " + data[numInDataArray].shortdef[i-1] + "</p>");

    }

    //Update printedDefinitionsCount
    printedDefinitionsCount ++;

}

//Add listener for See more definitions button.
$('#moreDefinitionsButton').click(generateMoreDefinitions);

function generateMoreDefinitions(){


    writeMoreDefinitionsInPopup(currentWord, definitionData, arrayOfAcceptableDefinitions[printedDefinitionsCount], printedDefinitionsCount);

    //check if no more definitions
    if(printedDefinitionsCount == arrayOfAcceptableDefinitions.length){
        //Make button invisible
        $('#moreDefinitionsButton').css("display", "none");
    }


}





