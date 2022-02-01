import ApiService from "./ApiService.js";

const topBarDiv = document.getElementById("top-bar");
const addItemBtn = document.getElementById("add-item-btn");
const modal = document.getElementById("modal");
const modalPopup = document.getElementById("modal-popup");
const modalContent = document.getElementById("modal-content");
const itemsTable = document.getElementById("items-table");

const editItemBarcodeInput = document.getElementById("barcode");
const editItemNameInput = document.getElementById("name");

const modalTitleEl = document.getElementById("modal-action-title");
const modalActionBtn = document.getElementById("modal-action-btn");

window.onload = async () => {
  const items = await fetchItems();
  fetchUser();
  if (items) {
    renderRowsFromItems(items);
  }
};

const getJwtFromStorage = () => {
  return localStorage.getItem("token");
};

const clearLoginStatus = () => {
  const loginStatusEl = document.getElementsByClassName(
    "top-bar-login-status"
  )[0];

  if (loginStatusEl) {
    topBarDiv.removeChild(loginStatusEl);
  }
};

const setLoginStatus = (message, type) => {
  // check if div exists before creating a new one
  clearLoginStatus();

  const loginStatusEl = document.createElement("div");
  loginStatusEl.className = "top-bar-login-status";
  const statusMsgNode = document.createTextNode(message);

  if (type === "success") {
    loginStatusEl.style.color = "#ffdbb9";
    const statusMsgNode = document.createTextNode(message);
    loginStatusEl.appendChild(statusMsgNode);
    topBarDiv.appendChild(loginStatusEl);
  } else {
    loginStatusEl.style.backgroundColor = "#f77800";
    const loginLink = document.createElement("a");
    loginLink.href = "/login.html";
    loginLink.appendChild(statusMsgNode);
    loginStatusEl.appendChild(loginLink);
    topBarDiv.appendChild(loginStatusEl);
  }
};

const clearFetchStatus = () => {
  modal.style.display = "none";
  modalContent.textContent = "";
};

const setFetchStatus = (message, type) => {
  // check if div exists before creating a new one
  clearFetchStatus();
  modal.style.display = "block";

  if (type === "success") {
    modalContent.style.color = "#14eb6b";
    const statusMsgNode = document.createTextNode(message);
    modalContent.appendChild(statusMsgNode);
  } else {
    modalContent.style.color = "red";
    const statusMsgNode = document.createTextNode(message);
    modalContent.appendChild(statusMsgNode);
  }

  setTimeout(clearFetchStatus, 1000);
};

const fetchItems = async () => {
  const token = getJwtFromStorage();
  const getData = {};

  const { status, responseData } = await ApiService.getApi(
    "/items",
    getData,
    token
  );

  let responseMsg = "";
  if (status === 0) {
    responseMsg = "Error: Network Error";
    setFetchStatus(responseMsg, "error");
  }

  if (status === 401) {
    responseMsg = "Unauthenticated user. Please log in";
    setFetchStatus(responseMsg, "error");
  }

  if (status === 403) {
    responseMsg = "Unauthorized user, access not allowed";
    setFetchStatus(responseMsg, "error");
    location.href = "login.html";
  }

  if (status === 200) {
    const { data: items, message } = responseData;
    setFetchStatus(message, "success");
    return items;
  }
};

const fetchUser = async () => {
  const token = getJwtFromStorage();
  const getData = {};

  const { status, responseData } = await ApiService.getApi(
    "/user",
    getData,
    token
  );

  let responseMsg = "";

  // handle network error
  if (status === 0 || status === 401) {
    responseMsg = `Not Logged in! Click here to login.`;
    setLoginStatus(responseMsg, "error");
  }

  if (status === 200) {
    const { first_name, last_name } = responseData;
    responseMsg = `Logged in as ${first_name} ${last_name}`;
    setLoginStatus(responseMsg, "success");
  }
};

const formatUserDefined = (userDefinedType) => (userDefinedType ? "No" : "Yes");

