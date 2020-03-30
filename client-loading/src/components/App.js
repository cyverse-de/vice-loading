import React, { useEffect } from "react";

import LoadingFeedback from "./loadingFeedback";
import logo from "../images/logo.png";
import loadingRocket from "../images/loading.png";
import "../css/App.css";

import { useQuery } from "react-query";

const App = () => {
  useEffect(() => {
    document.title = "CyVerse VICE Apps";
  });

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

  return (
    <div className="app">
      <header>
        <img src={logo} className="app-logo" alt="logo" />
      </header>

      <h1 className="welcome">Welcome!</h1>

      <img
        src={loadingRocket}
        className="loading"
        alt="Loading rocket for an in-progress job"
      />

      <LoadingFeedback ready={ready} />
    </div>
  );
};

export default App;
