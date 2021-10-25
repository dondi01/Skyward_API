// CODICE SCRITTO DA Alessandro Donadi, donadi.ale@gmail.com, alessandro.donadi@mail.polimi.it, +39 3935580661

/*
Nota bene:
PER IL DEPLOYMENT
 - deploy as web app
 - mettere "me" in "esegui come"
 - mettere "chiunque" in "utenti autorizzati ..."
 - prendere nota del URL della web app e scriverlo qui, servirà for future reference

https://script.google.com/macros/s/AKfycbyCotVu1Op1xApXsfClcgkERQ4pi6hW6YfAppup16mbGocp67Yj_slH7Z1ApUu55IVj/dev

 EVENTUALI LINK UTILI:
 https://github.com/slackapi/template-action-and-dialog/blob/master/how_it_works.md 
 https://api.slack.com/reference/manifests <-- utile per capire cosa c'è dopo in questo nota bene
 https://api.slack.com/legacy/interactive-message-field-guide#action_fields
 https://api.slack.com/legacy/interactive-message-field-guide

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
settings:
  interactivity:
    is_enabled: true
    request_url: https://script.google.com/macros/s/AKfycbwlNDmbQQmtUqsqMPlq7H5Rmp77-65a25j2Ovqq5df4cuh0Aa_daUs8bL0RtXRP5ZxP/dev <-- ASSICURARSI CHE QUEL URL SIA QUELLO DEL DEPLOYMENT CORRENTE ALTRIMENTI SI ROMPE L'API
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false


 */




function getGlobals(global_id){// sembra che apps script non contempli variabili globali, per cui qui risiedono la versione fai da te
  var globals = [];
  globals[0] = 6;//riporre qui il numero colonne
  globals[1] = 'Risposte';// qui va il nome del foglio in cui ci stanno i dati
  globals[2] = 'Bearer xapp-1-A02JC6J2PJA-2629042217429-c5ea61ffac92081dc642283f07426a1c1d4591874ede7cf0b537e057ed4b027e'; // token autorizzazione slack, per info --> https://slack.com/intl/en-it/help/articles/215770388-Create-and-regenerate-API-tokens
  globals[3] = 'https://hooks.slack.com/services/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'; //url a cui mandare la post request di slack, per info --> https://api.slack.com/messaging/webhooks
  globals[4] = 'https://docs.google.com/spreadsheets/d/1UiCmZAVvtd7MWmxB5IvMJIR30FCF6S0M2bGXUuEkhBs/edit?resourcekey#gid=1167803401'; //link alla google sheet affiliata a questo apps script
  globals[5] = 8; //numero riferimento colonna ID
  globals[6] = 'https://script.google.com/macros/s/AKfycbzaXx63Q1-Xesi23eq4MofUONSZczLDvytETGkPmz4/dev'; // link del deployment
  globals[7] = 7;// numero riferimento colonna stato approvazione
  return globals[global_id];
}


function getNumRows(){// questa funzione conta il numero di righe che sono occupate 
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Risposte');
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


function getLastDataRow(sheet){//questa funzione ritorna un array con i dati dell'ultima cosa inserita nel google sheet
  var lastRow = sheet.getLastRow();
  console.log(getNumRows());
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
            "value": "click_me_123",
            "url" : getGlobals(6) + "?approval=true&id=" + id
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "Boccia"
            },
            "style": "danger",
            "value": "click_me_123",
            "url" : getGlobals(6) + "?approval=false&id=" + id
          }
        ]
      }
    ]
  }
  return payload;
}

function slack_webhook(payload, data, ID){ // questa funzione fa l'HTTP POST request, ergo ciò che manda dati a slack
  
  console.log(payload); 
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

function pushApprovalStatus(approval_status, id, sheet){
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

function doGet(e) {// funzione il cui nome è FONDAMENTALE CHE NON VENGA CAMBIATO siccome google manda le HTTP get request in input a questa funzione
  var params = JSON.stringify(e);
  var output = pushApprovalStatus(e.parameter.approval,e.parameter.id, getInputSheet());
  return HtmlService.createHtmlOutput(output + params);// è FONDAMENTALE che ritorni questo, non modificare, vedere -->  https://developers.google.com/apps-script/guides/web
}

function sendSlackJSON(){ // questa è la funzione equivalente al main in C, quella che viene eseguita ad ogni update della sheet, configurabile da "attivatori" nella sidebar a sinistra
  var sheet = getInputSheet();
  var ID = addID(sheet);
  var row_array = getLastDataRow(sheet);
  slack_webhook(getPayload(row_array, ID), row_array[0][0], ID);
}
