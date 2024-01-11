const express = require("express");
const qs = require('querystring');
const axios = require('axios');
const { error } = require("console");
const router = express.Router();
const Influencer = require('../../models/Inluencer')

router.get('/linkedin', (req, res) => {
  const redirectURI = encodeURIComponent(`${process.env.SERVER_URL}/auth/linkedin/callback`);
  const state = 'random_state_value';
  const scope = 'email profile openid';

  const linkedInAuthURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${redirectURI}&scope=${scope}`;

  res.json({ redirectURL: linkedInAuthURL }); // Send the LinkedIn authorization URL back to the frontend
});

// Callback URL from LinkedIn
router.get('/linkedin/callback', async (req, res) => {
  const { code, state } = req.query;

  // Verify state here if needed

  // Exchange authorization code for access token
  try {
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      qs.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.SERVER_URL}/auth/linkedin/callback`, // Same as in the initial request
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    return res.redirect(process.env.CLIENT_URL + `/check?token=${accessToken}`);
  } catch (error) {
    console.error('Error during authentication:', error);
    return res.status(500).send('Internal Server Error');
  }
});


// login the data and using it to create user account ------------------
router.get("/linkedin/success", async (req, res) => {
  try {
    //   Use the access token to fetch user data from LinkedIn API
    const userData = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${req.query.token}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0', // LinkedIn API version
      },
    });

    return res.send(userData.data);
  } catch (error) {
    
  }
})

module.exports = router;
