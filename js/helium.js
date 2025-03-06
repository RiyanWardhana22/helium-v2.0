const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const fileInput = promptForm.querySelector("#file-input");
const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper");

let typingInterval, controller;
let chatHistory = [];
let userData = { message: "", file: {} };

const API_KEY = "AIzaSyA3T2FKL_DhMGY2SCdNx9E5aYmIY2lYiO8";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const saveLocalStorage = () => {
  const chatsHTML = chatsContainer.innerHTML;
  localStorage.setItem("savedChats", chatsHTML);
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
};

const loadLocalStorage = () => {
  const savedChats = localStorage.getItem("savedChats");
  const savedChatHistory = localStorage.getItem("chatHistory");
  if (savedChats) {
    chatsContainer.innerHTML = savedChats;
    document.body.classList.add("chats-active");
  }
  if (savedChatHistory) {
    chatHistory = JSON.parse(savedChatHistory);
  }
};

loadLocalStorage();

// CUSTOM KNOWLEDGE HELIUM
const normalizeText = (text) => text.toLowerCase().trim().replace(/\s+/g, " ");
const checkCustomKnowledge = (userQuestion) => {
  const normalizedQuestion = normalizeText(userQuestion);

  if (window.customKnowledge) {
    for (const key in window.customKnowledge) {
      const mainKey = window.customKnowledge[key];
      const normalizedKey = normalizeText(key);
      if (normalizedQuestion === normalizedKey) {
        return respondWithCustomKnowledge(mainKey.response);
      }
      if (Array.isArray(mainKey.variants)) {
        for (const variant of mainKey.variants) {
          if (normalizedQuestion === normalizeText(variant)) {
            return respondWithCustomKnowledge(mainKey.response);
          }
        }
      }
    }
  }
  return false;
};

const respondWithCustomKnowledge = (response) => {
  const botMsgHTML = `
    <svg class="avatar" width="30px" height="30px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0zM9.356 19.803v5.744h3.42v-2.325l-.006-.188a3.42 3.42 0 00-3.414-3.231zm3.302-13.11h-3.42v7.6l.005.188a3.42 3.42 0 003.415 3.232h4.916l.17.008a1.71 1.71 0 011.54 
      1.702v5.89h3.419v-7.6l-.006-.2a3.419 3.419 0 00-3.412-3.22h-4.918l-.147-.006a1.71 1.71 0 01-1.562-1.703v-5.89zm9.928.236h-3.42v2.325l.005.187a3.42 3.42 0 003.415 3.232V6.93z"/>
    </svg>
    <p class="message-text loading">...</p>
  `;
  const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
  chatsContainer.appendChild(botMsgDiv);
  scrollToBottom();
  chatsContainer.scrollTo({
    top: chatsContainer.scrollHeight,
    behavior: "smooth",
  });
  document.body.classList.add("hide-message");

  setTimeout(() => {
    const textElement = botMsgDiv.querySelector(".message-text");
    typingEffect(response, textElement, botMsgDiv);
  }, 500);

  return true;
};

// Function membuat element pesan
const createMsgElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  if (classes.includes("bot-message")) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message-container");
    const messageText = div.querySelector(".message-text");
    if (messageText) {
      messageContainer.appendChild(messageText);
    }
    const copyButton = document.createElement("button");
    copyButton.classList.add("copy-message-btn");
    copyButton.innerHTML = "<i class='bx bxs-copy'></i>";
    copyButton.onclick = () => copyMessage(messageText);

    messageContainer.appendChild(copyButton);
    div.appendChild(messageContainer);
  }
  return div;
};

// Function Copy Message
const copyMessage = (messageElement) => {
  const textToCopy = messageElement.textContent || messageElement.innerText;
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      const copyButton = messageElement
        .closest(".message-container")
        .querySelector(".copy-message-btn");
      copyButton.innerHTML = `<i class='bx bx-check'></i> Copied!`;
      setTimeout(() => {
        copyButton.innerHTML = `<i class='bx bxs-copy'></i>`;
      }, 1000);
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
};

// Auto scroll text response
const scrollToBottom = () => {
  console.log("Scrolling to bottom", container.scrollHeight);
  container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
};

// Efek mengetik satu persatu dari respon AI
const typingEffect = (text, textElement, botMsgDiv) => {
  textElement.textContent = "";
  if (text.includes("```")) {
    text = text.replace(
      /```([a-zA-Z]*)\n([\s\S]*?)\n```/g,
      (match, lang, code) => {
        return `
        <div class="code-frame">
          <div class="code-frame-header">
            <span class="code-title">${lang}</span>
            <button class="copy-code" onclick="copyCode(this)"><i class='bx bx-copy'></i> Copy</button>
          </div>
          <pre><code>${code}</code></pre>
        </div>`;
      }
    );
    textElement.innerHTML = text;
    botMsgDiv.classList.remove("loading");
    document.body.classList.remove("bot-responding");
    saveLocalStorage();
  } else {
    const words = text.split(" ");
    let wordIndex = 0;
    typingInterval = setInterval(() => {
      if (wordIndex < words.length) {
        textElement.textContent +=
          (wordIndex === 0 ? "" : " ") + words[wordIndex++];
        chatsContainer.scrollTo({
          top: chatsContainer.scrollHeight,
          behavior: "smooth",
        });
      } else {
        clearInterval(typingInterval);
        botMsgDiv.classList.remove("loading");
        document.body.classList.remove("bot-responding");
        saveLocalStorage();
      }
    }, 40);
  }
};

