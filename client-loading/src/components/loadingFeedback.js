import React from "react";
import { useQuery } from "react-query";

import loadingRocket from "../images/loading.png";
import "../css/App.css";

const Msg = ({ text, errored = false }) => {
  let classname = "message";
  if (errored) {
    classname = "messageError";
  }
  return <div className={classname}>{text}</div>;
};

const LoadingDots = () => {
  return (
    <div className="loading-dots">
      <div className="loading-dots--dot" />
      <div className="loading-dots--dot" />
      <div className="loading-dots--dot" />
    </div>
  );
};

const LoadingFeedback = () => {
  let messages = [];

  const addMsg = (text, errored = false) => {
    messages = [...messages, <Msg text={text} errored={errored} />];
  };

  const setMsg = (text, errored = false) => {
    messages = [<Msg text={text} errored={errored} />];
  };

  const { status, data, error } = useQuery(
    "status",
    async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const data = await fetch(`/api/status?url=${searchParams.get("url")}`)
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

  switch (status) {
    case "loading":
      setMsg("Please wait while we launch your application.");
      addMsg(<LoadingDots />);
      break;

    case "error":
      setMsg(`An error occurred loading the status: ${error.message}`);
      break;

    default:
      if (data.deployments.length > 0) {
        addMsg("Kubernetes Deployment created.");
      }

      if (data.services.length > 0) {
        addMsg("Kubernetes Service created.");
      }

      if (data.ingresses.length > 0) {
        addMsg("Kubernetes Ingress created.");
      }

      if (data.configMaps.length > 2) {
        addMsg("Kubernetes ConfigMaps created.");
      }

      if (data.pods.length > 0) {
        if (data.pods[0].phase !== "Running") {
          const pod = data.pods[0];

          addMsg(`Kubernetes pod phase: ${pod.phase}`);

          if (pod.message !== "") {
            addMsg(`Message: ${pod.message}`);
          }

          if (pod.reason !== "") {
            addMsg(`Reason: ${pod.reason}`);
          }
        } else {
          addMsg("Kubernetes pods created.");
          addMsg("Waiting for app to respond...");
          addMsg(<LoadingDots />);
        }
      }
  }

  if (messages.length === 0) {
    setMsg("No Kubernetes resources found for the analysis.", true);
    addMsg("Please contact support through the Discovery Environment.", true);
  }

  return (
    <>
      {(messages.length <= 3 || status === "loading") && (
        <img
          src={loadingRocket}
          className="loading"
          alt="Loading rocket for an in-progress job"
        />
      )}

      <div className="loading-feedback">{messages}</div>
    </>
  );
};

export default LoadingFeedback;
