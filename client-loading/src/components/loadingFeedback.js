import React from "react";
import { useQuery } from "react-query";

const Msg = ({ text }) => {
  return <div className="analysisMessage">{text}</div>;
};

const Statuses = ({ data }) => {
  let statuses = [];

  const addMsg = text => {
    statuses = [...statuses, <Msg text={text} />];
  };

  const setMsg = text => {
    statuses = [<Msg text={text} />];
  };

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

      setMsg(`Kubernetes pod phase: ${pod.phase}`);

      if (pod.message !== "") {
        addMsg(`Message: ${pod.message}`);
      }

      if (pod.reason !== "") {
        addMsg(`Reason: ${pod.reason}`);
      }
    } else {
      addMsg("Kubernetes pods created.");
    }
  }

  if (statuses.length === 0) {
    setMsg("No Kubernetes resources found for the analysis.");
  }

  return <div className="loading-feedback">{statuses}</div>;
};

const LoadingDots = () => {
  return (
    <div className="loading-feedback">
      <div className="analysisMessage">
        Please wait while we launch your application.
      </div>

      <div className="loading-dots">
        <div className="loading-dots--dot" />
        <div className="loading-dots--dot" />
        <div className="loading-dots--dot" />
      </div>
    </div>
  );
};

const LoadingFeedback = ({ ready }) => {
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

  if (ready) {
    window.location.href = getAppURL();
  }

  let analysisMessage;

  switch (status) {
    case "error":
      analysisMessage = (
        <div className="analysisMessage">{`An error occurred loading the status: ${error.message}`}</div>
      );
      break;
    case "loading":
      analysisMessage = <LoadingDots />;
      break;
    default:
      analysisMessage = <Statuses data={data} />;
  }

  return <>{analysisMessage}</>;
};

const getAppURL = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get("url");
};

export default LoadingFeedback;
