const topBarDiv = document.getElementById("top-bar");
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

const getJwtToStorage = () => {
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

const fetchItems = () => {
  const token = getJwtToStorage();

  return axios({
    method: "get",
    url: "http://127.0.0.1:8000/api/items",
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      let responseMsg = "";
      if (response.status === 200) {
        const { data } = response;
        responseMsg = "Items fetched successfully";
        setFetchStatus(responseMsg, "success");
        const { data: items } = data;
        return items;
      }
    })
    .catch((error) => {
      let responseMsg = "";
      if (!error.response) {
        // network error
        responseMsg = "Error: Network Error";
        setFetchStatus(responseMsg, "error");
      }
    });
};

const fetchUser = async () => {
  const token = getJwtToStorage();

  const response = await axios({
    method: "get",
    url: "http://127.0.0.1:8000/api/user",
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      let responseMsg = "";
      if (response.status === 200) {
        const { first_name, last_name } = response.data;
        responseMsg = `Logged in as ${first_name} ${last_name}`;
        setLoginStatus(responseMsg, "success");
      }
    })
    .catch((error) => {
      let responseMsg = "";
      if (!error.response) {
        // network error
        responseMsg = `Not Logged in! Click here to login.`;
        setLoginStatus(responseMsg, "error");
      }
    });
};

const formatUserDefined = (userDefinedType) => (userDefinedType ? "No" : "Yes");

const fetchItem = (itemId) => {
  const token = getJwtToStorage();

  return axios({
    method: "get",
    url: `http://127.0.0.1:8000/api/items/${itemId}`,
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      let responseMsg = "";
      if (response.status === 200) {
        const { data } = response;
        responseMsg = "Item fetched successfully";
        setFetchStatus(responseMsg, "success");
        const { data: item } = data;
        return item;
      }
    })
    .catch((error) => {
      let responseMsg = "";
      if (!error.response) {
        // network error
        responseMsg = "Error: Network Error";
        setFetchStatus(responseMsg, "error");
      }
    });
};

const closeModal = () => {
  modalPopup.style.display = "none";
  modalActionBtn.setAttribute("disabled", false);
  editItemBarcodeInput.removeAttribute("disabled");
  editItemNameInput.removeAttribute("disabled");
  editItemNameInput.value = "";
  editItemBarcodeInput.value = "";

  modalTitleEl.textContent = "";
  modalActionBtn.textContent = "";
};

const openModal = async (itemId, action) => {
  modalPopup.style.display = "block";

  // fetch item
  const item = await fetchItem(itemId);
  // display in the input
  editItemBarcodeInput.value = item.barcode;
  editItemNameInput.value = item.name;

  let btnTextNode = "";
  let titleTextNode = "";
  if (action === "edit") {
    titleTextNode = document.createTextNode("Edit Item");
    btnTextNode = document.createTextNode("Edit");
    modalActionBtn.setAttribute("onclick", `handleEditItem(${item.id})`);
  }

  if (action === "verify") {
    titleTextNode = document.createTextNode("Verify Item");
    btnTextNode = document.createTextNode("Verify");
    modalActionBtn.setAttribute("onclick", `handleVerifyItem(${item.id})`);
    editItemBarcodeInput.setAttribute("disabled", true);
    editItemNameInput.setAttribute("disabled", true);
  }

  modalTitleEl.appendChild(titleTextNode);
  modalActionBtn.appendChild(btnTextNode);
};

const handleEditItem = (itemId) => {
  if (!itemId) return;
  // validate data
  const itemBarcode = editItemBarcodeInput.value;
  const itemName = editItemNameInput.value;

  if (!itemBarcode || !itemName) {
    setFetchStatus("Please fill in item name and barcode", "error");
    return;
  }

  const token = getJwtToStorage();

  const postData = {
    barcode: itemBarcode,
    name: itemName,
  };

  modalActionBtn.setAttribute("disabled", true);
  axios({
    method: "put",
    url: `http://127.0.0.1:8000/api/items/update/${itemId}`,
    data: postData,
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      //handle success
      closeModal();
      const { message } = response.data;
      setFetchStatus(message, "success");
      setTimeout(() => location.reload(), 1500);
    })
    .catch((error) => {
      //handle error
      let responseMsg = "";
      if (!error.response) {
        // network error
        responseMsg = `Error: Network Error`;
        setLoginStatus(responseMsg, "error");
      }
    });
};

const verifyItem = () => {
  console.log("verifying...");
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
