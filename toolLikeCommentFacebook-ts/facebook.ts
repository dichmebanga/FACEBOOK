const puppeteer = require("puppeteer");
const axios = require("axios");
const cheerio = require("cheerio");
////////////////////////////////////

const result = Math.floor(Math.random() * 100);

async function autoLoginFacebook(
  username,
  password,
  posts = "",
  comment = "",
  dontVisiable = true
) {
  /////////////////// DECLARE ////////////////////////
  const url = "https://mbasic.facebook.com";
  const browser = await puppeteer.launch({ headless: dontVisiable });
  const page = await browser.newPage();
  await page.setUserAgent(
    "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Edg/97.0.1072.71"
  );

  /////////////////// LOG ////////////////////////
  // Lắng nghe sự kiện 'request' log request
  page.on("request", async (request) => {
    console.log("Yêu cầu:", await request.method(), await request.url());
  });

  // Lắng nghe sự kiện 'response' log response
  page.on("response", async (response) => {
    console.log("Phản hồi:", response.status(), response.url());
  });

  /////////////////// LOGIN PAGE FACEBOOK ////////////////////////
  await page.goto(url);
  // Điền thông tin đăng nhập và gửi biểu mẫu
  await page.type('input[name="email"]', username);
  await page.type('input[name="pass"]', password);
  await page.click('input[name="login"]');
  // Kiểm tra xem có dính trang yêu cầu giữ đăng nhập không
  // await page.click('input[value="OK"]');
  const inputElement = await page.$('input[value="OK"]');
  inputElement && (await inputElement.click());
  // chờ trình duyệt phản hồi chuyển trang
  await page.waitForNavigation().then(() => {
    console.log("Đăng nhập thành công! >>>>>>>>>>>>>>>>>>>>>>>>>>");
  });
  // lấy cookies của phiên đăng nhập
  const cookies = await page.cookies();
  let cookieString = "";
  for (const cookie of cookies) {
    if (cookie.name && cookie.value) {
      cookieString += `${cookie.name}=${cookie.value}; `;
    }
  }
  cookieString = cookieString.trim().slice(0, -1);

  /////////////////// GO TO POST ////////////////////////
  const cleanUrl = posts.split("&eav=")[0];
  const mBasicUrl = cleanUrl.replace("www.facebook.com", "mbasic.facebook.com");
  await page
    .goto(mBasicUrl)
    .then(() =>
      console.log("Vào bài viết thành công! >>>>>>>>>>>>>>>>>>>>>>>>>>")
    );

  /////////////////// LIKE(Emo) ////////////////////////
  // await await page.click('a[href^="/a/like.php"]'); // dùng thẳng nút like
  await page.click('a[href^="/reactions/picker/"]'); // dùng danh sách nút cảm xúc
  const likeButtons = await page.$$("span"); // Lấy tất cả các phần tử <span>
  await Promise.all(
    likeButtons.map(async (likeButton) => {
      const buttonText = await page.evaluate((span) => {
        return span.textContent; // Sử dụng return để trả về giá trị từ page.evaluate()
      }, likeButton);
      if (buttonText.trim() === "Yêu thích") {
        await likeButton.click();
        console.log("Đã click vào nút Yêu thích >>>>>>>>>>>>>>>>>>>>>>>>>>");
      }
    })
  );

  /////////////////// COMMENT ////////////////////////
  await page.waitForNavigation().then(() => {
    console.log("về lại trang bài viết >>>>>>>>>>>>>>>>>>>>>>>>>>");
  });
  // Kiểm tra input, nhập nội dung và comment
  await page.type("#composerInput", comment).then(() => {
    console.log("đã nhập Comment >>>>>>>>>>>>>>>>>>>>>>>>>>");
  });
  await page.click('input[value="Bình luận"]').then(() => {
    console.log("đã gửi Comment >>>>>>>>>>>>>>>>>>>>>>>>>>");
  });

  /////////////////// CLOSE APP ////////////////////////
  await page.close();
  console.log("Exit", cookieString);
  return cookieString;
}

autoLoginFacebook(
  "kenvinmaid102@gmail.com",
  "Concat1233@",
  "https://www.facebook.com/story.php?story_fbid=pfbid031w9yka1SMMs8116Riwghrv3PuMMCAwHqnCCjXEhecmzUwWbyHdVivzbmrcp1GaPWl&id=100093299179483",
  `Quá Đã`,
  false
)
  .then(() => {
    process.exit(); // Tắt terminal sau khi log exit được hiển thị
  })
  .catch((error) => {
    console.error("Đã xảy ra lỗi:", error);
    process.exit(1); // Tắt terminal với mã lỗi 1 nếu có lỗi xảy ra
  });

