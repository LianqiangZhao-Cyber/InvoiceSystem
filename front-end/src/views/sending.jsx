import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { NestedList } from "../components/List";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { InputTextField } from "../components/Inputs";
import { MultilineTextFields } from "../components/Inputs";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import shipping from "../assets/shipping.gif";
import OutlinedAlerts from "../components/Alert";
import SparklesText from "@/components/SparklesText";

// this is send page
export default function Sending() {
  const token = localStorage.getItem("token");
  const [showIcon, setShowIcon] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [passedList, setPassedList] = useState([]);
  const [failedList, setFailedList] = useState([]);
  const [unvalidatedList, setUnvalidatedList] = useState([]);
  const [invoiceUuidMap, setInvoiceUuidMap] = useState({});
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [alert, setAlert] = useState(null);
  const { id } = useParams(); // Destructure the id from useParams
  const [idNum, setIdNum] = useState(null);
  const [idName, setIdName] = useState(""); // State to store the file name corresponding to idNum

  useEffect(() => {
    if (id) {
      // Assuming the id is a string and might contain the '=' character
      console.log(id);
      const idParts = id.split('=');
      if (idParts.length > 1) {
        setIdNum(idParts[1]);
      } else {
        setIdNum(id); // If there is no '=' character, just use the id as is
      }
    } else {
      console.log('No ID in the URL');
    }
  }, [id]); // Only run the effect when `id` changes

  useEffect(() => {
    if (idNum && invoiceUuidMap) {
      // Find the file name corresponding to the idNum (UUID)
      const foundIdName = Object.keys(invoiceUuidMap).find(key => invoiceUuidMap[key] === idNum);
      if (foundIdName) {
        setIdName(foundIdName); // Set the file name in state
        setSelectedInvoices([foundIdName]); // Select the invoice file name
      }
    }
  }, [idNum, invoiceUuidMap]); // Run the effect when `idNum` or `invoiceUuidMap` changes

  const handleClear = () => {
    setFirstName("");
    setlastName("");
    setEmail("");
    setMessage("");
    setSelectedInvoices([]);
  };
// get all invoices data
  const fetchInvoiceData = useCallback(() => {
    axios
      .get(`http://backend:8000/invoice/invoice-info/`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const passedData = response.data.filter(
          (entry) => entry.state === "Passed"
        );
        const failedData = response.data.filter(
          (entry) => entry.state === "Failed"
        );
        const unvalidatedData = response.data.filter(
          (entry) => entry.state === "unvalidated"
        );

        const passedList = passedData.map((entry) => entry.file.split("/").pop());
        const failedList = failedData.map((entry) => entry.file.split("/").pop());
        const unvalidatedList = unvalidatedData.map((entry) => entry.file.split("/").pop());
        setPassedList(passedList);
        setFailedList(failedList);
        setUnvalidatedList(unvalidatedList);

        const uuidMap = response.data.reduce((acc, entry) => {
          acc[entry.file.split("/").pop()] = entry.uuid;
          return acc;
        }, {});
        setInvoiceUuidMap(uuidMap);
      })
      .catch((error) => {
        setAlert({ severity: "error", message: error.message });
      });
  }, [token]);

  useEffect(() => {
    fetchInvoiceData();
  }, [token, fetchInvoiceData]);

// post invoice id and input details to backend
  const handleSend = () => {
    const uuids = selectedInvoices.map((invoice) => invoiceUuidMap[invoice]);
    const fullMessage = `Dear ${firstName} ${lastName}: \n${message}`;

    if (!uuids) {
      setAlert({ severity: "warning", message: "Please select an invoice" });
      return;
    }

    setShowIcon(true);
    console.log(uuids.join(","), email, fullMessage);
    axios
      .post(
        "http://backend:8000/invoice/invoice-sending/",
        { message: fullMessage },
        {
          params: {
            uuids: uuids.join(",") || idNum,
            email: email,
          },
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        // console.log(response.data);
        setAlert({ severity: "success", message: response.data.msg });
        setShowIcon(false); 
        handleClear();
        fetchInvoiceData();
      })
      .catch((error) => {
        if (error.response) {
          setAlert({
            severity: "error",
            message: error.response.data.error || "Please input details.",
          });     
        } else {
          setAlert({ severity: "error", message: error.message });
        }
        setShowIcon(false); 
      });
  };

  const handleInvoiceSelection = (invoice) => {
    setSelectedInvoices((prevSelected) =>
      prevSelected.includes(invoice)
        ? prevSelected.filter((item) => item !== invoice)
        : [...prevSelected, invoice]
    );
    console.log(selectedInvoices)
  };

  return (
    <div>
      {alert && (
        <div
          style={{
            position: "fixed",
            top: "11vh",
            right: 10,
            width: "30%",
            zIndex: 9999,
          }}
        >
          <OutlinedAlerts
            severity={alert.severity}
            onClose={() => setAlert(null)}
          >
            {alert.message}
          </OutlinedAlerts>
        </div>
      )}
      <Box
        sx={{
          height: "calc(100vh - 80px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          marginTop: "10px",
          "& svg": {
            m: 1,
          },
        }}
      >
        <div
          style={{ margin: "50px", overflow: "auto", height: "calc(450px)" }}
        >
          <SparklesText
            style={{ textAlign: "left", fontSize: "3.5rem" }}
            text=" Choice Invoice"
            className="Choice-Invoice-title"
          />
          <NestedList
            passedList={passedList}
            failedList={failedList}
            unvalidatedList={unvalidatedList}
            onInvoiceSelect={handleInvoiceSelection}
            selectedInvoices={selectedInvoices}
          ></NestedList>
        </div>
        <Divider orientation="vertical" variant="middle" flexItem />
        <div style={{ margin: "50px" }}>
          <SparklesText
            style={{ textAlign: "left", fontSize: "3.5rem" }}
            text=" Sending To"
            className="Sending-To-title"
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <InputTextField
              label="First Name"
              id="first-name"
              defaultValue="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <div style={{ margin: "10px" }}></div>
            <InputTextField
              label="Last Name"
              id="last-name"
              defaultValue="Last Name"
              value={lastName}
              onChange={(e) => setlastName(e.target.value)}
            />
          </div>

          <InputTextField
            label="Email Address"
            id="email-address"
            defaultValue="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div style={{ margin: "10px" }}></div>
          <MultilineTextFields
            label="Your Message"
            id="your-message"
            defaultValue="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div
            style={{
              display: "flex",
              marginTop: "10px",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="contained"
              startIcon={<DeleteIcon />}
              sx={{ backgroundColor: "#eeeeee", color: "black" }}
              onClick={handleClear}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              sx={{ backgroundColor: "#263238", color: "white" }}
              onClick={handleSend}
            >
              Send
            </Button>
          </div>
          {showIcon && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                zIndex: 9999,
              }}
            >
              <img src={shipping} alt="icon" />
            </div>
          )}
        </div>
      </Box>
    </div>
  );
}
