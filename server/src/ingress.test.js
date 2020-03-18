const nock = require("nock");

import { endpointConfig, ingressExists, IngressError } from "./ingress";

const APP_EXPOSER_HEADER = "app-exposer";
// const DB = "postgres://user:password@host:port/db";
// const VICE_DOMAIN = "https://cyverse.run:4343";
const INGRESS = "http://localhost:8082";

afterEach(nock.cleanAll);

describe("endpointConfig", () => {
  test("endpointConfig with JSON response", async () => {
    const respObj = {
      IP: "127.0.0.1",
      Port: 1247
    };

    nock(INGRESS, {
      reqheaders: {
        host: APP_EXPOSER_HEADER
      }
    })
      .get(`/endpoint/afoo`)
      .reply(200, respObj);

    const config = await endpointConfig("afoo", INGRESS, APP_EXPOSER_HEADER);

    expect(config).toEqual(respObj);
  });

  test("endpointConfig with error", async () => {
    const respObj = {
      IP: "127.0.0.1",
      Port: 1247
    };

    const error = "this is an error";

    nock(INGRESS, {
      reqheaders: {
        host: APP_EXPOSER_HEADER
      }
    })
      .get(`/endpoint/afoo`)
      .replyWithError(error);

    expect.assertions(1);
    return endpointConfig("afoo", INGRESS, APP_EXPOSER_HEADER).catch(e =>
      expect(e.message).toMatch("this is an error")
    );
  });
});

describe("ingressExists", () => {
  test("ingressExists returns true", async () => {
    const respObj = {
      this: "could be",
      anything: "really"
    };

    nock(INGRESS, {
      reqheaders: {
        host: APP_EXPOSER_HEADER
      }
    })
      .get(`/ingress/afoo`)
      .reply(200, respObj);

    const retval = await ingressExists("afoo", INGRESS, APP_EXPOSER_HEADER);

    expect(retval).toEqual(true);
  });

  test("ingresssExists with error raised from fetch", async () => {
    const respObj = {
      this: "could be",
      anything: "really"
    };

    nock(INGRESS, {
      reqheaders: {
        host: APP_EXPOSER_HEADER
      }
    })
      .get(`/ingress/afoo`)
      .replyWithError(respObj);

    const retval = await ingressExists("afoo", INGRESS, APP_EXPOSER_HEADER);

    expect(retval).toEqual(false);
  });

  test("ingresssExists with error raised from fetch", async () => {
    const respObj = {
      this: "could be",
      anything: "really"
    };

    nock(INGRESS, {
      reqheaders: {
        host: APP_EXPOSER_HEADER
      }
    })
      .get(`/ingress/afoo`)
      .reply(404, respObj);

    const retval2 = await ingressExists("afoo", INGRESS, APP_EXPOSER_HEADER);

    expect(retval2).toEqual(false);
  });
});
