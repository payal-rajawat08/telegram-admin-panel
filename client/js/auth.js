if (getToken()) {
  location.href = "app.html";
}

let mode = "login";
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const submitBtn = document.getElementById("submitBtn");
const authForm = document.getElementById("authForm");
const authError = document.getElementById("authError");
const toastEl = document.getElementById("toast");

function toast(msg, isErr) {
  toastEl.textContent = msg;
  toastEl.className = "toast show" + (isErr ? " err" : "");
  setTimeout(() => (toastEl.className = "toast"), 2500);
}

function setMode(next) {
  mode = next;
  tabLogin.classList.toggle("active", mode === "login");
  tabRegister.classList.toggle("active", mode === "register");
  submitBtn.textContent = mode === "login" ? "Login" : "Create account";
  authError.classList.remove("show");
}

tabLogin.addEventListener("click", () => setMode("login"));
tabRegister.addEventListener("click", () => setMode("register"));

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.classList.remove("show");
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  submitBtn.disabled = true;
  submitBtn.textContent = mode === "login" ? "Logging in..." : "Creating...";

  try {
    if (mode === "register") {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      toast("Account created. Please log in.");
      setMode("login");
    } else {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSession(data.token, email);
      location.href = "app.html";
    }
  } catch (err) {
    authError.textContent = err.message;
    authError.classList.add("show");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = mode === "login" ? "Login" : "Create account";
  }
});
