const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const btnEl = document.getElementById("submit-btn");
const loginDiv = document.getElementById("login");
const topBarDiv = document.getElementById("top-bar");

const clearError = () => {
  const errEl = document.getElementsByClassName("err-container")[0];

  if (errEl) {
    loginDiv.removeChild(errEl);
  }
};

const clearLoginStatus = () => {
  const loginStatusEl = document.getElementsByClassName(
    "top-bar-login-status"
  )[0];

  if (loginStatusEl) {
    topBarDiv.removeChild(loginStatusEl);
  }
};

const setLoginStatus = (name) => {
  // check if div exists before creating a new one
  clearLoginStatus();

  const loginStatusMsg = `Logged in as ${name}`;

  const loginStatusEl = document.createElement("div");
  loginStatusEl.className = "top-bar-login-status";
  const statusMsgNode = document.createTextNode(loginStatusMsg);
  loginStatusEl.appendChild(statusMsgNode);

  topBarDiv.appendChild(loginStatusEl);
};

const setError = (message) => {
  // check if div exists before creating a new one
  clearError();

  const errEl = document.createElement("div");
  errEl.className = "err-container";
  const errMsg = document.createTextNode(message);
  errEl.appendChild(errMsg);

  loginDiv.appendChild(errEl);
};

const resetInput = () => {
  emailInput.value = "";
  passwordInput.value = "";
};

const saveJwtToStorage = (token) => {
  localStorage.setItem("token", token);
};

const validateInput = () => {
  const errMsg = "Please enter valid email/password";

  if (!emailInput.value || !passwordInput.value) {
    setError(errMsg);
    return false;
  }

  return true;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  btnEl.setAttribute("disabled", true);

  const email = emailInput.value;
  const password = passwordInput.value;

  const isValid = validateInput();

  if (!isValid) {
    btnEl.removeAttribute("disabled");
    return;
  }

  const response = await axios({
    method: "post",
    url: "http://127.0.0.1:8000/api/login",
    data: {
      email,
      password,
    },
    validateStatus: function (status) {
      return status === 200 || status === 401; // default
    },
  });

  const { status, data } = response;
  // handle correct login
  if (status === 200) {
    const { token, name } = data.data;
    saveJwtToStorage(token);
    setLoginStatus(name);
  }

  // handle unauthenticated user
  if (status === 401) {
    setError(data.message);
  }

  resetInput();
  btnEl.removeAttribute("disabled");
};

btnEl.addEventListener("click", handleSubmit);
