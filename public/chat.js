var socket = io();

const messages = document.querySelector('#messages');
const messageTemplate = document.querySelector("#message-template").innerHTML;
const formField = document.querySelector("#message");
const submitButton = document.querySelector("#submit");
const sendLocationButton = document.querySelector("#sendLocation");
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebar = document.querySelector("#sidebar");
const usersListTemplate = document.querySelector("#users-template").innerHTML;

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
  //New message element
  const $newMessage = messages.lastElementChild;

  //Height of new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //Visible Heoght
  const visibleHeight = messages.offsetHeight;

  //Height of messages container
  const containerHeight = messages.scrollHeight;

  //How far have I scrolled?
  const scrollOffset = messages.scrollTop; + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
}

socket.emit("join", {username, room}, (error) => {
  if(error){
    alert(error);
    location.assign('/')
  }
})

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {...message});
  messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on("roomData", ({users, room}) => {
    const html = Mustache.render(usersListTemplate, {users, room});
    sidebar.innerHTML = html;
})

socket.on("locationMessage", (message) => {
  const location = message;
  const html = Mustache.render(locationTemplate, {...location});
  messages.insertAdjacentHTML('beforeend', html);
})

const emitMessageCallback = (event) => {
  event.preventDefault();
  const message = document.querySelector("#message").value;
  socket.emit("sendMessage", message);
  resetFormField();
};

const sendLocationCallback = (event) => {
  event.preventDefault();
  if (navigator.geolocation) {
    //disable button
    sendLocationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      socket.emit("sendLocation", { latitude, longitude }, () => {
        console.log("Location shared");
        sendLocationButton.removeAttribute('disabled');
        resetFormField();
      });
    });
  } else {
    alert("Geolocation not supported by browser");
  }
};

const resetFormField = () => {
  formField.value = '';
}

submitButton.addEventListener("click", emitMessageCallback);

sendLocationButton.addEventListener("click", sendLocationCallback);
