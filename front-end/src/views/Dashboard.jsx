import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import OutlinedAlerts from "../components/Alert";
import SparklesText from "@/components/SparklesText";
import { DashboardCard } from "@/components/CardBorder";
import PieActiveArc from "@/components/Pie";
import SimpleLineChart from "@/components/SimpleLineChart";
import { Card, CardContent, Typography } from "@mui/material";

// this is dashboard page
export default function Dashboard() {
  const token = localStorage.getItem("token");
  const [alert, setAlert] = useState(null);
  const [total, setTotal] = useState(0);
  const [success, setSuccess] = useState(0);
  const [fail, setFail] = useState(0);
  const [unvalidated, setUnvalidated] = useState(0);
  const [totalTime, setTotalTime] = useState([]);
  const [sentTime, setSentTime] = useState([]);
// set the data for x-axis label in line chart
  const xLabels = [
    ...new Set([
      ...sentTime.map((d) => d.create_date),
      ...totalTime.map((d) => d.create_date),
    ]),
  ].sort((a, b) => new Date(a) - new Date(b));
// get key is a create_date and the corresponding value is the count for send invoives
  const sendDataMap = sentTime.reduce((acc, curr) => {
    acc[curr.create_date] = curr.count;
    return acc;
  }, {});
// get key is a create_date and the corresponding value is the count for total invoives
  const totalDataMap = totalTime.reduce((acc, curr) => {
    acc[curr.create_date] = curr.count;
    return acc;
  }, {});
// set the number for y-axis label in line chart
  const sendInvoiceCounts = xLabels.map((date) => sendDataMap[date] || 0);
  const totalInvoiceCounts = xLabels.map((date) => totalDataMap[date] || 0);
// for pie chart
  const data = [
    { id: 0, value: success, label: "Validation Successful", color: "#FED5D4" },
    { id: 1, value: fail, label: "Validation Failed", color: "#D5F9EF" },
    {
      id: 2,
      value: unvalidated,
      label: "Unvalidated Invoices",
      color: "#F8D4BC",
    },
  ];
// get the numbers of invoices 
  const fetchNumData = useCallback(() => {
    axios
      .get("http://backend:8000/invoice/invoice-number", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setTotal(response.data.total_files);
        setSuccess(response.data.successful_files);
        setFail(response.data.failed_files);
        setUnvalidated(response.data.unvalidated_files);
        setTotalTime(response.data.total_invoice_timebase);
        setSentTime(response.data.send_invoice_timebase);
      })
      .catch((error) => {
        setAlert({ severity: "error", message: error.message });
      });
  }, [token]);

  useEffect(() => {
    fetchNumData();
  }, [fetchNumData]);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
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
      <div>
        <div
          className="container mx-auto p-7"
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <SparklesText
            text="Hi, Welcome Back!"
            colors={{ first: "#FFD700", second: "#FF4500" }}
            className="my-custom-class"
            sparklesCount={8}
            style={{ textAlign: "left", fontSize: "2rem" }}
          />
        </div>
        <div
          style={{
            margin: "10px",
            width: "90%",
            padding: "10px",
          }}
        >
          <DashboardCard
            total={total}
            success={success}
            fail={fail}
            unvalidated={unvalidated}
          />
          <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
            <Card style={{ width: "50%", padding: "20px" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  NUMBERS
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Total invoices and sent invoices
                </Typography>
                <SimpleLineChart
                  xLabels={xLabels}
                  aLine={totalInvoiceCounts}
                  bLIne={sendInvoiceCounts}
                />
              </CardContent>
            </Card>
            <Card style={{ width: "50%", padding: "20px" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Numbers
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Hover your mouse
                </Typography>
                <PieActiveArc data={data} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
