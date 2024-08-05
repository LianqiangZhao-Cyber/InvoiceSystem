import axios from "axios"; // Import axios library for making HTTP requests

// Define the base URL for the API
const API_BASE_URL = "http://backend:8000/invoice";

/**
 * Upload a file to the server
 * @param {File} file - The file to be uploaded
 * @param {string} uuid - The unique identifier associated with the invoice
 * @returns {Promise} A promise that resolves to the response of the upload request
 */
export const uploadFile = (file, uuid) => {
  // Create a new FormData object to hold the file and uuid
  const formData = new FormData();
  formData.append("file", file); // Append the file to the FormData object
  formData.append("uuid", uuid); // Append the uuid to the FormData object

  // Make a POST request to upload the file
  return axios.post(`${API_BASE_URL}/invoice-creation-upload/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Set the content type to multipart/form-data
      Authorization: `Bearer ${localStorage.getItem("token")}`, // Use Bearer token for authorization
    },
  });
};