const fetchItem = async (itemId) => {
  const token = getJwtFromStorage();
  const getData = {};

  const { status, responseData } = await ApiService.getApi(
    `/items/${itemId}`,
    getData,
    token
  );

  let responseMsg = "";
  if (status === 0) {
    responseMsg = "Error: Network Error";
    setFetchStatus(responseMsg, "error");
  }

  if (status === 401) {
    responseMsg = "Unauthenticated user. Please log in";
    setFetchStatus(responseMsg, "error");
  }

  if (status === 403) {
    responseMsg = "Unauthorized user, access not allowed";
    setFetchStatus(responseMsg, "error");
    location.href = "login.html";
  }

  if (status === 200) {
    const { data: items, message } = responseData;
    setFetchStatus(message, "success");
    return items;
  }
};

const closeModal = () => {
  modalPopup.style.display = "none";
  modalActionBtn.removeAttribute("disabled");
  editItemBarcodeInput.removeAttribute("disabled");
  editItemNameInput.removeAttribute("disabled");
  editItemNameInput.value = "";
  editItemBarcodeInput.value = "";

  modalTitleEl.textContent = "";
  modalActionBtn.textContent = "";
};

const openModal = async (itemId = 0, action) => {
  modalPopup.style.display = "block";

  let btnTextNode = "";
  let titleTextNode = "";
  if (action === "edit") {
    // fetch item
    const item = await fetchItem(itemId);
    // display in the input
    editItemBarcodeInput.value = item.barcode;
    editItemNameInput.value = item.name;

    titleTextNode = document.createTextNode("Edit Item");
    btnTextNode = document.createTextNode("Edit");
    modalActionBtn.setAttribute("onclick", `handleEditItem(${item.id})`);
  }

  if (action === "verify") {
    // fetch item
    const item = await fetchItem(itemId);
    // display in the input
    editItemBarcodeInput.value = item.barcode;
    editItemNameInput.value = item.name;

    titleTextNode = document.createTextNode("Verify Item");
    btnTextNode = document.createTextNode("Verify");
    modalActionBtn.setAttribute("onclick", `handleVerifyItem(${item.id})`);
    editItemBarcodeInput.setAttribute("disabled", true);
    editItemNameInput.setAttribute("disabled", true);
  }

  if (action === "add") {
    titleTextNode = document.createTextNode("Add Item");
    btnTextNode = document.createTextNode("Add");
    modalActionBtn.setAttribute("onclick", `handleAddItem()`);
  }

  modalTitleEl.appendChild(titleTextNode);
  modalActionBtn.appendChild(btnTextNode);
};

const handleAddItem = async () => {
  // validate data
  const itemBarcode = editItemBarcodeInput.value;
  const itemName = editItemNameInput.value;

  if (!itemBarcode || !itemName) {
    setFetchStatus("Please fill in item name and barcode", "error");
    return;
  }

  const token = getJwtFromStorage();
  const postData = {
    barcode: itemBarcode,
    name: itemName,
  };

  modalActionBtn.setAttribute("disabled", true);

  const { status, responseData } = await ApiService.postApi(
    `/items/create`,
    postData,
    token
  );

  let responseMsg = "";
  if (status === 0) {
    responseMsg = "Error: Network Error";
    setFetchStatus(responseMsg, "error");
  }

  if (status === 401) {
    responseMsg = "Unauthenticated user. Please log in";
    setFetchStatus(responseMsg, "error");
  }

  if (status === 403) {
    responseMsg = "Unauthorized user, access not allowed";
    setFetchStatus(responseMsg, "error");
    location.href = "login.html";
  }

  if (status === 422) {
    const { message } = responseData;
    closeModal();
    setFetchStatus(message, "error");
  }

  if (status === 200) {
    const { data, message } = responseData;
    closeModal();
    setFetchStatus(message, "success");
    setTimeout(() => location.reload(), 1500);
  }
};

