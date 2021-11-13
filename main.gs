// @ts-nocheck
// CODICE SCRITTO DA Alessandro Donadi, donadi.ale@gmail.com, alessandro.donadi@mail.polimi.it

/*
Nota bene:
PER IL DEPLOYMENT
 - deploy as web app
 - mettere "me" in "esegui come"
 - mettere "chiunque" in "utenti autorizzati ..."
 - prendere nota del URL della web app
 - andare a modificare l'app manifest di slack e incollare l'url precedente nel campo "request_url" e salvare l'app manifest

NEL CASO SI DOVESSE REINSTALLARE L'APP (in slack) O COMUNQUE RIGENERARE ALCUNI TOKEN/LINK:
 - generare un token su slack e aggiornare le variabili globals appropriate

NEL CASO IN CUI DOVESSE CAMBIARE IL NOME DEL FOGLIO:
 - cambiare la var globals appropriata (1)

NEL CASO IN CUI DOVESSE CAMBIARE IL QUORUM:
 - modificare la var globals 7

NEL CASO IN CUI DOVESSERO ESSERE AGGIUNTI/RIMOSSI CAMPI DEL GOOGLE FORM:
 - aggiornare i campi globals 0, 5, 7, 10






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
    request_url: https://www.randomsite.com
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false


 */




