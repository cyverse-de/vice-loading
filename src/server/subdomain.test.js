import { extractSubdomain, hasValidSubdomainConfigurable } from "./subdomain";

const testSubdomain = "https://cyverse.run:4343";

describe("hasValidSubdomainConfigurable", () => {
    test("valid subdomain", () => {
        expect(
            hasValidSubdomainConfigurable(
                "https://afoo.cyverse.run:4343",
                testSubdomain
            )
        ).toBe(true);
    });
    test("does not start with a", () => {
        expect(
            hasValidSubdomainConfigurable("foo.cyverse.run:4343", testSubdomain)
        ).toBe(false);
    });
    test("starts with www", () => {
        expect(
            hasValidSubdomainConfigurable("www.cyverse.run:4343", testSubdomain)
        ).toBe(false);
    });
    test("no subdomain", () => {
        expect(
            hasValidSubdomainConfigurable("cyverse.run:4343", testSubdomain)
        ).toBe(false);
    });
    test("no port", () => {
        expect(
            hasValidSubdomainConfigurable("cyverse.run", testSubdomain)
        ).toBe(false);
    });
    test("nonsense that sort of looks like a host", () => {
        expect(
            hasValidSubdomainConfigurable("argle.bargle", testSubdomain)
        ).toBe(false);
    });
    test("subdomain with a . in it", () => {
        expect(
            hasValidSubdomainConfigurable(
                "afoo.bar.cyverse.run:4343",
                testSubdomain
            )
        ).toBe(true);
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
