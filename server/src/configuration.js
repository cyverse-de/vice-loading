import config from "config";

export const listenPort = config.get("listen_port");
export const viceDomain = config.get("vice_domain");
export const db = config.get("db");
export const ui = config.get("ui");
export const k8sEnabled = config.get("k8s_enabled");
export const appExposerURL = config.get("app_exposer.url");
export const logLevel = config.get("log.level");
export const logLabel = config.get("log.label");
