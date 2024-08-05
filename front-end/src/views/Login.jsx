import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PasswordTextField } from "../components/Inputs";
import { ButtonSizes } from "../components/Buttons";
import { UnderlineLink, AlignRight } from "../components/Link";
import { AlertDialogSlide } from "../components/Model";
import axios from "axios";
import OutlinedAlerts from "../components/Alert";
import FormDialog from "../components/Model";
import loading from "../assets/loading.gif";
import { CompanyInfo } from "@/apis/gui";
import { useInvoice } from "@/Content/GuiContent";
import { UserTextField } from "../components/Inputs";

// this is login page
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showIcon, setShowIcon] = useState(false);
  const [alert, setAlert] = useState(null);
  const { updateInvoiceData } = useInvoice();
// update the company information
  const updateCompanyInfo = (companyData) => {
    updateInvoiceData({
      my_company_name: companyData.name,
      my_address: companyData.address,
      my_ABN: companyData.ABN,
      my_email: companyData.email,
    });
  };

  // go to other page
  const navigate = useNavigate();
  const goRegister = () => {
    navigate("/register");
  };
  const goDashboard = () => {
    navigate("/home");
  };
  // post username and password to backend and receive response
  const handleLogin = () => {
    axios
      .post("http://localhost:8000/invoice/login/", null, {
        params: {
          username: username,
          password: password,
        }, // Query parameters
        headers: {
          Accept: "application/json", // Setting the Accept header
        },
      })
      .then((response) => {
        console.log(response.data);
        // storage the token, userid, admin or user
        localStorage.setItem("token", response.data.access);
        localStorage.setItem("userid", response.data.userid);
        localStorage.setItem("is_admin", response.data.is_admin);
        setAlert({ severity: "success", message: "Login successfully!" });
        return CompanyInfo();
      })
      .then((companyInfoResponse) => {
        const companyData = companyInfoResponse.data;
        updateCompanyInfo(companyData);
        goDashboard();
        window.location.reload();
      })
      .catch((error) => {
        if (error.response) {
          setAlert({
            severity: "error",
            message: error.response.data.error || "Login failed",
          });
        } else {
          setAlert({ severity: "error", message: error.message });
        }
      });
  };
// post the username and email to backend to reset password
  const handleEmailSubmit = ({ email, username }) => {
    setShowIcon(true);
    axios
      .post(
        "http://backend:8000/invoice/password_reset/",
        {
          username: username,
          email: email,
        },
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setShowIcon(false); 
        setAlert({ severity: "success", message: response.data.message });
      })
      .catch((error) => {
        if (error.response) {
          setAlert({ severity: "error", message: error.response.data.error });
        } else {
          setAlert({
            severity: "error",
            message: error.message || "Reset password failed",
          });
        }
        setShowIcon(false);
      });
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "8px",
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
        <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>Login</h1>
        <UserTextField
          label="username"
          id="Login-username"
          dataTestId="Login-username"
          defaultValue="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <PasswordTextField
          id="Login-password"
          dataTestId="Login-password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <AlignRight>
          <FormDialog onFormSubmit={handleEmailSubmit} />
        </AlignRight>

        <ButtonSizes onClick={handleLogin}>Login</ButtonSizes>
        <UnderlineLink onClick={goRegister} fontsize="10px">
          Don't have an account? Go register
        </UnderlineLink>
        <AlertDialogSlide fontsize="8px" />
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
            <img src={loading} alt="icon" />
          </div>
        )}
      </div>
    </div>
  );
}
