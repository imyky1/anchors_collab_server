const zeptomail = require("zeptomail");

const url = process.env.EMAIL_URL;
const token = process.env.ZOHOMAIL_TOKEN;

const emailServiceForInfluencerActivation = async (
  to,
  cname,
  templateData,
  referrallink,
  rank
) => {
  // stops function in development server
  if (process.env.DEVELOPEMENT_ENVIRONMENT === "local") {
    // to = "singhyuvraj0506@gmail.com";
    console.log("Stopping Activation Email");
    // return true;
  }

  let client = new zeptomail.SendMailClient({ url, token });

  try {
    const response = await client.sendMailWithTemplate({
      mail_template_key: templateData?.tempName,
      bounce_address: "ravi@zepto.anchors.in",
      from: {
        address: `collab@anchors.in`,
        name: `anchors | Collab`,
      },
      to: [
        {
          email_address: {
            address: to,
            name: cname,
          },
        },
      ],
      merge_info: {
        cname: cname,
        rank,
        referrallink,
      },
    });

    console.log(response)

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false }
  }
};

module.exports = {
  emailServiceForInfluencerActivation,
};
