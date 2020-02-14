import config from "config";

function parseBoolean(value) {
    if (typeof value == "boolean") {
        return value;
    } else if (typeof value == "string") {
        return /^\s*true\s*$/i.test(value);
    } else {
        return false;
    }
}

export const ListenPort = config.get("port");
export const ViceDomain = config.get("vice_domain");
export const AppExposerHeader = config.get("app_exposer_header");
export const DB = config.get("db");
export const DEBUG = config.get("debug");
export const Ingress = config.get("ingress");
export const DE = config.get("de");
export const K8sEnabled = parseBoolean(config.get("k8s_enabled"));
export const isDevelopment = config.get("node_env") !== "production";
process.env.NODE_ENV = config.get("node_env");