const handleEditItem = async (itemId) => {
  if (!itemId) return;
  // validate data
  const itemBarcode = editItemBarcodeInput.value;
  const itemName = editItemNameInput.value;

  if (!itemBarcode || !itemName) {
    setFetchStatus("Please fill in item name and barcode", "error");
    return;
  }

  const token = getJwtFromStorage();
  const postData = {
    barcode: itemBarcode,
    name: itemName,
  };
  modalActionBtn.setAttribute("disabled", true);

  const { status, responseData } = await ApiService.putApi(
    `/items/update/${itemId}`,
    postData,
    token
  );

  let responseMsg = "";
  if (status === 0) {
    responseMsg = "Error: Network Error";
    setFetchStatus(responseMsg, "error");
  }

  if (status === 401) {
    responseMsg = "Unauthenticated user. Please log in";
    setFetchStatus(responseMsg, "error");
  }

  if (status === 403) {
    responseMsg = "Unauthorized user, access not allowed";
    setFetchStatus(responseMsg, "error");
    location.href = "login.html";
  }

  if (status === 200) {
    const { data, message } = responseData;
    closeModal();
    setFetchStatus(message, "success");
    setTimeout(() => location.reload(), 1500);
  }
};

const handleVerifyItem = async (itemId) => {
  if (!itemId) return;
  // validate data
  const itemBarcode = editItemBarcodeInput.value;
  const itemName = editItemNameInput.value;

  if (!itemBarcode || !itemName) {
    setFetchStatus("Please fill in item name and barcode", "error");
    return;
  }

  const token = getJwtFromStorage();
  const postData = {};
  modalActionBtn.setAttribute("disabled", true);

  const { status, responseData } = await ApiService.putApi(
    `/items/verify/${itemId}`,
    postData,
    token
  );

  let responseMsg = "";
  if (status === 0) {
    responseMsg = "Error: Network Error";
    setFetchStatus(responseMsg, "error");
  }

  if (status === 401) {
    responseMsg = "Unauthenticated user. Please log in";
    setFetchStatus(responseMsg, "error");
  }

  if (status === 403) {
    responseMsg = "Unauthorized user, access not allowed";
    setFetchStatus(responseMsg, "error");
    location.href = "login.html";
  }

  if (status === 200) {
    const { data, message } = responseData;
    closeModal();
    setFetchStatus(message, "success");
    setTimeout(() => location.reload(), 1500);
  }
};

const renderEditBtn = (tableCell, itemId) => {
  const btnEl = document.createElement("button");
  const btnTextNode = document.createTextNode("Edit");
  btnEl.appendChild(btnTextNode);

  btnEl.setAttribute("style", "margin-left:10px;");
  btnEl.setAttribute("class", "edit-btn");
  btnEl.setAttribute("onclick", `openModal(${itemId}, "edit")`);

  tableCell.appendChild(btnEl);
};

const renderVerifyBtn = (tableCell, itemId) => {
  const btnEl = document.createElement("button");
  const btnTextNode = document.createTextNode("Verify");
  btnEl.appendChild(btnTextNode);

  btnEl.setAttribute("style", "margin-left:10px;");
  btnEl.setAttribute("class", "verify-btn");
  btnEl.setAttribute("onclick", `openModal(${itemId}, "verify")`);

  tableCell.appendChild(btnEl);
};

const renderRowsFromItems = (items) => {
  for (let i = 0; i < items.length; i++) {
    const { barcode, name, user_defined, id } = items[i];
    var row = itemsTable.insertRow(i + 1);

    const idCol = row.insertCell(0);
    const barcodeCol = row.insertCell(1);
    const nameCol = row.insertCell(2);
    const verifiedCol = row.insertCell(3);
    const actionsCol = row.insertCell(4);

    const idTextNode = document.createTextNode(i + 1);
    const barcodeTextNode = document.createTextNode(barcode);
    const nameTextNode = document.createTextNode(name);
    const verifiedTextNode = document.createTextNode(
      formatUserDefined(user_defined)
    );

    idCol.appendChild(idTextNode);
    barcodeCol.appendChild(barcodeTextNode);
    nameCol.appendChild(nameTextNode);
    verifiedCol.appendChild(verifiedTextNode);
    renderEditBtn(actionsCol, id);

    if (user_defined) {
      verifiedCol.setAttribute("class", "unverified");
      renderVerifyBtn(actionsCol, id);
    } else {
      verifiedCol.setAttribute("class", "verified");
    }
  }
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modalPopup) {
    closeModal();
  }
};

window.openModal = openModal;
window.handleEditItem = handleEditItem;
window.handleVerifyItem = handleVerifyItem;
window.handleAddItem = handleAddItem;
