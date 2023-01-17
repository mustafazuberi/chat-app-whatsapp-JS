import { initializeApp } from "https://www.gstatic.com/firebasejs/9.11.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  addDoc,
  getDocs,
  where,
  query,
} from "https://www.gstatic.com/firebasejs/9.11.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyD3-oZllAaDQCGmp5CA-t0eY4059oMofsE",
  authDomain: "whatsapp-11d3a.firebaseapp.com",
  projectId: "whatsapp-11d3a",
  storageBucket: "whatsapp-11d3a.appspot.com",
  messagingSenderId: "390845015726",
  appId: "1:390845015726:web:baeba5be1b99771db76f3f",
  measurementId: "G-RNYV8G9Q9M",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// sigin wth google
window.signInFirebase = async function () {
  try {
    var provider = new GoogleAuthProvider();
    const result = await auth;
    await signInWithPopup(auth, provider);
    await addUserToDB();
    await swal("Congratulations!", "Loggined successfully!", "success");
  } catch (e) {
    console.log(e.message);
  }
};

// // KeepLoggined
function keeploggined() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      console.log("User is loggined");
      console.log(auth);
      // changes when user is loggined
      document.getElementById("user-name").classList.remove("d-none");
      document.getElementById("user-name").innerHTML =
        auth.currentUser.displayName;
      document.getElementById("profile-user").src = auth.currentUser.photoURL;
      document.getElementById("lnkLogout").classList.remove("d-none");
      document.getElementById("lnkSignIn").classList.add("d-none");
      document.getElementById("sigin-in-btn").classList.add("d-none");

      getUsers();
    } else {
      console.log("User is signed out");
      document.getElementById("user-name").classList.add("d-none");
      document.getElementById("lnkLogout").classList.add("d-none");
      document.getElementById("lnkSignIn").classList.remove("d-none");
      document.getElementById("profile-user").src = "images/profile.jpg";
      document.getElementById("sigin-in-btn").classList.remove("d-none");
    }
  });
}

// Logout
async function logoutFirebase() {
  auth.signOut();
  location.reload();
  await swal("Congratulations!", "Logged out!", "success");
}

// adding users to database
async function addUserToDB() {
  const uid = auth.currentUser.uid;
  var userProfile = { email: "", name: "", photoURL: "" };
  userProfile.email = auth.currentUser.email;
  userProfile.name = auth.currentUser.displayName;
  userProfile.photoURL = auth.currentUser.photoURL;

  return setDoc(doc(db, "users", uid), userProfile);
}

// getting Users RealTime to show in chats
function getRealTimeUsers(callback) {
  onSnapshot(collection(db, "users"), (querySnapshot) => {
    const users = [];
    querySnapshot.forEach((doc) => {
      if (doc.id !== auth.currentUser.uid) {
        users.push({ id: doc.id, ...doc.data() });
      }
    });

    callback(users);
  });
}

// checking room if yes then return if not found so this function ca add in database and return
async function checkRoom(friendId) {
  try {
    const currentUserId = auth.currentUser.uid;
    const users = { [friendId]: true, [currentUserId]: true };
    const q = query(
      collection(db, "chatrooms"),
      where(`users.${friendId}`, "==", true),
      where(`users.${currentUserId}`, "==", true)
    );
    let room = {};
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      room = doc.data();
      room.id = doc.id;
    });
    if (!room.id) {
      return addDoc(collection(db, "chatrooms"), {
        users,
        createdAt: Date.now(),
        lastMessage: {},
      });
    }
    // console.log(room);

    return room;
  } catch (e) {
    console.log(e);
  }
}

// Sending msg to database
async function sendMessageToDB(text, myRoomId) {
  var Messageid = myRoomId + Date.now();
  let currentTime = formatAMPM(new Date());
  const message = {
    text: text,
    createdAt: currentTime,
    userId: auth.currentUser.uid,
    photoURL: auth.currentUser.photoURL,
  };
  const DocRef = doc(
    db,
    "chatrooms",
    `${myRoomId}`,
    "messages",
    `${Messageid}`
  );
  await setDoc(DocRef, message);

}

// Messages DOM and firebase work is not seperate whole function is at firebase page
async function getMessagesFromDb(roomId) {
  const q = query(collection(db, "chatrooms", `${roomId}`, "messages"));
  onSnapshot(q, (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    let messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";
    for (let item of messages) {
      // image
      var msg;
      if (item.text.indexOf("base64") != -1) {
        msg = `<img src = "${item.text}" class = "img-fluid" />`;
      } else {
        msg = item.text;
        document.getElementById("last-msg").innerHTML = item.text;
      }

      if (item.userId == auth.currentUser.uid) {
        messagesDiv.innerHTML += `
    <div class="row justify-content-end">

                            <div class="col-6 col-sm-7 col-md-7">
                                <p class="sent ">${msg} <span class="time ">${item.createdAt} </span></p>
                            </div>
                            <div class="col-2 col-sm-1 col-md-1"><img src="${item.photoURL}" class="chat-pic" alt="">
                            </div>
                        </div>
    `;
      } else {
        messagesDiv.innerHTML += `
                <div class="row">
                <div class="col-2 col-sm-1 col-md-1"><img src="${item.photoURL} " class="chat-pic" alt="">
                </div>
                <div class="col-6 col-sm-7 col-md-7">
                    <p class="recieve"> ${msg} <span class="time "> ${item.createdAt}
                        </span></p>

                </div>
            </div>
               
                `;

      }
    }
  });
}

// Function for getting current Time for passing in database messagess
function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

export {
  keeploggined,
  logoutFirebase,
  getRealTimeUsers,
  checkRoom,
  sendMessageToDB,
  getMessagesFromDb,
  auth,
};
