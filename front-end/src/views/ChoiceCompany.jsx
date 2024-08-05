import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OutlinedCard } from "../components/Card";
import { ChoiceCompanyForm } from "../components/Form";
import { CreateCompanyForm } from "../components/Form";
import axios from "axios";
import OutlinedAlerts from "../components/Alert";

// this is a choice company page, after register
export default function Choice() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openCreateForm, setOpenCreateForm] = useState(false);
  const [names, setNames] = useState([]);
  const [alert, setAlert] = useState(null); 
// get the company names which have existed
  const handleOpen = () => {
    axios
      .get(`http://backend:8000/invoice/join-company/`, {
        headers: {
          Accept: "application/json", 
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setNames(response.data); 
        setOpen(true);
      })
      .catch((error) => {
        setAlert({ severity: "error", message: error.message });
      });
  };
  // close the company name list
  const handleClose = () => {
    setOpen(false);
  };
// post the company name you have choose to backend
  const handleSubmit = (names) => {
    axios
      .post(
        `http://backend:8000/invoice/join-company/`,
        {
          company_name: names,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        handleSubmitCreateForm();
        setAlert({ severity: "success", message: "You join a company!" });
      })
      .catch((error) => {
        setAlert({ severity: "error", message: error.message });
      });
    setOpen(false);
    navigate("/home");
    window.location.reload();
  };
// open the create a company form
  const handleOpenCreateForm = () => {
    setOpenCreateForm(true);
  };
// close the create a company form
  const handleCloseCreateForm = () => {
    setOpenCreateForm(false);
  };
// submit the create a company form
  const handleSubmitCreateForm = () => {
    setOpenCreateForm(false);
    localStorage.setItem("is_admin", true);
    navigate("/home");
    window.location.reload();
  };

  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    email: "",
    ABN: "",
    address: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
// post the company details to backend
  const handleChioceCompany = () => {
    axios
      .post(`http://backend:8000/invoice/create-company/`, formData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Response:", response.data);
        setAlert({ severity: "success", message: "You create a company!" });
        handleSubmitCreateForm();
      })
      .catch((error) => {
        if (error.response) {
          setAlert({ severity: "error", message: error.response.data.error });
        } else {
          setAlert({ severity: "error", message: error.message });
        }
      });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "white",
      }}
    >
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
      <h1 style={{ fontSize: "30px", marginBottom: "16px" }}>Welcome🥳</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "40vh",
          backgroundColor: "white",
          gap: "20px",
        }}
      >
        <OutlinedCard
          onClick={handleOpen}
          button="Join"
          title="Join a company"
        ></OutlinedCard>
        <OutlinedCard
          onClick={handleOpenCreateForm}
          button="Create"
          title="Create a company"
        ></OutlinedCard>
      </div>
      <ChoiceCompanyForm
        open={open}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        names={names}
      />
      <CreateCompanyForm
        open={openCreateForm}
        handleClose={handleCloseCreateForm}
        handleSubmit={handleChioceCompany}
        formData={formData}
        handleChange={handleChange}
      />
    </div>
  );
}