function getGlobals(global_id){// sembra che apps script non contempli variabili globali, per cui qui risiedono la versione fai da te
  var globals = [];
  globals[0] = -1;//riporre qui il numero colonne
  globals[1] = 'placeholder';// qui va il nome del foglio in cui ci stanno i dati
  globals[2] = 'Bearer xoxb-00000000000-00000000000-000000000000000000000000'; // token autorizzazione slack, per info --> https://slack.com/intl/en-it/help/articles/215770388-Create-and-regenerate-API-tokens
  globals[3] = 'https://www.randomsite.com'; //url a cui mandare la post request di slack, per info --> https://api.slack.com/messaging/webhooks
  globals[4] = 'https://www.randomsite.com'; //link alla google sheet affiliata a questo apps script
  globals[5] = -1; //numero riferimento colonna ID
  globals[6] = 'https://www.randomsite.com'; // link del deployment
  globals[7] = -1;// numero riferimento colonna stato approvazione
  globals[8] = 'xoxb-00000000000-00000000000-000000000000000000000000'; // token senza bearer
  globals[9] = -1; // quorum minimo superato il quale viene approvato 
  globals[10] = -1; // numero riferimento colonna email
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

function getPayload(row_array, id){
  /*
  questa funzione crea il payload che vuole slack:
    - c'è un editor per crearne uno --> https://app.slack.com/block-kit-builder/
    - c'è la doc tecnica di slack api che sipega come funziona --> https://api.slack.com/block-kit
    - l'array row_array è bidimensionale, se definiamo row_array[x][y], y è la coordinata da cambiare per accedere al contenuto delle varie colonne
  */
  console.log("VAR DUMP: ");
  console.log(JSON.stringify(row_array, null, 2));
  console.log(row_array[0][13]);
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
            "text": "*Quando:*\n"+ row_array[0][0]
          },
          {
            "type": "mrkdwn",
            "text": "*Dipartimento/Progetto:*\n"+row_array[0][1]
          },
          {
            "type": "mrkdwn",
            "text": "*Richiedente:*\n" + row_array[0][5]
          },
          {
            "type": "mrkdwn",
            "text": "*Descrizione:*\n" + row_array[0][8]
          },
          {
            "type": "mrkdwn",
            "text": "*Spedizione:*\n" + row_array[0][7] + "\n" + row_array[0][11]
          },
          {
            "type": "mrkdwn",
            "text": "*Costo (senza IVA):*\n" + row_array[0][2] + " " + row_array[0][14]
          },
          {
            "type": "mrkdwn",
            "text": "*Costo (con IVA):*\n" + row_array[0][3] + " " + row_array[0][14]
          },
          {
            "type": "mrkdwn",
            "text": "*Sito acquisto:*\n"+ row_array[0][4] + "\n" + row_array[0][13]
          },
          {
            "type": "mrkdwn",
            "text": "*Link pagina di acquisto:*\n*<"+ row_array[0][6] +"| pagina >*"
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

function pushGetApprovalStatus(approval_status, id, sheet){// questa funzione al momento non è usata, serviva per scrivere nella google sheet il verdetto del consiglio nel caso in cui arrivasse una richiesta GET
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

function pushPostApprovalStatus(approval_value, id, sheet){// questa funzione scrive il verdetto nel google form partendo dai dati arrivati in richiesta POST
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


function extractNumFromTxt(input_text, start_char, end_char){// questa funzione estrae un numero da input_text, quello compreso tra il carattere start_char e end_char, questi ultimi non sono compresi
  var length = input_text.length;
  var i = 0;
  var id_array = [];
  var not_found = true;
  while(i<length && not_found){
    if(input_text[i] == start_char){
      var j = i;
      do{
        id_array[j-i] = input_text[j+1];
        j++;
      }while(input_text[j+1] != end_char);
      not_found = false;
    }
    i++;
  }
  var id =  id_array.join("");
  return id;
}
/*
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
}*/

/*
function doGet(e) {// funzione il cui nome è FONDAMENTALE CHE NON VENGA CAMBIATO siccome google manda le HTTP get request in input a questa funzione
// funzione attualmente in disuso, 
  var params = JSON.stringify(e);
  var output = pushGetApprovalStatus(e.parameter.approval,e.parameter.id, getInputSheet());
  return HtmlService.createHtmlOutput(output + params);// è FONDAMENTALE che ritorni questo, non modificare, vedere -->  https://developers.google.com/apps-script/guides/web
}
*/
/*
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
}*/

function getUserPresence(current_blocks, user_name){// verifica se un utente è già presente analizzando lo JSON mandato da slack (N.B. cercare "block" in slack api per maggiori informazioni), naviga il JSON e confronta gli id presenti, se è presente ritorna true
  var found = false;
  var length = current_blocks.length;
  if(length > 3){
    for(var i = 3; length > i ; i++){
      if(extractNumFromTxt(current_blocks[i].text.text, "@", ">") == user_name){
        //console.log("user matches current user replying to the message")
        found = true;
      }
    }
  }
  return found;
}

function getApprovalStatus(input_text){// analizza una stringa che contiene il verdetto e lo estrae
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

function getNumPositiveResponses(current_blocks, approval_status, user_name){ // conta il numero di risposte che hanno approvato l'acquisto
  var tot = 0;
  var length = current_blocks.length;
  if(length<3){
    return 0;
  }else{
    for(var i = 3; length > i; i++){
      //console.log(""getApprovalStatus(current_blocks[i].text.text))
      if(getApprovalStatus(current_blocks[i].text.text) == "approvato"){
        tot++;
        console.log("DEBUG tot (if): " + tot);
      }
    }
  }
  if(approval_status == "approvato"  && !getUserPresence(current_blocks, user_name)){
    tot++;
    console.log("DEBUG current approval status is: " + tot);
  }
  console.log("DEBUG number of positive responses is " + tot);
  return tot;
}

function getBlocksWithUsers(current_blocks, user_name, approval_status){// se l'utente non è già presente concatena la sua approvazione o bocciatura
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

function getRowById(id){// seleziona una riga del google sheet in base all'id
  var sheet = getInputSheet();
  //console.log(getNumRows());
  var range = sheet.getRange(id, 1, 1, getGlobals(0));
  var row_array =range.getValues();
  return row_array;
}

function doPost(e){// funzione che si esegue ogni volta che arriva una richiesta post, il nome non va modificato, per maggiori informazioni: https://developers.google.com/apps-script/guides/web
  try{

    // lavorazione JSON
    var json_input_payload = JSON.parse(e.parameter.payload);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(getGlobals(1));
    var id = extractNumFromTxt(json_input_payload.message.blocks[1].fields[0].text, "(", ")");
    var approval_status = pushPostApprovalStatus(json_input_payload.actions[0].value, id, sheet);
    var user_name = json_input_payload.user.id; 

    var current_blocks = json_input_payload.message.blocks;

    var response_url = json_input_payload.response_url;

     var non_stringified_payload = {};

    if(getNumPositiveResponses(current_blocks, approval_status, user_name)>getGlobals(9)){
      var row_array = getRowById(id);
      sendEmailApproval(row_array[0][getGlobals(10)], row_array)      
      
      console.log("deleting/modifing message...");
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

function sendEmailApproval(email, row_array){ // funzione che manda un email in caso di approvazione a chi ha compilato il form
  var subject = "Acquisto ID: " + row_array[0][getGlobals(5)-1] + " è stato approvato dal consiglio direttivo";
  var body = "RIEPILOGO DI COSA E' STATO APPROVATO: \n" + "data e ora: " + row_array[0][0] + "\ndipartimento/progetto: " + row_array[0][1] + "\ncosto senza IVA: " + row_array[0][2] + "\ncosto con IVA: " + row_array[0][3] + "\nsito da cui fare l'acquisto: " + row_array[0][4] + "\nindirizzo email: " + row_array[0][5] + "\nLink al sito: " + row_array[0][6] + "\nSpedizione: " + row_array[0][7] + "\nDescrizione: " + row_array[0][8] + "\nQuantità: " +  row_array[0][9] + "\nNote: " + row_array[0][10];
  try{
    MailApp.sendEmail(email, subject ,body);
    console.log("DEBUG email sent at " + email);
  }catch(error){
    console.log("ERROR, email not sent, email: " + email + " subject: " + subject + "body: " + body + " error: " + error);
  }
  
}

function sendSlackJSON(){ // questa è la funzione equivalente al main in C, quella che viene eseguita ad ogni update della sheet, configurabile da "attivatori" nella sidebar a sinistra
  var sheet = getInputSheet();
  var ID = addID(sheet);
  var row_array = getLastDataRow(sheet);
  slack_webhook(getPayload(row_array, ID), row_array[0][0], ID);
}