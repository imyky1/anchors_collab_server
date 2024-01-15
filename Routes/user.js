const express = require("express");
const qs = require("querystring");
const axios = require("axios");
const { error } = require("console");
const router = express.Router();
const Influencer = require("../models/Inluencer");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
const {
  emailServiceForInfluencerActivation,
} = require("../services/emailService");
const {
  InfluencerActivationTemplatesonEventSide,
} = require("../services/Templates/EmailTemplates");
const informLarkBot = require("../services/LarkService");

router.get("/getAll", async (req, res) => {
  let success = false;
  try {
    const all_users = await Influencer.find({}).select(["name", "refered_to"]);
    if (all_users) {
      success = true;
      return res.status(200).json({ success, all_users });
    } else {
      return res.status(404).json("cannot fetch the users data");
    }
  } catch (e) {
    return res.status(422).json({ success, error: e.message });
  }
});

router.post("/saveinfo", fetchuser, async (req, res) => {
  let success = false;
  try {
    const founduser1 = await Influencer.findById(req.user.id);
    if (!founduser1) {
      return res.status(422).json({ success, error: "User not found" });
    }

    const wNum = async () => {
      let wNumber = 1;
      let allInfluencer = await Influencer.find({ status: 1 })
        .sort({ createdAt: 1 })
        .select({ _id: 1 });
      for (let i = 0; i < allInfluencer.length; i++) {
        const e = allInfluencer[i];
        if (e._id.toString() === req.user.id.toString()) {
          break;
        } else {
          wNumber++;
        }
      }

      return wNumber;
    };

    let refered;

    // Check referral code (unchanged)
    if (req.body.refered_code) {
      refered = await Influencer.findOne({
        referal_code: req.body.refered_code,
      });
      if (!refered) {
        return res.status(422).json({ success, error: "Invalid referal code" });
      }
    }

    // Conditional referral code generation and update

    if (req.body.mobile) {
      // Generate referral code only if mobile is present
      let referal_code = req.body.mobile.slice(-4);
      let foundCode = await Influencer.findOne({ referal_code , _id:{$ne:req.user.id} });
      while (foundCode) {
        referal_code = parseInt(foundCode.referal_code, 10) + 1;
        referal_code = referal_code.toString().slice(-4);
        foundCode = await Influencer.findOne({ referal_code });
      }

      // Update referral code in the database
      await Influencer.findByIdAndUpdate(founduser1?._id, {
        ...req.body,
        referal_code,
      });

    } else {
      // Update other details without referral code
      await Influencer.findByIdAndUpdate(founduser1?._id, req.body);
    }

    // Update referred user information (unchanged)
    if (refered) {
      await Influencer.findByIdAndUpdate(refered._id, {
        $push: { refered_to: founduser1?._id },
      });
      await Influencer.findByIdAndUpdate(founduser1?._id, {
        refered_by: refered._id,
      });
    }

    if(req.body.is_verified){
      let user = await Influencer.findById(req.user.id)
      let rank = await wNum()

      // welcome email ----------------------
      emailServiceForInfluencerActivation(user?.email,user?.name,InfluencerActivationTemplatesonEventSide[0],`https://collab.anchors.in?refer=${user?.referal_code}`,rank)
    }

    success = true;
    return res.json({ success });
  } catch (e) {
    return res.status(422).json({ success, error: "Error saving user info" });
  }
});

// login or signup user and provide token for the same
router.post("/loginUser", async (req, res) => {
  let success = false;
  try {
    const { profile, name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success, error: "Empty data" });
    }

    let user = await Influencer.findOne({ email: email });

    // exisiting user --------------------
    if (user) {
      if (user?.status === 1) {
        Influencer.findByIdAndUpdate(user?._id, { profile });

        // storing data in the token ----------------------------
        const data = {
          user: {
            id: user._id,
            status: user.status,
          },
        };

        const jwtToken = jwt.sign(data, process.env.JWT_SECRET);

        success = true;
        return res.json({ success, token: jwtToken, type: "existing" });
      }

      return res.status(422).json({ success, error: "Influencer not allowed" });
    }

    // new user ---------------------
    user = await Influencer.create({
      name,
      email,
      profile,
    });

    // storing data in the token ----------------------------
    const data = {
      user: {
        id: user._id,
        status: user.status,
      },
    };

    let allUser = await Influencer.find({status:1})

    await informLarkBot(
      process.env.LARK_WAITLIST_NOTIFY,
      `Great News! Collab Lead Generated`,
      [`Name - ${user.name}`, `Time - ${new Date(user?.createdAt)}`, `User Number : ${allUser?.length}`]
      
    );

    const jwtToken = jwt.sign(data, process.env.JWT_SECRET);
    success = true;

    return res.json({ success, token: jwtToken });
  } catch (e) {
    return res.status(422).json({ success, error: "error saving user info" });
  }
});

// login or signup user and provide token for the same
router.get("/getLoginUserData", fetchuser, async (req, res) => {
  let success = false;
  try {
    let user = await Influencer.findById(req.user.id).select([
      "name",
      "email",
      "linkedinProfile",
      "profile",
      "mobile",
      "status",
      "is_verified",
      "referal_code",
    ]);

    // exisiting user --------------------
    if (!user || user.status !== 1) {
      return res
        .status(422)
        .json({ success, logout: true, error: "Not Allowed" });
    }

    success = true;

    return res.json({
      success,
      data: user,
      firstTime: !user?.is_verified,
    });
  } catch (e) {
    return res
      .status(422)
      .json({ success, error: "error in fetching user data" });
  }
});

module.exports = router;
