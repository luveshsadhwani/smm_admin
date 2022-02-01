const API_URL = 'http://127.0.0.1:8000/api';

const postApi = (endpoint, postData = {}, token = "") => {
  let status = 0;
  let responseData = null;

  return axios({
    method: "post",
    url: `${API_URL}${endpoint}`,
    data: postData,
    validateStatus: function (status) {
      return status === 200 || status === 401; // default
    },
  })
    .then((response) => {
      status = response.status;
      responseData = response.data;

      return { status, responseData };
    })
    .catch(() => {
      return { status, responseData };
    });
};

const getApi = (endpoint, getData = {}, token = "") => {
  let status = 0;
  let responseData = null;

  return axios({
    method: "get",
    url: `${API_URL}${endpoint}`,
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      Authorization: `Bearer ${token}`,
    },
    data: getData,
    validateStatus: function (status) {
      return status === 200 || status === 401; // default
    },
  })
    .then((response) => {
      status = response.status;
      responseData = response.data;

      return { status, responseData };
    })
    .catch(() => {
      return { status, responseData };
    });
};

const putApi = (endpoint, postData = {}, token = "") => {
  let status = 0;
  let responseData = null;

  return axios({
    method: "put",
    url: `${API_URL}${endpoint}`,
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      Authorization: `Bearer ${token}`,
    },
    data: postData,
    validateStatus: function (status) {
      return status === 200 || status === 401; // default
    },
  })
    .then((response) => {
      status = response.status;
      responseData = response.data;

      return { status, responseData };
    })
    .catch(() => {
      return { status, responseData };
    });
};

export default { postApi, getApi, putApi };
