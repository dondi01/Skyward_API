// @ts-nocheck
// CODICE SCRITTO DA Alessandro Donadi, donadi.ale@gmail.com, alessandro.donadi@mail.polimi.it, +39 3935580661

/*
Nota bene:
PER IL DEPLOYMENT
 - deploy as web app
 - mettere "me" in "esegui come"
 - mettere "chiunque" in "utenti autorizzati ..."
 - prendere nota del URL della web app e scriverlo qui, servirà for future reference

https://script.google.com/macros/s/AKfycbxvvM9Bhe0V7mDrkmTH0OLqq_e8BWS_OATAgRyuapchLRYguI63hkMjTR33Z54MMa-6/exec


 EVENTUALI LINK UTILI:
 https://github.com/slackapi/template-action-and-dialog/blob/master/how_it_works.md 
 https://api.slack.com/reference/manifests <-- utile per capire cosa c'è dopo in questo nota bene
 https://api.slack.com/legacy/interactive-message-field-guide#action_fields
 https://api.slack.com/legacy/interactive-message-field-guide
 https://api.slack.com/apps/A02JC6J2PJA/interactive-messages? <-- questo link per qualche motivo è difficilissmo da trovare

 SLACK APP MANIFEST:
_metadata:
  major_version: 1
  minor_version: 1
display_information:
  name: Skyward API
  description: API di skyward, lato slack
  background_color: "#3a5fcf"
features:
  bot_user:
    display_name: Sheet Bot
    always_online: true
oauth_config:
  scopes:
    bot:
      - incoming-webhook
      - chat:write
settings:
  interactivity:
    is_enabled: true
    request_url: https://script.google.com/macros/s/AKfycbywDPKnWuReUvRITtnPq3nQFV9rYS3aSJ5DdiI4q1x1hOaAE1AN2iO69FLYxQPaSkk/exec
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false


 */




function getGlobals(global_id){// sembra che apps script non contempli variabili globali, per cui qui risiedono la versione fai da te
  var globals = [];
  globals[0] = 6;//riporre qui il numero colonne
  globals[1] = 'Risposte';// qui va il nome del foglio in cui ci stanno i dati
  globals[2] = 'Bearer xoxb-2613117331923-2631060429538-KiNE7a7ZHrbTEjhNWZ9SzrsL'; // token autorizzazione slack, per info --> https://slack.com/intl/en-it/help/articles/215770388-Create-and-regenerate-API-tokens
  globals[3] = 'https://hooks.slack.com/services/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'; //url a cui mandare la post request di slack, per info --> https://api.slack.com/messaging/webhooks
  globals[4] = 'https://docs.google.com/spreadsheets/d/1UiCmZAVvtd7MWmxB5IvMJIR30FCF6S0M2bGXUuEkhBs/edit?resourcekey#gid=1167803401'; //link alla google sheet affiliata a questo apps script
  globals[5] = 8; //numero riferimento colonna ID
  globals[6] = 'https://script.google.com/macros/s/AKfycbw7ZcSKlRHHWv8YW_LkMw8AxYeueVcE64EJ1Smwl7RhFyn8Na_znYvCupoULnkb_F6m/exec'; // link del deployment
  globals[7] = 7;// numero riferimento colonna stato approvazione
  globals[8] = 'xoxb-2613117331923-2631060429538-KiNE7a7ZHrbTEjhNWZ9SzrsL'; // token senza bearer
  return globals[global_id];
}


function getNumRows(){// questa funzione conta il numero di righe che sono occupate 
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(getGlobals(1));
  var i = 1;
  var temp_range = sheet.getRange(1,1);//la funzione getRange è abbastanza complessa, consiglio di andare a leggere la doc. tecnica a riguardo se serve
  var row_array = temp_range.getValues();
  while(row_array != ''){
    temp_range = sheet.getRange(i,1);
    row_array = temp_range.getValues();
    i++;
  }
  i=i-2;
  return i;
}

function debug_testGPClogger(){
  console.log("fuck you");
}


function getLastDataRow(sheet){//questa funzione ritorna un array con i dati dell'ultima cosa inserita nel google sheet
  var lastRow = sheet.getLastRow();
  //console.log(getNumRows());
  var range = sheet.getRange(getNumRows(), 1, 1, getGlobals(0));
  var row_array =range.getValues();
  return row_array;
}

function getInputSheet(){// questa funziona ritorna la sheet che 
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(getGlobals(1));
  return sheet;
}

function row_to_json(row_array){
  var json_data = JSON.stringify(row_array);
  return json_data;
}

