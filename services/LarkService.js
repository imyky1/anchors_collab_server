// Mesagging the lark bot for various operations -------

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

  
const informLarkBot = async (url, headerText, divsArray) => {
  if (process.env.DEVELOPEMENT_ENVIRONMENT === "local") {
    // stops lark bot in development server
    console.log("Stopping Lark")
    return true;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      msg_type: "interactive",
      card: {
        config: {
          wide_screen_mode: true,
          enable_forward: true,
        },
        header: {
          title: {
            content: headerText,
            tag: "plain_text",
          },
        },
        elements: divsArray.map((e, i) => {
          return {
            tag: "div",
            text: {
              content: e,
              tag: "lark_md",
            },
          };
        }),
      },
    }),
  });
  const json = await response.json();
  return json.StatusMessage;
};

module.exports = informLarkBot;