// Functiin Copy Code
const copyCode = (button) => {
  const codeFrame = button.closest(".code-frame");
  const codeElement = codeFrame.querySelector("pre code");
  const codeText = codeElement.textContent;

  navigator.clipboard
    .writeText(codeText)
    .then(() => {
      button.innerHTML = "<i class='bx bx-check'></i> Copied!";
      setTimeout(() => {
        button.innerHTML = "<i class='bx bx-copy'></i> Copy";
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
};

// MENANGANI KETIKA USER MENEKAN TOMBOL ENTER
promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleFormSubmit(event);
  }
});

// MEMBUAT PENGAMBILAN API DAN RESPON DARI AI
const generateResponse = async (botMsgDiv) => {
  const textElement = botMsgDiv.querySelector(".message-text");
  controller = new AbortController();
  chatHistory.push({
    role: "user",
    parts: [
      { text: userData.message },
      ...(userData.file.data
        ? [
            {
              inline_data: (({ fileName, isImage, ...rest }) => rest)(
                userData.file
              ),
            },
          ]
        : []),
    ],
  });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory }),
      signal: controller.signal,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    const responseText = data.candidates[0].content.parts[0].text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .trim();
    typingEffect(responseText, textElement, botMsgDiv);

    chatHistory.push({ role: "model", parts: [{ text: responseText }] });
    saveLocalStorage();
  } catch (error) {
    textElement.style.color = "#d62939";
    textElement.textContent =
      error.name === "AbortError"
        ? "Response generation stopped."
        : error.message;
    botMsgDiv.classList.remove("loading");
    document.body.classList.remove("bot-responding");
  } finally {
    userData.file = {};
  }
};

// Handle Form Submit
const handleFormSubmit = (e) => {
  e.preventDefault();
  const userMessage = promptInput.value.trim();
  if (!userMessage || document.body.classList.contains("bot-responding"))
    return;

  promptInput.value = "";
  userData.message = userMessage;
  document.body.classList.add("bot-responding", "chats-active");
  fileUploadWrapper.classList.remove("active", "img-attached", "file-attached");

  const userMsgHTML = `
    <p class="message-text"></p>
    ${
      userData.file.data
        ? userData.file.isImage
          ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment" />`
          : `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${userData.file.fileName}</p>`
        : ""
    }
  `;

  const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
  userMsgDiv.querySelector(".message-text").textContent = userMessage;
  chatsContainer.appendChild(userMsgDiv);
  scrollToBottom();

  chatHistory.push({
    role: "user",
    parts: [
      { text: userMessage },
      ...(userData.file.data
        ? [
            {
              inline_data: (({ fileName, isImage, ...rest }) => rest)(
                userData.file
              ),
            },
          ]
        : []),
    ],
  });
  saveLocalStorage();
  if (checkCustomKnowledge(userData.message)) return;
  // Proses loading
  setTimeout(() => {
    const botMsgHTML = `<svg class="avatar" width="30px" height="30px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0zM9.356 19.803v5.744h3.42v-2.325l-.006-.188a3.42 3.42 0 00-3.414-3.231zm3.302-13.11h-3.42v7.6l.005.188a3.42 3.42 0 003.415 3.232h4.916l.17.008a1.71 1.71 0 011.54 
            1.702v5.89h3.419v-7.6l-.006-.2a3.419 3.419 0 00-3.412-3.22h-4.918l-.147-.006a1.71 1.71 0 01-1.562-1.703v-5.89zm9.928.236h-3.42v2.325l.005.187a3.42 3.42 0 003.415 3.232V6.93z"/>
          </svg> 
          <div class="message-text">
            <div class="thinking-indicator">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>`;
    const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom();
    generateResponse(botMsgDiv);
  }, 600);
};

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const isImage = file.type.startsWith("image/");
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = (e) => {
    fileInput.value = "";
    const base64String = e.target.result.split(",")[1];
    fileUploadWrapper.querySelector(".file-preview").src = e.target.result;
    fileUploadWrapper.classList.add(
      "active",
      isImage ? "img-attached" : "file-attached"
    );

    userData.file = {
      fileName: file.name,
      data: base64String,
      mime_type: file.type,
      isImage,
    };
    saveLocalStorage();
  };
});

document.querySelector("#cancel-file-btn").addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("active", "img-attached", "file-attached");
  saveLocalStorage();
});

// Button Stop Response
document.querySelector("#stop-response-btn").addEventListener("click", () => {
  userData.file = {};
  controller?.abort();
  clearInterval(typingInterval);
  chatsContainer
    .querySelector(".bot-message-loading")
    .classList.remove("loading");
  document.body.classList.remove("bot-responding");
});

// Button Delete Chats
document.querySelector("#delete-chats-btn").addEventListener("click", () => {
  Swal.fire({
    title: "Hapus semua pesan?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Hapus",
  }).then((result) => {
    if (result.isConfirmed) {
      chatHistory.length = 0;
      chatsContainer.innerHTML = "";
      document.body.classList.remove("bot-responding", "chats-active");
      localStorage.removeItem("savedChats");
      localStorage.removeItem("chatHistory");
    }
  });
});

// Handle suggestions card
document.querySelectorAll(".suggestions-item").forEach((item) => {
  item.addEventListener("click", () => {
    promptInput.value = item.querySelector(".text").textContent;
    promptForm.dispatchEvent(new Event("submit"));
  });
});

promptForm.addEventListener("submit", handleFormSubmit);
promptForm
  .querySelector("#add-file-btn")
  .addEventListener("click", () => fileInput.click());
