import express from "express";
import next from "next";
import { getDB } from "./db";
import apirouter from "./apiRouter";

import compression from "compression";
import helmet from "helmet";
import noCache from "nocache";
import morgan from "morgan";
import * as config from "./configuration";

const db = getDB();

const app = next({
    dev: true,
});
const nextHandler = app.getRequestHandler();

app.prepare()
    .then(() => {
        const server = express();
        server.use(compression);
        server.use(helmet());
        server.use(morgan("combines"));

        server.use("/healthz", noCache());
        server.get(
            "/healthz",
            async (req, res) =>
                await db
                    .one(
                        `select version from version order by applied desc limit 1;`,
                        []
                    )
                    .then((version) => res.status(200).send(version))
                    .catch((e) =>
                        res
                            .status(500)
                            .send(`error fetching version from database: ${e}`)
                    )
        );

        server.use("/api", apirouter);

        server.get("*", (req, res) => {
            return nextHandler(req, res);
        });

        server.listen(config.ListenPort, (err) => {
            if (err) throw err;
            console.log(`> Ready on http://localhost:${config.ListenPort}`);
        });
    })

    .catch((exception) => {
        console.log(exception);
        process.exit(1);
    });

export default app;
