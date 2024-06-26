function openChat() {
    const chatPopup = document.getElementById("chatPopup");
    chatPopup.style.display = "block";
    chatPopup.style.bottom = "20px";
    chatPopup.style.right = "20px";
}

function closeChat() {
    const chatPopup = document.getElementById("chatPopup");
    chatPopup.style.display = "none";
}

function minimizeChat() {
    const chatPopup = document.getElementById("chatPopup");
    if (chatPopup.style.height === "60px") {
        chatPopup.style.height = "auto";
        chatPopup.querySelector(".chat-body").style.display = "block";
        chatPopup.querySelector(".chat-footer").style.display = "flex";
    } else {
        chatPopup.style.height = "60px";
        chatPopup.querySelector(".chat-body").style.display = "none";
        chatPopup.querySelector(".chat-footer").style.display = "none";
    }
}

function sendMessage() {
    const messageInput = document.querySelector(".chat-footer input");
    const message = messageInput.value.trim();
    if (message === "") return;

    const chatBody = document.querySelector(".chat-body");

    // Create a new message element
    const messageElement = document.createElement("div");
    messageElement.className = "chat-message chat-message-right";
    messageElement.textContent = message;

    // Add the new message to the chat body
    chatBody.appendChild(messageElement);

    // Clear the message input
    messageInput.value = "";

    // Scroll to the bottom of the chat
    chatBody.scrollTop = chatBody.scrollHeight;

    // Simulate a response from another sender
    setTimeout(() => {
        const responseElement = document.createElement("div");
        responseElement.className = "chat-message chat-message-left";
        responseElement.textContent = "This is a simulated response.";
        chatBody.appendChild(responseElement);
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 1000);
}

document.querySelector(".chat-footer button").addEventListener("click", sendMessage);
document.querySelector(".chat-footer input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});
