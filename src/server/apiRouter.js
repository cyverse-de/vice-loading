import express from "express";
import url from "url";
import hasValidSubdomain, { extractSubdomain } from "./subdomain";
import { endpointConfig, ingressExists } from "./ingress";
import noCache from "nocache";

const fetch = require("node-fetch");
const debug = require("debug")("app");

const apirouter = express.Router();

// Caching the UI is fine, API responses not yet.
apirouter.use(noCache());

apirouter.get("/url-ready", async (req, res) => {
    const urlToCheck = req.query.url;

    debug(`url-ready; URL: ${urlToCheck}`);

    if (!hasValidSubdomain(urlToCheck)) {
        debug(`url-ready; URL: ${urlToCheck}; hasValidSubdomain: false`);
        throw new Error(`no valid subdomain found in ${urlToCheck}`);
    }

    const subdomain = extractSubdomain(urlToCheck);
    debug(`url-ready; URL: ${urlToCheck}; subdomain: ${subdomain}`);

    let ready = false;

    // k8s disabled
    if (process.env.K8S_ENABLED === "" || process.env.K8S_ENABLED === "0") {
        ready = await ingressExists(subdomain);
        let endpoint;

        debug(
            `url-ready; URL: ${urlToCheck}; ready after ingress check: ${ready}`
        );

        if (ready) {
            endpoint = await endpointConfig(subdomain).catch((e) => {
                debug(
                    `url-ready: URL: ${urlToCheck}; endpoint config error: ${e}`
                );
                ready = false;
            });
        }

        debug(
            `url-ready; URL: ${urlToCheck}; ready after fetching endpoint config: ${ready}`
        );

        if (ready) {
            ready = await fetch(urlToCheck, {
                redirect: "manual",
            })
                .then((resp) => {
                    debug(
                        `url-ready; URL: ${urlToCheck}; fetch response: ${resp.status}`
                    );
                    if (resp.status >= 200 && resp.status < 400) {
                        return true;
                    }
                    return false;
                })
                .catch((e) => false);
        }

        debug(
            `url-ready; URL: ${urlToCheck}; ready after fetching URL: ${ready}`
        );

        if (ready) {
            ready = await fetch(
                `http://${endpoint.IP}:${endpoint.Port}/url-ready`,
                {
                    redirect: "manual",
                }
            )
                .then((resp) => resp.json())
                .then((data) => data["ready"])
                .then((data) => {
                    debug(
                        `url-ready; URL: ${urlToCheck}; endpoint: http://${endpoint.IP}:${endpoint.Port}/url-ready; fetch endpoint response: ${data}`
                    );
                    return data;
                })
                .catch((e) => false);
        }

        debug(
            `url-ready; URL: ${urlToCheck}; ready after fetching endpoint: ${ready}`
        );
    } else {
        // K8s enabled

        const viceAPI = new url.URL(
            `/vice/${subdomain}/url-ready`,
            process.env.INGRESS
        );

        ready = await fetch(viceAPI, {
            redirect: "manual",
        })
            .then((resp) => resp.json())
            .then((data) => data["ready"])
            .then((data) => {
                debug(`url-ready; URL: ${viceAPI}; ${data}`);
                return data;
            })
            .catch((e) => false);
    }

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ ready: ready }));
});

export default apirouter;
