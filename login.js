const loginForm = document.querySelector("#login-form");
const loginStatus = document.querySelector("#login-status");

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = loginForm.querySelector('button[type="submit"]');
  const payload = Object.fromEntries(new FormData(loginForm).entries());

  button.disabled = true;
  loginStatus.textContent = "Signing in...";

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Login failed.");
    }

    window.location.href = "/admin.html";
  } catch (error) {
    loginStatus.textContent = error.message || "Unable to login.";
  } finally {
    button.disabled = false;
  }
});
