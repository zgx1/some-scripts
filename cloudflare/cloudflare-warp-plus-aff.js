// Fake register for referrer to get warp plus bandwidth
const referrer = "7383b251-29b5-4586-9604-b906293c6e5f
";
const timesToLoop = 10;
const retryTimes = 5;

const https = require("https");
const zlib = require("zlib");

async function init() {
  for (let i = 0; i < timesToLoop; i++) {
    if (await run()) {
      console.log(i + 1, "OK");
    } else {
      console.log(i + 1, "Error");
      for (let r = 0; r < retryTimes; r++) {
        if (await run()) {
          console.log(i + 1, "Retry #" + (r + 1), "OK");
          break;
        } else {
          console.log(i + 1, "Retry #" + (r + 1), "Error");
          if (r === retryTimes - 1) {
            return;
          }
        }
      }
    }
  }
}

async function run() {
  return new Promise(resolve => {
    const install_id = genString(11);
    const postData = JSON.stringify({
      key: `${genString(43)}=`,
      install_id: install_id,
      fcm_token: `${install_id}:APA91b${genString(134)}`,
      referrer: referrer,
      warp_enabled: false,
      tos: new Date().toISOString().replace("Z", "+07:00"),
      type: "Android",
      locale: "zh_CN"
    });

    const options = {
      hostname: "api.cloudflareclient.com",
      port: 443,
      path: "/v0a745/reg",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Host: "api.cloudflareclient.com",
        Connection: "Keep-Alive",
        "Accept-Encoding": "gzip",
        "User-Agent": "okhttp/3.12.1",
        "Content-Length": postData.length
      }
    };

    const req = https.request(options, res => {
      const gzip = zlib.createGunzip();
      // const buffer = [];
      res.pipe(gzip);
      gzip
        .on("data", function(data) {
          // buffer.push(data.toString());
        })
        .on("end", function() {
          // console.dir(JSON.parse(buffer.join("")));
          resolve(true);
        })
        .on("error", function(e) {
          // console.error(e);
          resolve(false);
        });
    });

    req.on("error", error => {
      // console.error(error);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

function genString(length) {
  // https://gist.github.com/6174/6062387#gistcomment-2651745
  return [...Array(length)]
    .map(i => (~~(Math.random() * 36)).toString(36))
    .join("");
}

init();
