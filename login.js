import ApiService from "./ApiService.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const btnEl = document.getElementById("submit-btn");
const loginDiv = document.getElementById("login");

const clearError = () => {
  const errEl = document.getElementsByClassName("err-container")[0];

  if (errEl) {
    loginDiv.removeChild(errEl);
  }
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

const disableButtonEl = (buttonEl) => {
  if (!buttonEl) return;

  try {
    if (buttonEl.nodeName !== "BUTTON") {
      throw new TypeError("Element is not type button");
    }
    buttonEl.disabled = true;
  } catch (e) {
    console.log(e);
  }
};

const enableButtonEl = (buttonEl) => {
  if (!buttonEl) return;

  try {
    if (buttonEl.nodeName !== "BUTTON") {
      throw new TypeError("Element is not type button");
    }
    buttonEl.disabled = false;
  } catch (e) {
    console.log(e);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  disableButtonEl(btnEl);

  const email = emailInput.value;
  const password = passwordInput.value;
  const isValid = validateInput();
  const postData = { email, password };

  if (!isValid) {
    enableButtonEl(btnEl);
    return;
  }

  const { status, responseData } = await ApiService.postApi(
    "/login",
    postData
  );

  // handle network error
  if (status === 0) {
    setError("Network Error");
  }

  // handle unauthenticated user
  if (status === 401) {
    setError(responseData.message);
  }

  // handle correct login
  if (status === 200) {
    const { data } = responseData;
    const { token } = data;
    saveJwtToStorage(token);
    // redirect to item page html
    location.href = "itempage.html";
  }

  resetInput();
  enableButtonEl(btnEl);
};

btnEl.addEventListener("click", handleSubmit);
