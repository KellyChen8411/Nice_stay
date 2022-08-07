let owner_id;
let owner_role; //此message頁面是租客身份
let owner_name;
let talker_role;
let user_room; //存user room name的全域變數
const socket = io({ autoConnect: false });
let activeuser_id; //現在正在跟哪一個user聊天

//element need to manipulate
const user_outter = $("#user_outter");
const message_outter = $("#message_outter");

//log out function
function Logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

if (window.location.pathname === "/message.html") {
  owner_role = 1;
  talker_role = 2;
} else {
  owner_role = 2;
  talker_role = 1;
}

let token = localStorage.getItem("token");
let headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
};

$(async function () {
  const resultFetch = await fetch(
    `/api/1.0/users/checkLogin?updateToken=${false}`,
    { headers }
  );
  const userInfo = await resultFetch.json();

  if (resultFetch.status === 200) {
    //切換登入出鍵
    $("#logoutBtn").toggleClass("DSHide", false); //remove class
    $("#loginBtn").toggleClass("DSHide", true); //add class
    $("#logoutBtn").click(Logout);

    if (userInfo.role === 2) {
      $("#landlordContainer").text("切換至出租模式");
    }

    owner_id = userInfo.user_id;
    owner_name = userInfo.name;
    $("#owner").text(`Hi, ${owner_name}`);

    let user_room = `${userInfo.user_id}_${owner_role}`;

    //connect to socket
    socket.connect();
    //join room
    socket.emit("user_join", { user_room }, (response) => {
      const receiver_list = response.receiver;
      if (receiver_list.length === 0) {
        alert("暫無訊息");
        window.location.href = "/";
      } else {
        //render user
        const user_con = $('<div id="user_con"></div>');
        receiver_list.forEach((user, index) => {
          let user_item;
          if (index === 0) {
            activeuser_id = user.receiver_id;
            user_item = $(
              `<div class="user_active user" data-receiverID="${user.receiver_id}"><h3 class="user"><i class="fas fa-users"></i><p>${user.user_name}</p></h3><div class="notification hide"></div></div>`
            );
            // user_con.append($(`<div class="user_active user" data-receiverID="${user.receiver_id}"><h3 class="user"><i class="fas fa-users"></i><p>${user.user_name}</p></h3><div class="notification hide"></div></div>`));
            socket.emit("readAllMessage", {
              owner_id,
              talker_id: activeuser_id,
              owner_role,
            });
          } else {
            //確認是否有未讀訊息
            if (user.read_status !== null) {
              user_item = $(
                `<div class="user" data-receiverID="${user.receiver_id}"><h3 class="user"><i class="fas fa-users"></i><p>${user.user_name}</p></h3><div class="notification"></div></div>`
              );
            } else {
              user_item = $(
                `<div class="user" data-receiverID="${user.receiver_id}"><h3 class="user"><i class="fas fa-users"></i><p>${user.user_name}</p></h3><div class="notification hide"></div></div>`
              );
            }
            // user_con.append($(`<div class="user" data-receiverID="${user.receiver_id}"><h3 class="user"><i class="fas fa-users"></i><p>${user.user_name}</p></h3><div class="notification hide""></div></div>`));
          }

          user_con.append(user_item);
        });
        user_outter.append(user_con);
        //render message with first user
        const message_list = response.message;
        renderMessage(message_list);
        message_outter[0].scrollTop = message_outter[0].scrollHeight;
        $("#user_con").click(changetalker);
      }
    });
  } else {
    alert("請先登入");
    window.location.href = "/login.html";
  }
});

//當更換聊天人對象
function changetalker(e) {
  let talker_id;
  if (e.target.nodeName !== "DIV") {
    talker_id = parseInt(e.target.closest("div").dataset.receiverid);
  } else {
    talker_id = parseInt(e.target.dataset.receiverid);
  }
  //更換聊天對象
  $(`div[data-receiverid=${activeuser_id}]`).toggleClass("user_active", false);
  activeuser_id = talker_id;
  $(`div[data-receiverid=${activeuser_id}]`).toggleClass("user_active", true);
  let hasUnread = !$(`div[data-receiverid=${activeuser_id}]`)
    .find("div")
    .hasClass("hide");
  if (hasUnread == true) {
    //更新訊息為已讀
    socket.emit("readAllMessage", {
      owner_id,
      talker_id: activeuser_id,
      owner_role,
    });
    //hide unread notification
    $(`div[data-receiverid=${activeuser_id}]`)
      .find("div")
      .toggleClass("hide", true);
  }

  //取得與此對象的聊天訊息
  socket.emit("getMessage", { owner_id, talker_id, owner_role }, (response) => {
    const message_list = response.message;
    renderMessage(message_list);
    message_outter[0].scrollTop = message_outter[0].scrollHeight;
  });
}

function renderMessage(message_list) {
  message_outter.empty();
  const message_con = $('<div id="message_con"></div>');
  message_list.forEach((message) => {
    message_con.append(
      `<div class="message"><p class="meta">${message.name}<span>${moment(
        parseInt(message.created_at)
      ).format("YYYY-MM-DD HH:mm")}</span></p><p class="text">${
        message.content
      }</p></div>`
    );
  });
  message_outter.append(message_con);
}

$("button").click(sendMessage);

function sendMessage() {
  let content = $("#msg").val();
  if (content === "") {
    return;
  }
  if (content.replace(/\s/g, "") === "") {
    $("#msg").val("");
    return;
  }

  $("#msg").val("");
  const created_at = Date.now();
  socket.emit("privateMessage", {
    content,
    owner_id,
    owner_role,
    talker_id: activeuser_id,
    talker_role,
    owner_name,
    created_at,
  });
  pushMessage(owner_name, content, created_at);
}

function pushMessage(user_name, content, created_at) {
  $("#message_con").append(
    `<div class="message"><p class="meta">${user_name}<span>${moment(
      created_at
    ).format(
      "YYYY-MM-DD HH:mm"
    )}</span></p><p class="text">${content}</p></div>`
  );
  // Scroll down
  message_outter[0].scrollTop = message_outter[0].scrollHeight;
}

//收傳來的訊息
socket.on("privateMessage", (messageInfo) => {
  let { sender_name, sender_id, content, created_at, insertMsgID } =
    messageInfo;
  if (sender_id === activeuser_id) {
    //將訊息推至對話框
    pushMessage(sender_name, content, created_at);
    //將此訊息更新為已讀
    socket.emit("readMessage", insertMsgID);
  } else {
    $(`div[data-receiverID=${sender_id}]`)
      .find("div")
      .toggleClass("hide", false); //將未讀notification顯示出來
  }
});