function getPayload(row_array, id){
  /*
  questa funzione crea il payload che vuole slack:
    - c'è un editor per crearne uno --> https://app.slack.com/block-kit-builder/
    - c'è la doc tecnica di slack api che sipega come funziona --> https://api.slack.com/block-kit
    - l'array row_array è bidimensionale, se definiamo row_array[x][y], y è la coordinata da cambiare per accedere al contenuto delle varie colonne
  */

   var payload = 
  {
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Nuova richiesta d'Aquisto:\n*<" + getGlobals(4) + "| Excel richieste d'acquisto>*"
        }
      },
      {
        "type": "section",
        "fields": [
          {
            "type": "mrkdwn",
            "text": "*ID:* ("+ id+")"
          },
          {
            "type": "mrkdwn",
            "text": "*Dipartimento:*\n"+ row_array[0][1]
          },
          {
            "type": "mrkdwn",
            "text": "*Quando:*\n"+row_array[0][0]
          },
          {
            "type": "mrkdwn",
            "text": "*Costo (senza IVA):*\n" + row_array[0][3]
          },
          {
            "type": "mrkdwn",
            "text": "*Costo (con IVA):*\n" + row_array[0][4]
          },
          {
            "type": "mrkdwn",
            "text": "*Progetto:*\n" + row_array[0][2]
          },
          {
            "type": "mrkdwn",
            "text": "*Link eventuale allegato:*\n"+ row_array[0][5]
          }
        ]
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "Approva",
              
            },
            "style": "primary",
            "value": "approved"/*,
            "url" : getGlobals(6) + "?approval=true&id=" + id*/
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "Boccia"
            },
            "style": "danger",
            "value": "refused"/*,
            "url" : getGlobals(6) + "?approval=false&id=" + id*/
          }
        ]
      }
    ]
  }
  //console.log("PAYLOAD: " + payload)
  return payload;
}

function slack_webhook(payload, data, ID){ // questa funzione fa l'HTTP POST request, ergo ciò che manda dati a slack
  
  //console.log(payload); 
  var options = {
    'method' : 'post',
    'Content-Type' : 'application/json',
    'payload' : JSON.stringify(payload), 
    'muteHttpExaptions' : 'false',
    'Authorization' : getGlobals(2)
  }
  console.log(UrlFetchApp.fetch(getGlobals(3), options).getContentText());
}

function addID(sheet){//questa funzione aggiunge gli ID di riferimento delle varie entry
  var ID = getNumRows()
  sheet.getRange(ID,getGlobals(5)).setValue(ID);
  return ID;
}

function pushGetApprovalStatus(approval_status, id, sheet){// questa funzione al momento non è usata
  var output = "";
  if(approval_status){
    sheet.getRange(id,getGlobals(7)).setValue("Approvato");
    output = "L'aquisto è stato approvato con successo";
  }else{
    sheet.getRange(id,getGlobals(7)).setValue("Bocciato");
    output = "L'aquisto è stato bocciato con successo";
  }
  return output;
}

function pushPostApprovalStatus(approval_value, id, sheet){
  var approval_status = "error";
  if(approval_value == "approved"){
    sheet.getRange(id,getGlobals(7)).setValue("Approvato");
    //console.log("approvato");
    approval_status = "approvato";
  }else if(approval_value == "refused"){
    sheet.getRange(id,getGlobals(7)).setValue("Bocciato");
    //console.log("bocciato");
    approval_status = "bocciato";
  }else{
    console.log("errore in pushPostApprovalStatus");
    sheet.getRange(id,getGlobals(7)).setValue("Errore: approval_value = " + approval_value);
  }
  return approval_status;
}

function getId(input_text){
  var length = input_text.length;
  var i = 0;
  var id_array = [];
  var not_found = true;
  while(i<length && not_found){
    if(input_text[i] == "("){
      var j = i;
      do{
        id_array[j-i] = input_text[j+1];
        j++;
      }while(input_text[j+1] != ")");
      not_found = false;
    }
    i++;
  }
  var id =  id_array.join("");
  return id;
}

function doGet(e) {// funzione il cui nome è FONDAMENTALE CHE NON VENGA CAMBIATO siccome google manda le HTTP get request in input a questa funzione
  var params = JSON.stringify(e);
  var output = pushGetApprovalStatus(e.parameter.approval,e.parameter.id, getInputSheet());
  return HtmlService.createHtmlOutput(output + params);// è FONDAMENTALE che ritorni questo, non modificare, vedere -->  https://developers.google.com/apps-script/guides/web
}

function getUserName(input_text){
  var length = input_text.length;
  var i = 0;
  var id_array = [];
  var not_found = true;
  while(i<length && not_found){
    if(input_text[i] == "@"){
      var j = i;
      do{
        id_array[j-i] = input_text[j+1];
        j++;
      }while(input_text[j+1] != ">");
      not_found = false;
    }
    i++;
  }
  var user_name =  id_array.join("");
  console.log("user found --> id:" + user_name);
  return user_name;
}

function getUserPresence(current_blocks, user_name){
  var found = false;
  var length = current_blocks.length;
  if(length > 3){
    for(var i = 3; length > i ; i++){
      //console.log("comparing " + getUserName(current_blocks[i].text.text) + " to " + user_name);
      if(getUserName(current_blocks[i].text.text) == user_name){
        //console.log("user matches current user replying to the message")
        found = true;
      }
    }
  }
  return found;
}

