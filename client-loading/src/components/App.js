import React, { useEffect } from "react";

import LoadingFeedback from "./loadingFeedback";
import logo from "../images/logo.png";
import loadingRocket from "../images/loading.png";
import "../css/App.css";

import { useQuery } from "react-query";

const getAppURL = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get("url");
};

const App = () => {
  useEffect(() => {
    document.title = "CyVerse VICE Apps";
  });

  // Checks to see if the analysis is actually live.
  const { status, data, error } = useQuery(
    "url-ready",
    async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const data = await fetch(`/api/url-ready?url=${searchParams.get("url")}`)
        .then(resp => resp.json())
        .catch(e => {
          throw e;
        });
      return data;
    },
    {
      refetchInterval: 5000
    }
  );

  if (status === "error") {
    console.log(error.message);
  }

  let ready;
  if (status === "error" || status === "loading") {
    ready = false;
  } else {
    ready = data.ready;
  }

  // Change the user's page to the running app.
  if (ready) {
    window.location.href = getAppURL();
  }

  return (
    <div className="app">
      <header>
        <img src={logo} className="app-logo" alt="logo" />
      </header>

      <h1 className="welcome">Loading VICE analysis...</h1>

      <LoadingFeedback ready={ready} />
    </div>
  );
};

export default App;
