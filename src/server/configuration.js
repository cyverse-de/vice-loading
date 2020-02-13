import config from "config";

export const ListenPort = config.get("port");
export const ViceDomain = config.get("vice_domain");
export const AppExposerHeader = config.get("app_exposer_header");
export const DB = config.get("db");
export const DEBUG = config.get("debug");
export const Ingress = config.get("ingress");
export const DE = config.get("de");
