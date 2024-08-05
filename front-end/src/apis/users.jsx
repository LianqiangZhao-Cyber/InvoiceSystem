import axios from "axios";

// Base URL for the invoice API
const API_BASE_URL = "http://43.128.79.206:8000/invoice";

// Retrieve the authentication token from local storage
const token = localStorage.getItem("token");

/**
 * Fetches information about all users in the company
 * @returns {Promise} A promise that resolves with the company workers' information
 */
export function allUsersInfo() {
  return axios.get(`${API_BASE_URL}/company-workers-info/`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Promotes a user within the company
 * @param {string|number} userId - The ID of the user to be promoted
 * @returns {Promise} A promise that resolves with the response data
 */
export function promoteUser(userId) {
  return axios.post(
    `${API_BASE_URL}/company-workers-info/?id=${userId}&promotion=1`,
    {}, // Empty object as request body, as this API doesn't require a body
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

/**
 * Removes a user from the company (fires them)
 * @param {string|number} userId - The ID of the user to be removed
 * @returns {Promise} A promise that resolves with the response data
 */
export function deleteUser(userId) {
  return axios.post(
    `${API_BASE_URL}/company-workers-info/?id=${userId}&fire=1`,
    {}, // Empty object as request body, as this API doesn't require a body
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

/**
 * Sends an invitation email to a user
 * @param {string} userName - The username of the person to invite
 * @param {string} email - The email address to send the invitation to
 * @returns {Promise} A promise that resolves with the response data
 */
export function sendInvitationEmail(userName, email) {
  return axios.patch(
    `${API_BASE_URL}/user-info/?username=${userName}&email=${email}`,
    {}, // Empty object as request body, as this API doesn't require a body
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

/**
 * Fetches information about the currently logged-in user
 * @returns {Promise} A promise that resolves with the current user's information
 */
export function getCurrentUserInfo() {
  return axios.get(`${API_BASE_URL}/user-info/`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}
