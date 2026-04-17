const statusElement = document.querySelector("#admin-status");
const listElement = document.querySelector("#messages-list");
const refreshButton = document.querySelector("#refresh-messages");
const logoutButton = document.querySelector("#logout-button");

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function renderMessages(messages) {
  if (!messages.length) {
    listElement.innerHTML = '<div class="empty-state">No messages yet.</div>';
    return;
  }

  listElement.innerHTML = messages.map((message) => `
    <article class="message-card">
      <div class="message-top">
        <div>
          <p class="timeline-role">${message.name}</p>
          <p class="timeline-place">${message.email}</p>
        </div>
        <p class="message-date">${formatDate(message.submittedAt)}</p>
      </div>
      <p class="message-body">${message.message}</p>
    </article>
  `).join("");
}

async function loadMessages() {
  statusElement.textContent = "Loading messages...";

  try {
    const response = await fetch("/api/messages");
    const result = await response.json();

    if (response.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    if (!response.ok) {
      throw new Error(result.error || "Unable to load messages.");
    }

    renderMessages(result.messages || []);
    statusElement.textContent = `${result.messages.length} message(s) loaded from ${result.storage}.`;
  } catch (error) {
    listElement.innerHTML = '<div class="empty-state">Could not load messages.</div>';
    statusElement.textContent = error.message || "Something went wrong.";
  }
}

refreshButton?.addEventListener("click", loadMessages);
logoutButton?.addEventListener("click", async () => {
  await fetch("/api/admin/logout", { method: "POST" });
  window.location.href = "/login.html";
});

loadMessages();
