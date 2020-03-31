import React from "react";
import { useQuery } from "react-query";

const Statuses = ({ data }) => {
  let statuses = [];

  if (data.deployments.length > 0) {
    statuses = [
      ...statuses,
      <div className="analysisMessage">Kubernetes Deployment created.</div>
    ];
  }

  if (data.services.length > 0) {
    statuses = [
      ...statuses,
      <div className="analysisMessage">Kubernetes Service created.</div>
    ];
  }

  if (data.ingresses.length > 0) {
    statuses = [
      ...statuses,
      <div className="analysisMessage">Kubernetes Ingress created.</div>
    ];
  }

  if (data.configMaps.length > 2) {
    statuses = [
      ...statuses,
      <div className="analysisMessage">Kubernetes ConfigMaps created.</div>
    ];
  }

  if (statuses.length === 0) {
    statuses = [
      <div className="analysisMessage">
        No Kubernetes resources found for the analysis.
      </div>
    ];
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
