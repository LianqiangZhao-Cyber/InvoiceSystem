import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { SelectSmall, MultipleSelect } from "../components/Select";
import { ButtonSizes } from "../components/Buttons";
import { BasicModal } from "../components/Model";
import waiting from "../assets/waiting.gif";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import OutlinedAlerts from "../components/Alert";
import success from "../assets/success.png";
import SparklesText from "@/components/SparklesText";
import { useParams } from "react-router-dom";
import "./global.css";

// this is validation page
export default function Validation() {
  const token = localStorage.getItem("token");
  const [showIcon, setShowIcon] = useState(false);
  const [validationReport, setValidationReport] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [selectedRules, setSelectedRules] = useState([]);
  const [invoiceUuidMap, setInvoiceUuidMap] = useState({});
  const [openList, setOpenList] = useState({});
  const [alert, setAlert] = useState(null);
  const [validatedStatus, setValidatedStatus] = useState(null);
  const [open, setOpen] = useState(false);
  const { id } = useParams(); // Destructure the id from useParams
  const [idNum, setIdNum] = useState(null);
  const [idName, setIdName] = useState(""); // State to store the file name corresponding to idNum
 
  // Extract idNum from URL parameter if present
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
        setSelectedInvoice([foundIdName]); // Select the invoice file name
      }
    }
  }, [idNum, invoiceUuidMap]); // Run the effect when `idNum` or `invoiceUuidMap` changes


  const handleListClick = (listName) => {
    setOpenList((prev) => ({
      ...prev,
      [listName]: !prev[listName],
    }));
  };

  const handleClose = () => {
    setOpen(false);
  };

  const rules = [
    "AUNZ_PEPPOL_1_0_10",
    "AUNZ_PEPPOL_SB_1_0_10",
    "AUNZ_UBL_1_0_10",
    "FR_EN16931_CII_1_3_11",
    "RO_RO16931_UBL_1_0_8_EN16931",
    "FR_EN16931_UBL_1_3_11",
    "RO_RO16931_UBL_1_0_8_CIUS_RO",
  ];

  const handleClear = () => {
    setSelectedRules([]);
    setSelectedInvoice("");
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
          (entry) => entry.state === "unvalidated"
        );
        const invoiceList = passedData.map((entry) =>
          entry.file.split("/").pop()
        );
        const uuidMap = passedData.reduce((acc, entry) => {
          acc[entry.file.split("/").pop()] = entry.uuid;
          return acc;
        }, {});
        setInvoices(invoiceList);
        setInvoiceUuidMap(uuidMap);
      })
      .catch((error) => {
        setAlert({ severity: "error", message: error.message });
      });
  }, [token]);

  useEffect(() => {
    fetchInvoiceData();
  }, [token, fetchInvoiceData]);

// post validation information and receive the backend validated report
  const handleValidate = () => {
    const selectedUuid = invoiceUuidMap[selectedInvoice];
    if (!selectedUuid) {
      setAlert({ severity: "warning", message: "Please select an invoice" });
      return;
    }
    setShowIcon(true);
    axios
      .post("http://backend:8000/invoice/invoice-validation/", null, {
        params: {
          uuid: selectedUuid || idNum,
          rules: selectedRules.join(","),
        },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const validatedStatus =
          response.data.validation_report.report.successful;
        setValidatedStatus(validatedStatus);
        setValidationReport(response.data.validation_report);
        // console.log(response.data);
        setShowIcon(false);
        handleClear();
        fetchInvoiceData();
        setOpen(true);  // Open the modal when validation is done
      })
      .catch((error) => {
        if (error.response) {
          setAlert({
            severity: "error",
            message: error.response.data.error || "validate failed",
          });
          setValidationReport(error.response.data.validation_report);
        } else {
          setAlert({ severity: "error", message: error.message });
        }
        setShowIcon(false);
        setOpen(true);  // Open the modal even if validation fails
      });
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          gap: "20px",
        }}
      >
        <SparklesText
          text="Validate your E-invoice"
          className="validate-title"
        />
        <h6 className="type">please choose your invoice and rules</h6>
        <div className="validate-form-group">
          <MultipleSelect
            lists={rules}
            onChange={setSelectedRules}
            dataTestId="select-Rules"
            selected={selectedRules}
            style={{ width: "100%" }}
            className="multiple-select"
          />
          <SelectSmall
            invoices={invoices}
            dataTestId="select-Invoice"
            selectedInvoice={selectedInvoice}
            onChange={(e) => {
              const value = e.target.value;
              if (invoices.includes(value)) {
                setSelectedInvoice(value);
              } else {
                setSelectedInvoice("");
              }
            }}
            className="select-small"
          />
          <ButtonSizes onClick={handleValidate}>Validate</ButtonSizes>
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
            <img src={waiting} alt="icon" />
          </div>
        )}

        <BasicModal
          title="Validation Result"
          open={open}
          onClose={handleClose}
          actions={[
            {
              label: "OK",
              onClick: handleClose,
            },
          ]}
        >
          {validatedStatus !== null ? (
            validatedStatus ? (
              <div style={{ padding: "10px", justifyContent: "center", display: 'flex' }}>
                <img src={success} alt="icon" />
              </div>
            ) : (
              <div style={{ overflowY: "auto", height: "calc(400px)" }}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Attribute</TableCell>
                        <TableCell>Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Statement</TableCell>
                        <TableCell>
                          <Typography color="error" gutterBottom>
                            failed
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Customer</TableCell>
                        <TableCell>{validationReport?.customer}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>File Name</TableCell>
                        <TableCell>
                          {validationReport?.report?.filename}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Errors</TableCell>
                        <TableCell>
                          {
                            validationReport?.report
                              ?.firedAssertionErrorsCount
                          }
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Successful Reports</TableCell>
                        <TableCell>
                          {
                            validationReport?.report
                              ?.firedSuccessfulReportsCount
                          }
                        </TableCell>
                      </TableRow>
                      {validationReport?.report?.reports &&
                        Object.keys(validationReport.report.reports).map(
                          (listName, index) => (
                            <TableRow key={index}>
                              <TableCell colSpan={2}>
                                <ListItemButton
                                  onClick={() => handleListClick(listName)}
                                >
                                  <ListItemText primary={listName} />
                                  {openList[listName] ? (
                                    <ExpandLess />
                                  ) : (
                                    <ExpandMore />
                                  )}
                                </ListItemButton>
                                <Collapse
                                  in={openList[listName]}
                                  timeout="auto"
                                  unmountOnExit
                                >
                                  <List component="div" disablePadding>
                                    {validationReport.report.reports[
                                      listName
                                    ].firedAssertionErrors.map(
                                      (error, ruleIndex) => (
                                        <ListItemButton
                                          key={ruleIndex}
                                          sx={{ pl: 4 }}
                                        >
                                          <ListItemText primary={error.text} />
                                        </ListItemButton>
                                      )
                                    )}
                                  </List>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )
          ) : (
            <div>Loading...</div>
          )}
        </BasicModal>
      </div>
    </div>
  );
}