//////////////////////////////////////////
/* Buff Like And Comment Or get Comment */
// async function buffLikeAndCommentUsingAPI(
//   cookie = "",
//   token = "",
//   actor_id = "",
//   doc_id = "",
//   text = ""
// ) {
//   const url = "https://www.facebook.com/api/graphql/";

//   const data = {
//     fb_dtsg: token,
//     variables: `{"input":{"attribution_id_v2":"CometPhotoRoot.react,comet.mediaviewer.photo,via_cold_start,1708938692187,304332,,,","feedback_id":"ZmVlZGJhY2s6NzkxODkzMzQ2MzAxMDI3","feedback_reaction_id":"1635855486666999","feedback_source":"MEDIA_VIEWER","is_tracking_encrypted":true,"tracking":[],"session_id":null,"actor_id":"${actor_id}","client_mutation_id":"1"},"useDefaultActor":false,"scale":2}`,

//     // variables: `{"input":{"client_mutation_id":"3","actor_id":61556724205188,"attachments":null,"feedback_id":"ZmVlZGJhY2s6MTIyMDk1ODY0NDMwMjI0MTQw","formatting_style":null,"message":{"ranges":[],"text":"test lên nè","reply_target_clicked":false,"attribution_id_v2":"CometPhotoRoot.react,comet.mediaviewer.photo,via_cold_start,1708413230532,312338,,,","vod_video_timestamp":null,"is_tracking_encrypted":true,"tracking":[],"feedback_source":"MEDIA_VIEWER","session_id":null},"inviteShortLinkKey":null,"renderLocation":null,"scale":2,"useDefaultActor":false,"focusCommentID":null}`,
//     doc_id: "6880473321999695",
//   };

//   const config = {
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//       Cookie: cookie,
//     },
//   };

//   try {
//     const datareturn = await axios.post(url, data, config);
//     console.log("datareturn", await datareturn?.data);
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

/* Get Token Facebook By Cookie */
// async function getTokenfb(cookie) {
//   let token = null;
//   let actorID = null;

//   const config = {
//     headers: {
//       Cookie: cookie,
//     },
//   };

//   try {
//     const response = await axios.get("https://www.facebook.com", config);
//     const html = response.data;
//     const $ = cheerio.load(html);

//     $("script").each((index, element) => {
//       const scriptContent = $(element).html();
//       console.log("scriptContent", scriptContent);

//       if (scriptContent && scriptContent.includes("DTSGInitialData")) {
//         const regexToken = /"DTSGInitialData":\{"token":"([^"]+)"\}/;
//         const matchToken = scriptContent.match(regexToken);

//         if (matchToken && matchToken[1]) {
//           token = matchToken[1];
//         }
//       }

//       if (scriptContent && scriptContent.includes("actorID")) {
//         const regexActorID = /"actorID":"(\d+)"/;
//         const matchActorID = scriptContent.match(regexActorID);

//         if (matchActorID && matchActorID[1]) {
//           actorID = matchActorID[1];
//         }
//       }

//       if (token && actorID) {
//         return false;
//       }
//     });
//   } catch (error) {
//     console.error("Error:", error);
//   }

//   return { token, actorID };
// }

/* MAIN RUN FUNCTION */
// async function main() {
//   const cookie = await autoLogin(
//     "kenvinmaid102@gmail.com",
//     "Concat1233@",
//     "https://mbasic.facebook.com/programmercontrollife/posts/pfbid02yD8DMRnkHTbqr5ywzxmjQJv8ofZF5BPHzmPQFzCW19TqsKskJc2Qbta7XuX6EH4El"
//   );

//   // const dataRes = await getTokenfb(cookie);
//   // console.log("cookie>>>>>>", cookie);
//   // console.log("dataRes>>>>>>", dataRes);
//   // await buffLikeAndCommentUsingAPI(
//   //   cookie,
//   //   dataRes?.token,
//   //   dataRes?.actorID,
//   //   123,
//   //   "test thử là được"
//   // );
//   console.log("thành công");
//   return;
// }
// main();
