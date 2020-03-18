import hasValidSubdomain, { extractSubdomain } from "./subdomain";

const VICE_DOMAIN = "https://cyverse.run:4343";

describe("hasValidSubdomain", () => {
  test("valid subdomain", () => {
    expect(
      hasValidSubdomain("https://afoo.cyverse.run:4343", VICE_DOMAIN)
    ).toBe(true);
  });
  test("does not start with a", () => {
    expect(hasValidSubdomain("foo.cyverse.run:4343", VICE_DOMAIN)).toBe(false);
  });
  test("starts with www", () => {
    expect(hasValidSubdomain("www.cyverse.run:4343", VICE_DOMAIN)).toBe(false);
  });
  test("no subdomain", () => {
    expect(hasValidSubdomain("cyverse.run:4343", VICE_DOMAIN)).toBe(false);
  });
  test("no port", () => {
    expect(hasValidSubdomain("cyverse.run", VICE_DOMAIN)).toBe(false);
  });
  test("nonsense that sort of looks like a host", () => {
    expect(hasValidSubdomain("argle.bargle", VICE_DOMAIN)).toBe(false);
  });
  test("subdomain with a . in it", () => {
    expect(hasValidSubdomain("afoo.bar.cyverse.run:4343", VICE_DOMAIN)).toBe(
      true
    );
  });
});

test("extractSubdomain", () => {
  expect(extractSubdomain("http://afoo.cyverse.run:4343")).toBe("afoo");
  expect(extractSubdomain("http://afoo.bar.cyverse.run:4343")).toBe("afoo");
  expect(() => {
    extractSubdomain("afoo.cyverse.run:4343");
  }).toThrowError();
  expect(() => {
    extractSubdomain("afoo.bar.cyverse.run:4343");
  }).toThrowError();
});
