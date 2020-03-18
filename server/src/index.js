// Entrypoint into the server-side VICE UI code.
//
// Check the ../.env.example file to see what configuration settings need to be
// set.
import app from './app';
import * as config from "./configuration";
app.listen(config.listenPort, () => console.log(`example app listening on port ${config.listenPort}!`));
