import React from "react";

const LoadingDots = () => {
  return (
    <div>
      <div className="analysisMessage">
        Please wait while we launch your application.
      </div>

      <div className="loading-dots">
        <div className="loading-dots--dot"></div>
        <div className="loading-dots--dot"></div>
        <div className="loading-dots--dot"></div>
      </div>
    </div>
  );
};

const LoadingFeedback = ({ ready }) => {
  let feedback;

  console.log(ready);

  if (ready) {
    //window.location.href = getAppURL();
    console.log(getAppURL());
  } else {
    feedback = <LoadingDots />;
  }

  return <div className="loading-feedback">{feedback}</div>;
};

const getAppURL = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get("url");
};

export default LoadingFeedback;
