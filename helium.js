const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");

let userMessage = "";

const API_KEY = "AIzaSyA3T2FKL_DhMGY2SCdNx9E5aYmIY2lYiO8";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Function membuat element pesan
const createMsgElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const generateResponse = async () => {
  try {
    const response = await fetch();
  } catch (error) {}
};

// Handle Form Submit
const handleFormSubmit = (e) => {
  e.preventDefault();
  userMessage = promptInput.value.trim();
  if (!userMessage) return;

  promptInput.value = "";

  const userMsgHTML = `<p class="message-text"></p>`;
  const userMsgDiv = createMsgElement(userMsgHTML, "user-message");

  userMsgDiv.querySelector(".message-text").textContent = userMessage;
  chatsContainer.appendChild(userMsgDiv);

  //   Proses loading
  setTimeout(() => {
    const botMsgHTML = ` <img src="./img/gemini.svg" class="avatar" /> <p class="message-text">Mikir bentar guyss...</p>`;
    const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
    chatsContainer.appendChild(botMsgDiv);
    generateResponse();
  }, 600);
};

promptForm.addEventListener("submit", handleFormSubmit);
