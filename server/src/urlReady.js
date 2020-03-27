/**
 * @author johnworth
 *
 * Implementation of the url-ready check, which returns whether or not the VICE
 * app is ready for end users to access.
 *
 * @module urlReady
 */
import fetch from "node-fetch";
import url from "url";

import hasValidSubdomain, { extractSubdomain } from "./subdomain";
import { ingressExists, endpointConfig } from "./ingress";
import * as config from "./configuration";

const debug = require("debug")("app");

/**
 * Handles the url-ready logic when running VICE outside of k8s. Returns whether
 * the URL is ready or not.
 *
 * @param {String} subdomain - The VICE subdomain to check.
 * @param {String} urlToCheck - The full URL being checked.
 * @returns {Boolean}
 */
const k8sDisabled = async (subdomain, urlToCheck) => {
  let ready = await ingressExists(subdomain);
  let endpoint;

  debug(`url-ready; URL: ${urlToCheck}; ready after ingress check: ${ready}`);

  if (ready) {
    endpoint = await endpointConfig(subdomain).catch(e => {
      debug(`url-ready: URL: ${urlToCheck}; endpoint config error: ${e}`);
      ready = false;
    });
  }

  debug(
    `url-ready; URL: ${urlToCheck}; ready after fetching endpoint config: ${ready}`
  );

  if (ready) {
    ready = await fetch(urlToCheck, {
      redirect: "manual"
    })
      .then(resp => {
        debug(`url-ready; URL: ${urlToCheck}; fetch response: ${resp.status}`);
        if (resp.status >= 200 && resp.status < 400) {
          return true;
        }
        return false;
      })
      .catch(e => {
        console.log(e);
        return false;
      });
  }

  debug(`url-ready; URL: ${urlToCheck}; ready after fetching URL: ${ready}`);

  if (ready) {
    ready = await fetch(`http://${endpoint.IP}:${endpoint.Port}/url-ready`, {
      redirect: "manual"
    })
      .then(resp => resp.json())
      .then(data => data["ready"])
      .then(data => {
        debug(
          `url-ready; URL: ${urlToCheck}; endpoint: http://${endpoint.IP}:${endpoint.Port}/url-ready; fetch endpoint response: ${data}`
        );
        return data;
      })
      .catch(e => {
        console.log(e);
        return false;
      });
  }

  debug(
    `url-ready; URL: ${urlToCheck}; ready after fetching endpoint: ${ready}`
  );

  return ready;
};

/**
 * Handles url-ready logic when k8s support is enabled. Returns whether or not
 * the URL is ready.
 *
 * @param {String} subdomain - The VICE subdomain to check.
 * @returns {Boolean}
 */
const k8sEnabled = async subdomain => {
  const viceAPI = new url.URL(
    `/vice/${subdomain}/url-ready`,
    config.appExposerURL
  );

  let ready = await fetch(viceAPI, {
    redirect: "manual"
  })
    .then(resp => resp.json())
    .then(data => data["ready"])
    .then(data => {
      debug(`url-ready; URL: ${viceAPI}; ${data}`);
      return data;
    })
    .catch(e => {
      console.log(e);
      return false;
    });

  return ready;
};

/**
 * The Express handler that delegates logic to either k8sDisabled() or
 * k8sEnabled().
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns null
 */
const urlReadyHandler = async (req, res) => {
  const urlToCheck = req.query.url;

  debug(`url-ready; URL: ${urlToCheck}`);

  if (!hasValidSubdomain(urlToCheck)) {
    debug(`url-ready; URL: ${urlToCheck}; hasValidSubdomain: false`);
    throw new Error(`no valid subdomain found in ${urlToCheck}`);
  }

  const subdomain = extractSubdomain(urlToCheck);
  debug(`url-ready; URL: ${urlToCheck}; subdomain: ${subdomain}`);

  let ready = false;

  if (!config.k8sEnabled) {
    ready = k8sDisabled(subdomain, urlToCheck);
  } else {
    ready = k8sEnabled(subdomain);
  }

  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ ready: ready }));
};

export default urlReadyHandler;
