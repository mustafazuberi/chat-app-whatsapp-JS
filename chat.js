import {
  keeploggined,
  logoutFirebase,
  getRealTimeUsers,
  checkRoom,
  sendMessageToDB,
  getMessagesFromDb,
  auth,
} from "./firebase.js";





window.startChat = async function (friendKey, friendName, friendPhoto) {
  document.getElementById("chatPanel").removeAttribute("style");
  document.getElementById("divStart").setAttribute("style", "display:none;");
  hideChatList();
  document.getElementById("friend-name").innerHTML = friendName;
  document.getElementById("friend-name").innerHTML = friendName;
  document.getElementById("friend-profile").src = friendPhoto;
  await checkRoom(friendKey);
  let currentRoom = await checkRoom(friendKey);
  document.getElementById("idToHide").innerHTML = currentRoom.id;
  getMessagesFromDb(currentRoom.id);
};




window.sendMessage = async function () {
  let message = document.getElementById("msg-inp").value;
  if (document.getElementById("msg-inp").value == " ") {
    return;
  }
  await sendMessageToDB(message, document.getElementById("idToHide").innerHTML);
  document.getElementById("msg-inp").value = " ";
  document.getElementById("msg-inp").focus();
  document
    .getElementById("messages")
    .scrollTo(0, document.querySelector("#messages").scrollHeight);
};






// Image
window.chooseImage = function () {
  document.getElementById("imageFile").click();
};
window.sendImage = function (e) {
  var file = e.files[0];
  if (!file.type.match("image.*")) {
    alert("please select image only");
  } else {
    var reader = new FileReader();
    reader.addEventListener(
      "load",
      async function () {
        await sendMessageToDB(
          reader.result,
          document.getElementById("idToHide").innerHTML
        );
        document.getElementById("msg-inp").value = " ";
        document.getElementById("msg-inp").focus();
        document
          .getElementById("messages")
          .scrollTo(0, document.querySelector("#messages").scrollHeight);
      },
      false
    );
    if (file) {
      reader.readAsDataURL(file);
    }
  }
};
///////////////////////////////////////////////////////////



// Managing on mobile view and desktop view
window.showChatList = function () {
  document.getElementById("side-1").classList.remove("d-none", "d-md-block");
  document.getElementById("side-2").classList.add("d-none");
};
window.hideChatList = function () {
  document.getElementById("side-1").classList.add("d-none", "d-md-block");
  document.getElementById("side-2").classList.remove("d-none");
};
window.showEmoji = function () {
  document.getElementById("emoji").classList.remove("d-none");
};
window.hideEmoji = function () {
  document.getElementById("emoji").classList.add("d-none");
};
window.getEmoji = function (emojiItem) {
  document.getElementById("msg-inp").value += emojiItem.innerHTML;
};






///////////////////////////////////////////////////////////
// loading all emojis
window.loadAllEmoji = function () {
  var smileyEmojis = "";
  for (var i = 128512; i <= 128540; i++) {
    smileyEmojis += `  <a href="#" onclick="getEmoji(this)" style="text-decoration: none; font-size: 25px;">&#${i};</a>`;
  }
  document.getElementById("smiley").innerHTML = smileyEmojis;
  ///

  var heartEmojis = "";
  for (var i = 128147; i <= 128159; i++) {
    heartEmojis += `  <a href="#" onclick="getEmoji(this)" style="text-decoration: none; font-size: 25px;">&#${i}; </a>`;
  }
  heartEmojis += `  <a href="#" onclick="getEmoji(this)" style="text-decoration: none; font-size: 25px;">&#128420; </a>`;
  document.getElementById("skin").innerHTML = heartEmojis;

  // ///
};
loadAllEmoji();






// auth state change
keeploggined();





// logout
window.logout = function () {
  return logoutFirebase();
};





// showing users in chat list
window.getUsers = function () {
  getRealTimeUsers((users) => {
    const usersElem = document.getElementById("friendChats");
    for (let item of users) {
      usersElem.innerHTML += `
                        <list class="list-group-item list-group-item-action" data-bs-dismiss = "modal" onclick="startChat( '${item.id}','${item.name}','${item.photoURL}')">
                            <div class="row">
                                <div class="col-2 col-sm-2 col-md-2 col-lg-2"> <img src="${item.photoURL}"
                                        class="friend-pic" alt=""></div>
                                <!-- <div class="col-1 col-sm-1  col-md-1 col-lg-1"></div> -->
                                <div class="col-9 col-sm-9  col-md-9 col-lg-9"
                                    style="cursor: pointer; margin-left: 15px;">
                                    <div class="name">${item.name}</div>
                                    <div class="under-name d-none" id="last-msg"></div>
                                </div>
                            </div>
                        </list>
`;
    }
  });
};
