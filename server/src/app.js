import express from 'express';
import { viceAnalyses } from './db';
import hasValidSubdomain, { extractSubdomain } from './subdomain';
import { ingressExists, endpointConfig } from './ingress';
const fetch = require('node-fetch');

const app = express();
app.get('/healthz', (req, res) => res.send("I'm healthy."));
app.get('/', (req, res) => res.send("Hello, World!"));

async function urlReadyHandler(req, res) {
  const urlToCheck = req.query.url;

  if (!hasValidSubdomain(urlToCheck)) {
    throw new Error(`no valid subdomain found in ${url_to_check}`);
  }

  const subdomain = extractSubdomain(urlToCheck);

  let ready = ingressExists(subdomain);
  let endpoint;

  if (ready) {
    endpoint = await endpointConfig(subdomain).catch(e => {
      console.log(e);
      ready = false;
    });
  }

  if (ready) {
    ready = await fetch(urlToCheck, {
      "redirect": "manual"
    })
    .then(resp => {
      if (resp.ok) {
        return true;
      }
      return false;
    }).catch(e => false);
  }

  if (ready) {
    ready = await fetch(`http://${endpoint.IP}:${endpoint.Port}/url-ready`, {
      "redirect": "manual"
    })
    .then(resp => resp.json())
    .then(data => data["ready"])
    .catch(e => false);
  }

  res.send(JSON.stringify({"ready":ready}));
}

async function viceAnalysesHandler(req, res) {
  const username = req.query.user;
  viceAnalyses(username, (data) => {
    res.send(JSON.stringify({"vice_analyses" : data}));
  })
}

const apirouter = express.Router();
apirouter.get("/url-ready", urlReadyHandler);
apirouter.get("/analyses", viceAnalysesHandler);

app.use('/api', apirouter);

export default app;
