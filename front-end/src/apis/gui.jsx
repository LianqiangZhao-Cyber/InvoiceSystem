import axios from "axios";

// Base URL for the invoice API
const API_BASE_URL = "http://43.128.79.206:8000/invoice";

/**
 * Fetches company information from the API
 * @returns {Promise} A promise that resolves with the company info
 */
export function CompanyInfo() {
  return axios.get(`${API_BASE_URL}/company-info/`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
}

/**
 * Submits an invoice to the API
 * @param {Object} invoiceData - The invoice data to be submitted
 * @returns {Promise} A promise that resolves with the response data
 */
export function submitInvoice(invoiceData) {
  const token = localStorage.getItem("token");
  return axios
    .post(
      `${API_BASE_URL}/invoice-creation-gui/`,
      {
        // Map invoice data to API expected format
        invoice_name: invoiceData.invoice_name,
        uuid: invoiceData.uuid,
        invoice_num: invoiceData.invoice_num,
        my_company_name: invoiceData.my_company_name,
        my_address: invoiceData.my_address,
        my_abn: invoiceData.my_ABN,
        my_email: invoiceData.my_email,
        client_company_name: invoiceData.client_company_name,
        client_address: invoiceData.client_address,
        client_abn: invoiceData.client_ABN,
        client_email: invoiceData.client_email,
        bank_name: invoiceData.bank_name,
        currency: invoiceData.currency,
        account_num: invoiceData.account_num,
        bsb_num: invoiceData.bsb_num,
        account_name: invoiceData.account_name,
        issue_date: invoiceData.issue_date,
        due_date: invoiceData.due_date,
        subtotal: invoiceData.subtotal,
        gst_total: invoiceData.gst_total,
        total_amount: invoiceData.total_amount,
        note: invoiceData.note,
        // Map order data for each item in the invoice
        orders: invoiceData.orders.map((order) => ({
          description: order.description,
          unit_price: order.unitPrice,
          quantity: order.quantity,
          net: order.net,
          gst: order.gst,
          amount: order.totalPrice,
        })),
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error submitting invoice:", error);
      throw error;
    });
}

/**
 * Creates a draft invoice
 * @param {Object} invoiceData - The invoice data to be saved as a draft
 * @returns {Promise} A promise that resolves with the response data
 */
export function createDraft(invoiceData) {
  const token = localStorage.getItem("token");
  return axios.post(
    `${API_BASE_URL}/invoice-draft`,
    {
      // Map invoice data to API expected format (same as submitInvoice)
      invoice_name: invoiceData.invoice_name,
      uuid: invoiceData.uuid,
      invoice_num: invoiceData.invoice_num,
      my_company_name: invoiceData.my_company_name,
      my_address: invoiceData.my_address,
      my_abn: invoiceData.my_ABN,
      my_email: invoiceData.my_email,
      client_company_name: invoiceData.client_company_name,
      client_address: invoiceData.client_address,
      client_abn: invoiceData.client_ABN,
      client_email: invoiceData.client_email,
      bank_name: invoiceData.bank_name,
      currency: invoiceData.currency,
      account_num: invoiceData.account_num,
      bsb_num: invoiceData.bsb_num,
      account_name: invoiceData.account_name,
      issue_date: invoiceData.issue_date,
      due_date: invoiceData.due_date,
      subtotal: invoiceData.subtotal,
      gst_total: invoiceData.gst_total,
      total_amount: invoiceData.total_amount,
      note: invoiceData.note,
      orders: invoiceData.orders.map((order) => ({
        description: order.description,
        unit_price: order.unitPrice,
        quantity: order.quantity,
        net: order.net,
        gst: order.gst,
        amount: order.totalPrice,
      })),
    },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

/**
 * Updates an existing draft invoice
 * @param {Object} invoiceData - The updated invoice data
 * @param {string|number} id - The ID of the draft invoice to update
 * @returns {Promise} A promise that resolves with the response data
 */
export function updateDraft(invoiceData, id) {
  const token = localStorage.getItem("token");
  return axios.patch(
    `${API_BASE_URL}/invoice-draft?id=${id}`,
    {
      // Map invoice data to API expected format (same as submitInvoice and createDraft)
      invoice_name: invoiceData.invoice_name,
      uuid: invoiceData.uuid,
      invoice_num: invoiceData.invoice_num,
      my_company_name: invoiceData.my_company_name,
      my_address: invoiceData.my_address,
      my_abn: invoiceData.my_ABN,
      my_email: invoiceData.my_email,
      client_company_name: invoiceData.client_company_name,
      client_address: invoiceData.client_address,
      client_abn: invoiceData.client_ABN,
      client_email: invoiceData.client_email,
      bank_name: invoiceData.bank_name,
      currency: invoiceData.currency,
      account_num: invoiceData.account_num,
      bsb_num: invoiceData.bsb_num,
      account_name: invoiceData.account_name,
      issue_date: invoiceData.issue_date,
      due_date: invoiceData.due_date,
      subtotal: invoiceData.subtotal,
      gst_total: invoiceData.gst_total,
      total_amount: invoiceData.total_amount,
      note: invoiceData.note,
      orders: invoiceData.orders.map((order) => ({
        description: order.description,
        unit_price: order.unitPrice,
        quantity: order.quantity,
        net: order.net,
        gst: order.gst,
        amount: order.totalPrice,
      })),
    },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
