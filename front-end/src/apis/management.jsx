import axios from "axios"; // Import axios library for making HTTP requests

// Define the base URL for the API and a static URL
const API_BASE_URL = "http://backend:8000/invoice";
const STASTIC_URL = "http://backend:8000";

// Get the token from local storage
const token = localStorage.getItem("token");

/**
 * Fetch basic invoice information
 * @returns {Promise} A promise that resolves to the basic invoice information
 */
export function invoiceBasicInfo() {
  return axios.get(`${API_BASE_URL}/invoice-info/`, {
    headers: {
      Accept: "application/json", // Accept JSON response
      Authorization: `Bearer ${token}`, // Use Bearer token for authorization
    },
  });
}

/**
 * Fetch administrative management information for company invoices
 * @returns {Promise} A promise that resolves to the company invoice management information
 */
export function invoiceAdminManage() {
  return axios.get(`${API_BASE_URL}/company-invoice-info/`, {
    headers: {
      Accept: "application/json", // Accept JSON response
      Authorization: `Bearer ${token}`, // Use Bearer token for authorization
    },
  });
}

/**
 * Delete an invoice
 * @param {string} uuid - The unique identifier of the invoice
 * @returns {Promise} A promise that resolves to the result of the deletion operation
 */
export function invoiceDeletion(uuid) {
  return axios.post(
    `${API_BASE_URL}/invoice-deletion/?uuid=${uuid}`,
    {}, // Empty object as the request body because this API does not require a request body
    {
      headers: {
        Accept: "application/json", // Accept JSON response
        Authorization: `Bearer ${token}`, // Use Bearer token for authorization
      },
    }
  );
}

/**
 * Fetch error report for an invoice
 * @param {string} uuid - The unique identifier of the invoice
 * @returns {Promise} A promise that resolves to the error report
 */
export function getErrorReport(uuid) {
  return axios.get(`${API_BASE_URL}/invoice-report?uuid=${uuid}`, {
    headers: {
      Accept: "application/json", // Accept JSON response
      Authorization: `Bearer ${token}`, // Use Bearer token for authorization
    },
  });
}

/**
 * Fetch the log of an invoice
 * @param {string} uuid - The unique identifier of the invoice
 * @param {string} userid - The unique identifier of the user
 * @returns {Promise} A promise that resolves to the invoice log
 */
export function invoiceLog(uuid, userid) {
  return axios.get(
    `${API_BASE_URL}/invoice-time?uuid=${uuid}&userid=${userid}`,
    {
      headers: {
        Accept: "application/json", // Accept JSON response
        Authorization: `Bearer ${token}`, // Use Bearer token for authorization
      },
    }
  );
}
