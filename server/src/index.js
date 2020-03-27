// Entrypoint into the server-side VICE UI code.
//
// Check the ../.env.example file to see what configuration settings need to be
// set.
import * as config from "./configuration";

import express from "express";
import { getDB } from "./db";
import compression from "compression";
import helmet from "helmet";
import noCache from "nocache";
import morgan from "morgan";
import path from "path";
import urlReadyHandler from "./urlReady";
import statusInfoHandler from "./statusInfo";

const db = getDB();

const app = express();
app.use(compression());
app.use(helmet());
app.use(morgan("combined"));

app.use("/healthz", noCache());
app.get(
  "/healthz",
  async (req, res) =>
    await db
      .one(`select version from version order by applied desc limit 1;`, [])
      .then(version => res.status(200).send(version))
      .catch(e =>
        res.status(500).send(`error fetching version from database: ${e}`)
      )
);

const apirouter = express.Router();

// Caching the UI is fine, API responses not yet.
apirouter.use(noCache());

apirouter.get("/url-ready", urlReadyHandler);
apirouter.get("/status-info", statusInfoHandler);

app.use("/api", apirouter);

const uiDir = "../../client-loading/build";
const uiPath = path.join(__dirname, uiDir);
app.use(express.static(uiPath));

app.listen(config.listenPort, () =>
  console.log(`vice-loading server listening on port ${config.listenPort}!`)
);
