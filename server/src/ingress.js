import url from "url";
import * as config from "./configuration";
import fetch from "node-fetch";

const debug = require("debug")("ingress");

export class IngressError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, IngressError);
  }
}

// Fetches K8s Endpoint information about the subdomain from the app-exposer
// service, returns a promise with the response body parsed as JSON.
export function endpointConfig(
  subdomain,
  appExposerURL = config.appExposerURL
) {
  let endpointAPI = new url.URL(appExposerURL);
  endpointAPI.pathname = `/endpoint/${subdomain}`;

  debug(
    `fetching endpoint config from ${endpointAPI.toString()} for ${subdomain}`
  );

  return fetch(endpointAPI.toString()).then(response => {
    debug(
      `response from ${endpointAPI.toString()} for ${subdomain}: ${
        response.status
      }`
    );
    return response.json();
  });
}

// Returns true if an ingress exists for the subdomain passed in.
export async function ingressExists(
  subdomain,
  appExposerURL = config.appExposerURL
) {
  const ingressAPI = new url.URL(`/ingress/${subdomain}`, appExposerURL);

  debug(`ingress check; subdomain: ${subdomain}; api ${ingressAPI.toString()}`);

  return fetch(ingressAPI.toString())
    .then(response => {
      if (response.ok) {
        return true;
      }
      return false;
    })
    .then(value => {
      debug(
        `ingress check; subdomain: ${subdomain}; api: ${ingressAPI.toString()}; ok: ${value}`
      );
      return value;
    })
    .catch(e => {
      debug(e);
      return false;
    });
}