function getApprovalStatus(input_text){
  var length = input_text.length;
  var i = 0;
  var id_array = [];
  var not_found = true;
  while(i<length && not_found){
    if(input_text[i] == "*"){
      var j = i;
      do{
        id_array[j-i] = input_text[j+1];
        j++;
      }while(input_text[j+1] != "*");
      not_found = false;
    }
    i++;
  }
  var user_name =  id_array.join("");
  console.log("found " + user_name);
  return user_name;
}

function getNumPositiveResponses(current_blocks, approval_status){
  var tot = 0;
  var length = current_blocks.length;
  if(length<3){
    return 0;
  }else{
    for(var i = 3; length > i; i++){
      //console.log(""getApprovalStatus(current_blocks[i].text.text))
      if(getApprovalStatus(current_blocks[i].text.text) == "approvato"){
        tot++;
      }
    }
  }
  if(approval_status == "approvato"){
    tot++;
  }
  console.log("number of positive responses is " + tot);
  return tot;
}

function getBlocksWithUsers(current_blocks, user_name, approval_status){
  if(getUserPresence(current_blocks, user_name)){
    console.log("user already replied, triggering modal...");
    /*


    L'idea era di aprire una finestra di dialogo per dire "errore! ..." ma francamente non è troppo importante, basta che un utente
    che ha già risposto non sia in grado di farlo di nuovo


    var block_string = JSON.stringify(current_blocks);
    var modal = 
    {
      "type": "modal",
      "submit": {
        "type": "plain_text",
        "text": "Submit",
        "emoji": true
      },
      "close": {
        "type": "plain_text",
        "text": "Cancel",
        "emoji": true
      },
      "title": {
        "type": "plain_text",
        "text": "Errore",
        "emoji": true
      },
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*Hai già espresso la tua opinione, non puoi cambiare il tuo voto*"
          }
        }
      ]
    } 
   // var trimmed_block_string = block_string.slice(0,-1);
    //return JSON.parse(trimmed_block_string + JSON.stringify(modal) + '');
    return modal;*/
  }else{
    console.log("user not found, adding it to feedback");
    var block_string = JSON.stringify(current_blocks);// user block va inserito prima dei due caratteri finali di questa stringa, perchè gli ultimi due caratteri sono una parentesi quadra e una grafa
    //console.log("before slicing --> " + block_string);
    var trimmed_block_string = block_string.slice(0,-1);
    //console.log("slice output --> " + trimmed_block_string);
    if("approvato" == approval_status){
      var emoji = ":thumbsup:";
    }else{
      var emoji = ":thumbsdown:"; 
    }

    var user_block = trimmed_block_string + ',{"type": "section","text": {"type": "mrkdwn","text": " ' + emoji + "   <@" + user_name + "> ha *" + approval_status + '*"}}' + ']';
    //console.log("user_block --> " + user_block);
    return JSON.parse(user_block);
  } 
}


function doPost(e){
  try{

    // lavorazione JSON
    var json_input_payload = JSON.parse(e.parameter.payload);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(getGlobals(1));
    var id = getId(json_input_payload.message.blocks[1].fields[0].text);
    var approval_status = pushPostApprovalStatus(json_input_payload.actions[0].value, id, sheet);
    var user_name = json_input_payload.user.id; 

    var current_blocks = json_input_payload.message.blocks;

    var response_url = json_input_payload.response_url;

     var non_stringified_payload = {};

    if(getNumPositiveResponses(current_blocks, approval_status)>1){
      console.log("deleting message...");
      non_stringified_payload = {// parametri per modifica o cancellazione del messaggio https://api.slack.com/interactivity/handling#payloads
      //'delete_original': true <-- per cancellare messaggi, se si cancella messaggi lasciare solo questo campo
      "replace_original": true,
      "text" : "l'acquisto " + id + " è stato approvato"
      }
    }else{
      console.log("i may be adding another user");
      non_stringified_payload = {// parametri per modifica o cancellazione del messaggio https://api.slack.com/interactivity/handling#payloads
      "replace_original": true,
      'blocks' : getBlocksWithUsers(current_blocks, user_name, approval_status)
      }
    }

    var output_payload = {
      'method' : 'post',
      'Content-Type' : 'application/json',
      'payload' : JSON.stringify(non_stringified_payload),
      'muteHttpExaptions' : 'false',
      'Authorization' : getGlobals(2)
    };
    console.log("feedback from slack-->  " + UrlFetchApp.fetch(response_url, output_payload).getContentText());
  }catch(e){
    console.log("error catch: " + e.message + " stack: "+ e.stack);
  }
  return HtmlService.createHtmlOutput();
}
//



function sendSlackJSON(){ // questa è la funzione equivalente al main in C, quella che viene eseguita ad ogni update della sheet, configurabile da "attivatori" nella sidebar a sinistra
  var sheet = getInputSheet();
  var ID = addID(sheet);
  var row_array = getLastDataRow(sheet);
  slack_webhook(getPayload(row_array, ID), row_array[0][0], ID);
}