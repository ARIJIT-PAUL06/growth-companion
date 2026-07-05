import axios from "axios";
import dotenv from "dotenv";
import FormData from "form-data";
import fs from "fs";
import os from "os";
import path from "path";

dotenv.config();

const BASE_URL = process.env.COGNEE_BASE_URL;
const API_KEY = process.env.COGNEE_API_KEY;
const TENANT_ID = process.env.COGNEE_TENANT_ID;

const headers = {
  "X-Api-Key": API_KEY,
  "X-Tenant-Id": TENANT_ID,
  "Content-Type": "application/json",
};

export const addTextMemory = async (message) => {
  try {
    const body = {
      textData: [message],
      datasetName: "growth-memory",
      datasetId: "",
      nodeSet: ["memory"]
    };

    const response = await axios.post(
      `${BASE_URL}/api/v1/add_text`,
      body,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Cognee add_text error:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const recallMemory = async (query) => {
  try {
    const body = {
      query,
      searchType: "GRAPH_COMPLETION",
      datasets: ["growth-memory"],
      topK: 5,
    };

    const response = await axios.post(
      `${BASE_URL}/api/v1/recall`,
      body,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Cognee recall error:",
      error.response?.data || error.message
    );
    return [];
  }
};

export const cognifyMemory = async () => {
  try {
    const body = {
      datasets: ["growth-memory"],
      datasetIds: [],
      runInBackground: false,
    };

    const response = await axios.post(
      `${BASE_URL}/api/v1/cognify`,
      body,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Cognee cognify error:",
      error.response?.data || error.message
    );
    return null;
  }
};
export const rememberMemory = async (message) => {
  try {
    const body = {
  data: message,
  datasetName: "growth-memory",

  custom_prompt: `
You are building a long-term cognitive memory graph.

Extract:
- emotions
- stressors
- burnout indicators
- confidence level
- anxiety indicators
- energy level
- academic pressure
- sleep issues
- goals
- coping strategies
- recurring themes

Represent relationships whenever possible.
`,

  node_set: ["memory"],
};
    const response = await axios.post(
      `${BASE_URL}/api/v1/remember`,
      body,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Cognee remember error:",
      error.response?.data || error.message
    );

    return null;
  }
};