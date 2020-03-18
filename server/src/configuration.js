import config from "config";

export const listenPort = config.get("listen_port");
export const viceDomain = config.get("vice_domain");
export const appExposerHeader = config.get("app_exposer_header");
export const db = config.get("db");
export const ingress = config.get("ingress");
export const ui = config.get("ui");