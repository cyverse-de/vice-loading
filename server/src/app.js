import express from 'express';
import { getDB } from './db';
import hasValidSubdomain, { extractSubdomain } from './subdomain';
import { endpointConfig, ingressExists } from './ingress';
import compression from 'compression';
import helmet from 'helmet';
import noCache from 'nocache';
import morgan from 'morgan';
import path from 'path';
import url from 'url';

const fetch = require('node-fetch');
const debug = require('debug')('app');
const dateFunc = require("add-subtract-date");

const db = getDB();

const app = express();
app.use(compression());
app.use(helmet());
app.use(morgan('combined'));

app.use('/healthz', noCache());
app.get('/healthz', async (req, res) => await db.one(`select version from version order by applied desc limit 1;`, [])
    .then(version => res.status(200).send(version))
    .catch(e => res.status(500).send(`error fetching version from database: ${e}`)));

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

  let ready = await fetch(urlToCheck , {
    "redirect": "manual"
  })
  .then(resp => {
    debug(`url-ready; URL: ${urlToCheck}; fetch response: ${resp.status}`);
    if (resp.status >= 200 && resp.status < 400) {
      return true;
    }
    return false;
  })
  .catch(e => false);

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ready: ready}));
});

app.use('/api', apirouter);

const uiDir = '../../client-loading/build';
const uiPath = path.join(__dirname, uiDir);
app.use(express.static(uiPath));

export default app;
