const express = require('express');
// const Nexmo = require('nexmo');
var request = require('request');
var ticketExtensionInfo;
/*
const nexmo = new Nexmo({
    apiKey : , 
    apiSecret : , 
    applicationId : , 
    privateKey : 
})
*/
const server = express();
const bodyParser = require('body-parser');
const port = '8003'; 
const hostname = '127.0.0.1';
const WHATSAPP_NUMBER =  '447418342149';
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

function sendMessageToPhone( phoneNumber, messageText){



    request.post(
        'https://sandbox.nexmodemo.com/v0.1/messages/',
        {    headers : {
            'Authorization' : 'Bearer f790alexaonehahjeh', 
            'Content-Type' : 'application/json'
            },
            json: {
            "from":{
               "type":"whatsapp",
               "number": WHATSAPP_NUMBER
            },
            "to":{
               "type":"whatsapp",
               "number": phoneNumber
            },

             "message": {
                 "content" : {
                     "type" : "text",
                     "text" : messageText
                 }
             }
        
     } 
    }
        ,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }
      
        }
        
    );

 
}
function messageUserIfInternal( ticketInfo, userId) {
    // check whether this is an internal account
    request.get( {
        'headers' : {

            'Authorization' : 'Basic cGhpbC5ob2xjb21iZUBuZXhtby5jb206NUVzYW1lZTIxMDk/YWw=', 
            'Content-Type' : 'application/json'
            },
        'url': 'https://nexmo1443765028.zendesk.com/api/v2/users/' + userId + '.json'
        }, 
        (error, response, body) => {
            if(error) {
                return console.dir(error);
            }
            userInfo = JSON.parse(body);
            if( userInfo.user.organization_id == 360175244492 ) {
                // we know they are Vonage / Nexmo
                if( userInfo.user.phone  ) {
                    console.log(userInfo.user.phone);
                     sendMessageToPhone( userInfo.user.phone,
                        `The ${ticketExtensionInfo.priority} priority ticket ${ticketExtensionInfo.ticketId}: "${ticketExtensionInfo.title}" for ${ticketExtensionInfo.requester_email} has been updated by ${ticketExtensionInfo.assignee}. The latest comment: "${ticketExtensionInfo.latestComment}"`);

   
                    
                }
            }

        }
    ); 
}
// 
function messsageInternalCCs( ticketId) {
    // get all the numbers for sales associated with the ticket
    request.get( {
        'headers' : {
    
            'Authorization' : 'Basic cGhpbC5ob2xjb21iZUBuZXhtby5jb206NUVzYW1lZTIxMDk/YWw=', 
            'Content-Type' : 'application/json'
            },
        'url': 'https://nexmo1443765028.zendesk.com/api/v2/tickets/' + ticketId + '.json'
        },
        (error, response, body) => {
            if(error) {
                return console.dir(error);
            }
            ticketInfo = JSON.parse(body);
            console.dir(ticketInfo);
            CollabIds = ticketInfo.ticket.collaborator_ids;
            for( i=0;i <CollabIds.length; i++) {
                messageUserIfInternal( ticketInfo ,CollabIds[i] );

            }

            




        
        });

        // get the CCed users
        // for each one, check if it has a vonage or nexmo email address and phone number
        // if it does, send WA to that phone number


}

server.post('/', function(req, res) {
     ticketExtensionInfo = req.body;

    const message = ticketExtensionInfo.event == 'Created' ? 
    `Hello from Nexmo Support! The ticket ${ticketExtensionInfo.ticketId} has been created. ` :
    `Hello from Nexmo Support! The ticket ${ticketExtensionInfo.ticketId} has been Updated. The latest update was from  ${ticketExtensionInfo.assignee}. The latest comment: ${ticketExtensionInfo.latestComment}`
    

    console.log(ticketExtensionInfo);
    console.log(ticketExtensionInfo.ticketId);
    console.log(ticketExtensionInfo.requesterNumber);
    var whatsappBody = [{ "type": "whatsapp", "number": ticketExtensionInfo.requesterNumber },
    { "type": "whatsapp", "number": WHATSAPP_NUMBER },
    {
      "content": {
        "type": "text",
        "text": "This is a WhatsApp Message sent from the Messages API"
      }
    }];

    console.log(whatsappBody);
/*
    request.post(
        'https://sandbox.nexmodemo.com/v0.1/messages/',
        {    headers : {
            'Authorization' : 'Bearer f790alexaonehahjeh', 
            'Content-Type' : 'application/json'
            },
            json: {
            "from":{
               "type":"whatsapp",
               "number": WHATSAPP_NUMBER
            },
            "to":{
               "type":"whatsapp",
               "number": ticketExtensionInfo.requesterNumber
            },


            
            // "message":{
            //    "content":{
            //       "type":"template",
            //       "template":{
            //          "name":"8f90403f_80a2_a4d5_6c83_3af2f5732287:tracking_branch_opted_in_en_ar",
            //          "fallback_locale": "en_us",
            //          "parameters":[
            //             {
            //                "default": `The ticketID is ${ticketInfo.ticketId}` 
            //             },
            //             {
            //                "default": `From: ${ticketInfo.assignee}`
            //             },
            //             {
            //                "default": `The latest comment: ${ticketInfo.latestComment}`
            //             }
            //          ]
            //       }
            //    }
            // }

             "message": {
                 "content" : {
                     "type" : "text",
                     "text" : message
                 }
             }
        
     } 
    }
        ,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }
        }
    );
*/
sendMessageToPhone(ticketExtensionInfo.requesterNumber, message );
if (ticketExtensionInfo.priority == 'High' || ticketExtensionInfo.priority == 'Urgent' ) {
    messsageInternalCCs(ticketExtensionInfo.ticketId);

}

    res.status(200).send("OK");
});

server.get('/', (req, res) => {
    res.status(200).send(req.body);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});