import React, { useState } from "react";
import "./GuiForm.css";
import { GuiTable } from "../GUITable/GuiTable";
import { useInvoice } from "@/Content/GuiContent";

import { Input, DatePicker, Select, InputNumber, Form } from "antd";
import dayjs from "dayjs";
import { FlagIcon } from "react-flag-kit";

const { TextArea } = Input;

const options = [
  {
    value: "AUD",
    label: (
      <div className="currency-container">
        <FlagIcon code="AU" size={24} />
        <div className="currency-texts">
          <div className="currency-bond">AUD</div>
          <div>- Australian Dollar</div>
        </div>
      </div>
    ),
  },
];

export function GuiForm() {
  const { invoiceData, updateInvoiceData, clearInvoiceData } = useInvoice();
  const handleInputChange = (field, value) => {
    updateInvoiceData({ [field]: value });
  };

  const [myEmailError, setMyEmailError] = useState("");
  const [clientEmailError, setClientEmailError] = useState("");

  const [myABNError, setMyABNError] = useState("");
  const [clientABNError, setClientABNError] = useState("");

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validateABN = (abn) => {
    // 允许数字之间有0到多个空格，总共11个数字
    const re = /^\d(?:\s*\d){10}$/;

    // 移除所有空格
    const cleanedAbn = abn.replace(/\s+/g, "");

    // 检查格式是否正确且清理后的ABN长度为11
    if (!re.test(abn) || cleanedAbn.length !== 11) {
      return false;
    } else {
      return true;
    }

    // ABN 校验算法
    // const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    // let sum = 0;

    // for (let i = 0; i < 11; i++) {
    //   sum += (parseInt(cleanedAbn[i]) - (i === 0 ? 1 : 0)) * weights[i];
    // }

    // return sum % 89 === 0;
  };

  const handleEmailBlur = (field, value, setError) => {
    if (!validateEmail(value)) {
      setError("Please enter a valid email address");
    } else {
      setError("");
    }
  };

  const handleABNBlur = (field, value, setError) => {
    if (!validateABN(value)) {
      setError("Please enter a 11-digital ABN");
    } else {
      setError("");
    }
  };

  return (
    <div className="form-container">
      <div className="details-container">
        <div className="details-title">Invoice Details</div>
        <div className="inputs-group">
          <div className="title-and-input">
            <div>Subject*</div>
            <Input
              size="large"
              placeholder="Subject"
              value={invoiceData.invoice_name}
              onChange={(e) =>
                handleInputChange("invoice_name", e.target.value)
              }
            />
          </div>
          <div className="title-and-input">
            <div>Invoice Number*</div>
            <Input
              size="large"
              placeholder="Invoice Number"
              value={invoiceData.invoice_num}
              onChange={(e) => handleInputChange("invoice_num", e.target.value)}
            />
          </div>
          <div className="title-and-input">
            <div>Dates*</div>
            <div className="datepicker-groups">
              <DatePicker
                size="large"
                placeholder="Invoice Date"
                className="create-datepicker"
                onChange={(date, dateString) =>
                  updateInvoiceData({ issue_date: dateString })
                }
                value={
                  invoiceData.issue_date ? dayjs(invoiceData.issue_date) : null
                }
              />
              <DatePicker
                size="large"
                placeholder="Due Date"
                className="create-datepicker"
                onChange={(date, dateString) =>
                  updateInvoiceData({ due_date: dateString })
                }
                value={
                  invoiceData.due_date ? dayjs(invoiceData.due_date) : null
                }
              />
            </div>
          </div>
          <div className="title-and-input">
            <div>Currency*</div>
            <Select
              size="large"
              placeholder="Currency"
              options={options}
              optionLabelProp="label"
              className="currency-select"
              onChange={(value) => {
                updateInvoiceData({ currency: value });
              }}
              value={invoiceData.currency || undefined}
            />
          </div>
        </div>
      </div>
      <div className="details-container">
        <div className="title-row">
          <div className="details-title">My Details</div>
        </div>
        <div className="inputs-group">
          <div className="title-and-input">
            <div>Company Name*</div>
            <Input
              size="large"
              placeholder="Company Name"
              value={invoiceData.my_company_name}
              onChange={(e) =>
                handleInputChange("my_company_name", e.target.value)
              }
            />
          </div>
          <div className="title-and-input">
            <div>Address*</div>
            <Input
              size="large"
              placeholder="Address"
              value={invoiceData.my_address}
              onChange={(e) => handleInputChange("my_address", e.target.value)}
            />
          </div>

          <div className="title-and-input">
            <div>ABN*</div>
            <Form.Item
              validateStatus={myABNError ? "error" : ""}
              help={myABNError}
            >
              <Input
                size="large"
                placeholder="ABN"
                value={invoiceData.my_ABN}
                onChange={(e) => handleInputChange("my_ABN", e.target.value)}
                onBlur={(e) =>
                  handleABNBlur("my_ABN", e.target.value, setMyABNError)
                }
              />
            </Form.Item>
          </div>

          <div className="title-and-input">
            <div>Email*</div>
            <Form.Item
              validateStatus={myEmailError ? "error" : ""}
              help={myEmailError}
            >
              <Input
                size="large"
                placeholder="Email Address"
                value={invoiceData.my_email}
                onChange={(e) => handleInputChange("my_email", e.target.value)}
                onBlur={(e) =>
                  handleEmailBlur("my_email", e.target.value, setMyEmailError)
                }
              />
            </Form.Item>
          </div>
        </div>
      </div>
      <div className="details-container">
        <div className="details-title">Client Details</div>
        <div className="inputs-group">
          <div className="title-and-input">
            <div>Company Name*</div>
            <Input
              size="large"
              placeholder="Company Name"
              value={invoiceData.client_company_name}
              onChange={(e) =>
                handleInputChange("client_company_name", e.target.value)
              }
            />
          </div>
          <div className="title-and-input">
            <div>Address*</div>
            <Input
              size="large"
              placeholder="Address"
              value={invoiceData.client_address}
              onChange={(e) =>
                handleInputChange("client_address", e.target.value)
              }
            />
          </div>

          <div className="title-and-input">
            <div>ABN*</div>
            <Form.Item
              validateStatus={clientABNError ? "error" : ""}
              help={clientABNError}
            >
              <Input
                size="large"
                placeholder="ABN"
                value={invoiceData.client_ABN}
                onChange={(e) =>
                  handleInputChange("client_ABN", e.target.value)
                }
                onBlur={(e) =>
                  handleABNBlur("client_ABN", e.target.value, setMyABNError)
                }
              />
            </Form.Item>
          </div>

          <div className="title-and-input">
            <div>Email*</div>
            <Form.Item
              validateStatus={clientEmailError ? "error" : ""}
              help={clientEmailError}
            >
              <Input
                size="large"
                placeholder="Email Address"
                value={invoiceData.client_email}
                onChange={(e) =>
                  handleInputChange("client_email", e.target.value)
                }
                onBlur={(e) =>
                  handleEmailBlur(
                    "client_email",
                    e.target.value,
                    setClientEmailError
                  )
                }
              />
            </Form.Item>
          </div>
        </div>
      </div>
      <div className="details-container">
        <div className="details-title">Products</div>
        <GuiTable />
      </div>
      <div className="details-container">
        <div className="details-title">Payment Details</div>
        <div className="inputs-group">
          <div className="title-and-input">
            <div>Bank Name*</div>
            <Input
              size="large"
              placeholder="Bank Name"
              value={invoiceData.bank_name}
              onChange={(e) => handleInputChange("bank_name", e.target.value)}
            />
          </div>
          <div className="title-and-input">
            <div>Account Info*</div>
            <div className="datepicker-groups">
              <Input
                size="large"
                placeholder="BSB"
                className="create-datepicker"
                value={invoiceData.bsb_num}
                onChange={(e) => handleInputChange("bsb_num", e.target.value)}
              />
              <Input
                size="large"
                placeholder="Account Number"
                className="create-datepicker"
                value={invoiceData.account_num}
                onChange={(e) =>
                  handleInputChange("account_num", e.target.value)
                }
              />
            </div>
          </div>
          <div className="title-and-input">
            <div>Account Name*</div>
            <Input
              size="large"
              placeholder="Account Name"
              value={invoiceData.account_name}
              onChange={(e) =>
                handleInputChange("account_name", e.target.value)
              }
            />
          </div>
        </div>
      </div>
      <div className="details-container">
        <div className="details-title">Notes</div>
        <TextArea
          size="large"
          placeholder="Add your note here"
          autoSize={{ minRows: 3 }}
          value={invoiceData.note}
          onChange={(e) => handleInputChange("note", e.target.value)}
        />
        <div className="blank-area"></div>
      </div>
    </div>
  );
}
