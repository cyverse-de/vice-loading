/**
 * @author johnworth
 *
 * Hits the listing endpoint in app-exposer to get information about the launching
 * VICE app.
 *
 * @module statusInfo
 */
import fetch from "node-fetch";
import url from "url";
import querystring from "querystring";
import * as config from "./configuration";
import hasValidSubdomain, { extractSubdomain } from "./subdomain";

const debug = require("debug")("statusInfo");

const statusInfo = async (subdomain, appExposerURL = config.appExposerURL) => {
  const infoURL = new url.URL(`/vice/listing`, appExposerURL);
  infoURL.search = querystring.stringify({
    subdomain
  });

  console.log(`info-url: ${infoURL.toString()}`);

  const data = await fetch(infoURL)
    .then(resp => resp.json())
    .catch(e => {
      debug(e);
      throw e;
    });

  return data;
};

const statusInfoHandler = async (req, res) => {
  const urlToCheck = req.query.url;

  debug(`status-info: URL: ${urlToCheck}`);

  if (!hasValidSubdomain(urlToCheck)) {
    debug(`url-ready; URL: ${urlToCheck}; hasValidSubdomain: false`);
    throw new Error(`no valid subdomain found in ${urlToCheck}`);
  }

  const subdomain = extractSubdomain(urlToCheck);
  debug(`url-ready; URL: ${urlToCheck}; subdomain: ${subdomain}`);

  const data = await statusInfo(subdomain);

  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(data));
};

export default statusInfoHandler;
