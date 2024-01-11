const express = require("express");
var AWS = require("aws-sdk");
const router = express.Router();
const randomstring = require("randomstring");


// Config -------------------------------------------------
const SNSConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    accessSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "ap-south-1",
  };
  AWS.config.update(SNSConfig);



// send otp using sns service
router.get("/sendMsg", async (req, res) => {
    const confirmationCode = randomstring.generate({
      length: 6,
      charset: "numeric",
    });
  
    var params = {
      Message: `Anchors Collab ${req.query.message} Verification code is ${confirmationCode} and is valid for 2 minute`,
      PhoneNumber: req.query.number,
      MessageAttributes: {
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: req.query.subject,
        },
      },
    };
  
    var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
      .publish(params)
      .promise();
  
    publishTextPromise
      .then(function (data) {
        res.end(
          JSON.stringify({
            MessageID: data.MessageId,
            code: parseInt(confirmationCode) + 145626,
          }) // to hide to code
        );
      })
      .catch(function (err) {
        res.end(JSON.stringify({ Error: err }));
      });
  });



  module.exports = router;