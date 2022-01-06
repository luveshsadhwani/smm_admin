const topBarDiv = document.getElementById("top-bar");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");
const itemsTable = document.getElementById("items-table");

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
    loginLink.href = '/login.html'
    loginLink.appendChild(statusMsgNode);
    loginStatusEl.appendChild(loginLink);
    topBarDiv.appendChild(loginStatusEl);
  }
};

const clearFetchStatus = () => {
  modal.style.display = "none";
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

const editItem = () => {
  console.log("editting...");
};

const verifyItem = () => {
  console.log("verifying...");
};

const renderEditBtn = (tableCell) => {
  const btnEl = document.createElement("button");
  const btnTextNode = document.createTextNode("Edit");
  btnEl.appendChild(btnTextNode);

  btnEl.setAttribute("style", "margin-left:10px;");
  btnEl.setAttribute("class", "edit-btn");
  btnEl.setAttribute("onclick", "editItem()");

  tableCell.appendChild(btnEl);
};

const renderVerifyBtn = (tableCell) => {
  const btnEl = document.createElement("button");
  const btnTextNode = document.createTextNode("Verify");
  btnEl.appendChild(btnTextNode);

  btnEl.setAttribute("style", "margin-left:10px;");
  btnEl.setAttribute("class", "verify-btn");
  btnEl.setAttribute("onclick", "verifyItem()");

  tableCell.appendChild(btnEl);
};

const renderRowsFromItems = (items) => {
  for (let i = 0; i < items.length; i++) {
    const { barcode, name, user_defined } = items[i];
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
    renderEditBtn(actionsCol);

    if (user_defined) {
      verifiedCol.setAttribute("class", "unverified");
      renderVerifyBtn(actionsCol);
    } else {
      verifiedCol.setAttribute("class", "verified");
    }
  }
};
