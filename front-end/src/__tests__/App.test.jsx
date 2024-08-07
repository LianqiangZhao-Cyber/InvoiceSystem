import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeAll, afterAll } from "vitest";
import App from "../App";
import { render_this_router } from "./test_functions";

describe("App structure test without login", () => {
  // default page
  test("render default page", () => {
    render_this_router(["/"], App);
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
  });

  // Not Found Page
  test("render NotFound page for unknown router 1", () => {
    render_this_router(["/404"], App);
    expect(screen.getByText(/404 Not Found/i)).toBeInTheDocument();
  });

  test("render NotFound page for unknown router 2", () => {
    render_this_router(["/*"], App);
    expect(screen.getByText(/404 Not Found/i)).toBeInTheDocument();
  });

  // Dashboard Page
  test("render Dashboard page for /home route", () => {
    render_this_router(["/home"], App);
    expect(screen.getAllByText(/E-Invoice/i)[0]).toBeInTheDocument();
  });
});

describe("App structure test with login", () => {
  beforeAll(() => {
    localStorage.setItem("token", "mock_token");
  });

  afterAll(() => {
    localStorage.clear();
  });

  // Creation
  test("render Create page", () => {
    render_this_router(["/create"], App);
    expect(screen.getByText(/Create your E-invoice/i)).toBeInTheDocument();
  });

  // Upload
  test("render Upload page in Create page", () => {
    render_this_router(["/create/upload"], App);
    expect(screen.getByText(/Upload File/i)).toBeInTheDocument();
  });

  // Form
  test("render Form page in Create page for /create/form route", () => {
    render_this_router(["/create/form"], App);
    expect(screen.getByText(/Invoice Details/i)).toBeInTheDocument();
  });

  // login
  test("render login page", () => {
    render_this_router(["/login"], App);
    expect(screen.getAllByText(/Login/i)[0]).toBeInTheDocument();
  });

  // register
  test("render register page", () => {
    render_this_router(["/register"], App);
    expect(screen.getByText(/Create an account/i)).toBeInTheDocument();
  });

  // choice
  test("render choice page", () => {
    render_this_router(["/choice"], App);
    expect(screen.getByText(/Welcome🥳/i)).toBeInTheDocument();
  });

  // draft
  test("render draft page", () => {
    render_this_router(["/draft"], App);
    expect(screen.getByText(/Invoices Drafts/i)).toBeInTheDocument();
  });

  // profile
  test("render profile page", () => {
    render_this_router(["/profile"], App);
    expect(screen.getAllByText(/Profile/i)[0]).toBeInTheDocument();
  });

  // company-details
  test("render company-details", async () => {
    render_this_router(["/company-details"], App);
    await waitFor(() => {
        // expect(screen.getByText("Company Information")).toBeInTheDocument();
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });
});

