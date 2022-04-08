require("dotenv").config();
const mqtt = require("mqtt");
const config = require("./config");

const options = {
  port: process.env.MQTT_PORT,
  host: process.env.MQTT_HOST,
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
};

const client = mqtt.connect(options);

client.on("connect", function () {
  console.log("Connected");
});
const LanguageDetect = require("languagedetect");
const lngDetector = new LanguageDetect();
const _ = require("underscore");
const { TaskTimer } = require("tasktimer");
const timer = new TaskTimer(1 * 1e3);
const didYouMean = require("didyoumean2").default;
const request = require("request"),
  express = require("express"),
  { urlencoded, json } = require("body-parser"),
  app = express();

// Parse application/x-www-form-urlencoded
app.use(urlencoded({ extended: true }));

// Parse application/json
app.use(json());

// Respond with 'Hello World' when a GET request is made to the homepage
app.get("/", function (_req, res) {
  res.send("Hello World");
});

// Adds support for GET requests to our webhook
app.get("/webhook", (req, res) => {
  // Your verify token. Should be a random string.
  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});
// Creates the endpoint for your webhook
app.post("/webhook", (req, res) => {
  let body = req.body;

  // Checks if this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      // Get the sender PSID
      let senderPsid = webhookEvent.sender.id;
      console.log("Sender PSID: " + senderPsid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
      } else if (webhookEvent.postback) {
        console.log("Postback received: " + webhookEvent.postback.payload);
        handlePostback(senderPsid, webhookEvent.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});
var dict = [];
var index = 0;
for (let [key1, value1] of Object.entries(config.intent)) {
  for (let [key2, value2] of Object.entries(config.intent[key1])) {
    // console.log(value1);
    for (let [key3, value3] of Object.entries(config.intent[key1][key2])) {
      for (let [key11, value11] of Object.entries(config.device)) {
        for (let [key22, value22] of Object.entries(config.device[key11])) {
          for (let [key33, value33] of Object.entries(config.device[key11][key22])) {
            // console.log(value3, value33);
            // console.log(key1)
            // console.log(index);
            index <= 5 ? (key2 == key22 ? (key2 == 0 ? dict.push(value3 + "" + value33) : dict.push(value3 + " " + value33)) : null) : dict.push(value3);
          }
        }
      }
    }
  }
  index++;
}
console.log("dictionary loaded");
// console.log(dict);

// Handles messages events
async function handleMessage(senderPsid, receivedMessage) {
  let response, act, dev, lang;
  if (receivedMessage.text) {
    //*whitelist
    if (config.whitelist.includes(senderPsid)) {
      // if (config.whitelist.includes(senderPsid) || config.admin.includes(senderPsid)) {
      console.log("whitelist: true");
      //*check intent
      for (let [key1, value] of Object.entries(config.intent)) {
        for (let [key2, value] of Object.entries(config.intent[key1])) {
          for (let [key3, value] of Object.entries(config.intent[key1][key2])) {
            // console.log(key1,key2,key3,value);
            receivedMessage.text.toLowerCase().includes(value) ? ((act = key1), (lang = key2)) : null;
          }
        }
      }
      //*check device
      for (let [key1, value] of Object.entries(config.device)) {
        for (let [key2, value] of Object.entries(config.device[key1])) {
          for (let [key3, value] of Object.entries(config.device[key1][key2])) {
            // console.log(key1,key2,key3,value);
            receivedMessage.text.toLowerCase().includes(value) ? ((dev = key1), lang == null ? (lang = key2) : (lang += key2)) : null;
          }
        }
      }
      console.log("intent: " + act);
      console.log("device: " + dev);
      //*check language
      lang == "00" ? (lang = "0") : null;
      lang == "11" ? (lang = "1") : null;
      lang == null ? (lngDetector.detect("This is a test.", 1)[0] == "english" ? (lang = 1) : (lang = 0)) : null;
      console.log("language: " + config.lang[lang]);

      if (["turn_on", "turn_off", "toggle"].includes(act) && dev) {
        //*response
        response = {
          text: resp(act, dev, lang),
          // text: " " + config.intent[act][lang][0] + "" + config.device[dev][lang][0] + "แล้ว",
        };
        console.log(config.topic[dev][0], config.topic[dev][1][act])
        //*publish
        client.publish(config.topic[dev][0], config.topic[dev][1][act]);
      } else if (act == "settemp" && dev) {
        if (receivedMessage.text.match(/\d/g)) {
          let temp = receivedMessage.text.match(/\d/g).join("");
          console.log("temp: " + temp);
          client.publish(config.topic[dev][0], config.topic[dev][1][act] + temp);
          response = {
            text: resp(act, dev, lang),
            // text: " " + config.intent[act][lang][0] + "" + config.device[dev][lang][0] + "แล้ว",
          };
        } else {
          response = {
            text: "กรุณาระบุอุณหภูมิ",
          };
        }
      } else if (act == "state" && dev) {
        response = {
          text: " " + config.intent[act][0] + "" + config.device[dev][0],
        };
        //!
      } else if (act == "detailDevice" && dev) {
        response = {
          text: " " + config.intent[act][0] + "" + config.device[dev][0],
        };
        //!
      } else if (act == "help") {
        response = {
          text: config.responding[act][lang],
          quick_replies: [
            {
              content_type: "text",
              title: config.intent.command[lang][0],
              payload: config.intent.command[lang][0],
              image_url: "http://example.com/img/red.png",
            },
            // {
            //   content_type: "text",
            //   title: "Green",
            //   payload: "<POSTBACK_PAYLOAD>",
            //   image_url: "http://example.com/img/green.png",
            // },
          ],
        };
      } else {
        // console.log(config.responding)
        if (Object.keys(config.responding).includes(act)) {
          console.log(config.responding[act][lang]);
          response = {
            text: config.responding[act][lang],
          };
        } else {
          response = {
            text: config.responding.unknown[lang] + " หรือคุณหมายถึง '" + didYouMean(receivedMessage.text, dict) + "'",
            // text: "error",
            quick_replies: [
              {
                content_type: "text",
                title: didYouMean(receivedMessage.text, dict),
                payload: didYouMean(receivedMessage.text, dict),
                // image_url: "http://example.com/img/red.png",
              },
              // {
              //   content_type: "text",
              //   title: "Green",
              //   payload: "<POSTBACK_PAYLOAD>",
              //   image_url: "http://example.com/img/green.png",
              // },
            ],
          };
        }
      }
    } else {
      //!not wl
      response = {
        text: config.responding.no_permission,
      };
    }
  }

  // Send the response message
  callSendAPI(senderPsid, response);
}

function handlePostback(senderPsid, receivedPostback) {
  let response;

  // Get the payload for the postback
  let payload = receivedPostback.payload;

  // Set the response based on the postback payload
  if (payload === "ทำอะไรได้บ้าง") {
    response = { text: "Thanks!" };
  } else if (payload === "no") {
    response = { text: "Oops, try sending another image." };
  }
  // Send the message to acknowledge the postback
  callSendAPI(senderPsid, response);

  // handleMessage(senderPsid, receivedPostback.payload);
}

function callSendAPI(senderPsid, response) {
  // The page access token we have generated in your app settings

  // Construct the message body
  let requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: response,
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: process.env.URI_MSG,
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "POST",
      json: requestBody,
    },
    (err, _res, _body) => {
      if (!err) {
        console.log("Message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

// listen for requests :)
var listener = app.listen(3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
  let testresponse = {
    text: "Bot Stated!",
  };
  // callSendAPI(process.env.senderPsid1, testresponse);
  // console.log(JSON.parse(process.env.senderPsid1));
});

async function checkpm() {
  //pm>=5? service(pure,climate,turn_on): null;
}

async function checkair() {
  //air == on && person != home ? air = off : null;
}

function resp(q, w, e) {
  if (e == 0) {
    return config.intent[q][e][0] + "" + config.device[w][e][0] + "แล้ว";
  } else if (e == 1) {
    if (config.intent[q][e][0].slice(config.intent[q][e][0].length - 1) == "e") {
      return config.intent[q][e][0].slice(0, -1) + "ed " + config.device[w][e][0];
    } else {
      return config.intent[q][e][0] + "ed " + config.device[w][e][0];
    }
  }
  // return e == 0 ? config.intent[q][e][0] + "" + config.device[w][e][0] + "แล้ว" : config.intent[q][e][0] + "ed " + config.device[w][e][0];
}
timer.add([
  {
    id: "checkpm", // unique ID of the task
    tickInterval: 30, // run every 5 ticks (5 x interval = 5000 ms)
    totalRuns: 0, // run 10 times only. (set to 0 for unlimited times)
    callback(task) {
      // code to be executed on each run
      console.log("--------------------------------------------------------");
      console.log(`${task.id} task has run ${task.currentRuns} times, at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`);
      checkpm();
    },
  },
  {
    id: "checkair", // unique ID of the task
    tickDelay: 1, // 1 tick delay before first run
    tickInterval: 30, // run every 10 ticks (10 x interval = 10000 ms)
    totalRuns: 0, // run 2 times only. (set to 0 for unlimited times)
    callback(task) {
      // code to be executed on each run
      console.log(`${task.id} task has run ${task.currentRuns} times, at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`);
      checkair();
    },
  },
]);
// timer.start();
