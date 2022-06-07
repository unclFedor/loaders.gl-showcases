import puppeteer from "puppeteer";


describe("Dashboard Default View", () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto("http://localhost:3000");
  });

  afterAll(() => browser.close());

  it("Should automatically redirect from '/' path", async () => {
    const currentUrl = page.url();
    expect(currentUrl).toBe("http://localhost:3000/dashboard");
  });

  it("Contains header", async () => {
    await page.waitForSelector("#header-logo");
    const text = await page.$eval("#header-logo", (e) => e.textContent);
    expect(text).toContain("I3S Explorer");
  });

  it("Contains page links", async () => {
    await page.waitForSelector("#header-links-default");

    const linksParent = await page.$("#header-links-default");
    expect(
      await linksParent.$$eval("a", (nodes) => nodes.map((n) => n.innerText))
    ).toEqual(["Home", "Viewer", "Debug", "GitHub"]);

    await page.waitForSelector("#compare-default-button");
    const text = await page.$eval("#compare-default-button", (e) => e.textContent);
    expect(text).toContain("Compare");
  });

  it("Contains dashboard canvas", async () => {
    await page.waitForSelector("#dashboard-app");

    const dashboardCanvas = await page.$$("#dashboard-app");
    expect(dashboardCanvas).toBeDefined();
  });

  it("Should go to the Viewer page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#header-links-default");
    await page.click("a[href='/viewer']");
    const currentUrl = page.url();
    expect(currentUrl).toBe("http://localhost:3000/viewer?tileset=san-francisco-v1.7");
    const controlPanel = await page.$$("#control-panel");
    expect(controlPanel).toBeDefined();
  });

  it("Should go to the Debug page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#header-links-default");
    await page.click("a[href='/debug']");
    const currentUrl = page.url();
    expect(currentUrl).toBe("http://localhost:3000/debug?tileset=san-francisco-v1.7");
    const toolBar = await page.$$("#tool-bar");
    expect(toolBar).toBeDefined();
  });

  it("Should go to the Comparison Across Layers Page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#compare-default-button");
    await page.click("#compare-default-button");
    await page.hover("a[href='/compare-across-layers']");
    await page.click("a[href='/compare-across-layers']");

    const currentUrl = page.url();
    expect(currentUrl).toBe("http://localhost:3000/compare-across-layers");
  });

  it("Should go to the Comparison Withhin Layer Page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#compare-default-button");
    await page.click("#compare-default-button");
    await page.hover("a[href='/compare-within-layer']");
    await page.click("a[href='/compare-within-layer']");

    const currentUrl = page.url();
    expect(currentUrl).toBe("http://localhost:3000/compare-within-layer");
  });

  it("Should go to the project GitHub page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#header-links-default");
    await page.click("a[href='https://github.com/visgl/loaders.gl-showcases']");
    await page.waitForTimeout(5000);

    const currentUrl = page.url();
    expect(currentUrl).toBe("https://github.com/visgl/loaders.gl-showcases");
    await page.goto("http://localhost:3000");
  });

  it("Should return from viewer page to Dashboard", async () => {
    await page.goto("http://localhost:3000/viewer");
    await page.waitForSelector("#header-links-default");
    await page.click("a[href='/dashboard']");
    const currentUrl = page.url();
    expect(currentUrl).toBe("http://localhost:3000/dashboard");
    const dashboardCanvas = await page.$$("#dashboard-app");
    expect(dashboardCanvas).toBeDefined();
  });

  it("Should contain help button", async () => {
    await page.waitForSelector("#help-button-default");
    const text = await page.$eval("#help-button-default", (e) => e.textContent);
    expect(text).toContain("Help");
  });

  it("Should contain theme button", async () => {
    await page.waitForSelector("#toggle-button-default");
    const themeButton = await page.$$("#toggle-button-default");
    const darkButton = await page.$$("#toggle-dark-default");
    const lightButton = await page.$$("#toggle-light-default");

    expect(themeButton).toBeDefined();
    expect(darkButton).toBeDefined();
    expect(lightButton).toBeDefined();
  });

  it.only("Should switch between themes", async () => {
    await page.waitForSelector("#header-container");

    // Check default theme colors of header elements
    expect(await page.$eval("#header-container", el => getComputedStyle(el).getPropertyValue('background-color'))).toEqual('rgb(35, 36, 48)');

    const linksParentDefault = await page.$("#header-links-default");
    expect(
      await linksParentDefault.$$eval("a", (nodes) => nodes.map((n) => getComputedStyle(n).getPropertyValue('color')))
    ).toEqual(["rgb(96, 194, 164)", "rgb(255, 255, 255)", "rgb(255, 255, 255)", "rgb(255, 255, 255)"]);

    expect(
      await page.$eval("#header-logo", (element) => getComputedStyle(element).getPropertyValue('color'))
    ).toEqual("rgb(255, 255, 255)");

    // Check light theme colors of header elements
    await page.click("#toggle-light-default");
    await page.waitForSelector("#header-container");

    const lightColor = await page.$eval("#header-container", el => getComputedStyle(el).getPropertyValue('background-color'));
    expect(lightColor).toEqual('rgb(255, 255, 255)');

    const linksParentLight = await page.$("#header-links-default");
    expect(
      await linksParentLight.$$eval("a", (nodes) => nodes.map((n) => getComputedStyle(n).getPropertyValue('color')))
    ).toEqual(["rgb(96, 194, 164)", "rgb(35, 36, 48)", "rgb(35, 36, 48)", "rgb(35, 36, 48)"]);

    expect(
      await page.$eval("#header-logo", (element) => getComputedStyle(element).getPropertyValue('color'))
    ).toEqual("rgb(35, 36, 48)");

    // Check dark theme colors of header elements
    await page.click("#toggle-dark-default");
    await page.waitForSelector("#header-container");

    const darkColor = await page.$eval("#header-container", el => getComputedStyle(el).getPropertyValue('background-color'));
    expect(darkColor).toEqual('rgb(35, 36, 48)');

    const linksParentDark = await page.$("#header-links-default");
    expect(
      await linksParentDark.$$eval("a", (nodes) => nodes.map((n) => getComputedStyle(n).getPropertyValue('color')))
    ).toEqual(["rgb(96, 194, 164)", "rgb(255, 255, 255)", "rgb(255, 255, 255)", "rgb(255, 255, 255)"]);

    expect(
      await page.$eval("#header-logo", (element) => getComputedStyle(element).getPropertyValue('color'))
    ).toEqual("rgb(255, 255, 255)");
  }, 60000);
});

describe("Dashboard Tablet or Mobile view", () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto("http://localhost:3000");
  });

  afterAll(() => browser.close());

  it("Should automatically redirect from '/' path", async () => {
    const currentUrl = page.url();
    expect(currentUrl).toBe("http://localhost:3000/dashboard");
  });

  it("Contains header items", async () => {
    await page.waitForSelector("#header-logo");
    await page.waitForSelector("#burger-menu");

    const text = await page.$eval("#header-logo", (e) => e.textContent);
    expect(text).toContain("I3S Explorer");

    expect(await page.$$("#burger-menu")).toBeDefined();

    await page.click("#burger-menu");
    await page.waitForSelector("#close-header-menu");
    expect(await page.$$("#close-header-menu")).toBeDefined();
    expect(await page.$$("#tablet-or-mobile-menu")).toBeDefined();
    await page.click("#close-header-menu");
    expect(!(await page.$("#tablet-or-mobile-menu")));
  });

  it("Should have items in header menu", async () => {
    await page.waitForSelector("#burger-menu");
    await page.click("#burger-menu");
    await page.waitForSelector("#header-links");

    const linksParent = await page.$("#header-links");
    expect(
      await linksParent.$$eval("a", (nodes) => nodes.map((n) => n.innerText))
    ).toEqual(["Home", "Viewer", "Debug", "GitHub"]);

    await page.waitForSelector("#compare-tablet-or-mobile-button");
    const compareText = await page.$eval("#compare-tablet-or-mobile-button", (e) => e.textContent);
    expect(compareText).toContain("Compare");

    await page.waitForSelector("#help-button-tablet-or-mobile");
    const helpText = await page.$eval("#help-button-tablet-or-mobile", (e) => e.textContent);
    expect(helpText).toContain("Help");

    await page.click("#close-header-menu");
    await page.waitForSelector("#burger-menu");
  }, 30000);

  it("Contains dashboard canvas", async () => {
    await page.waitForSelector("#dashboard-app");

    const dashboardCanvas = await page.$$("#dashboard-app");
    expect(dashboardCanvas).toBeDefined();
  });

  it("Should go to the Viewer page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#burger-menu");
    await page.click("#burger-menu");
    await page.waitForSelector("#header-links");
    await page.click("a[href='/viewer']");

    const currentUrl = page.url();
    expect(currentUrl).toBe("http://localhost:3000/viewer?tileset=san-francisco-v1.7");
    const controlPanel = await page.$$("#control-panel");
    expect(controlPanel).toBeDefined();
    expect(!(await page.$("#tablet-or-mobile-menu")));
  });

  it("Should go to the Debug page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#burger-menu");
    await page.click("#burger-menu");
    await page.waitForSelector("#header-links");
    await page.click("a[href='/debug']");
    await page.waitForTimeout(5000);

    const currentUrl = page.url();
    expect(currentUrl).toBe("http://localhost:3000/debug?tileset=san-francisco-v1.7");
    const toolBar = await page.$$("#tool-bar");
    expect(toolBar).toBeDefined();
    expect(!(await page.$("#tablet-or-mobile-menu")));
  });

  it("Should go to the project GitHub page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#burger-menu");
    await page.click("#burger-menu");
    await page.waitForSelector("#header-links");
    await page.click("a[href='https://github.com/visgl/loaders.gl-showcases']");
    await page.waitForTimeout(5000);

    const currentUrl = page.url();
    expect(currentUrl).toBe("https://github.com/visgl/loaders.gl-showcases");
    expect(!(await page.$("#tablet-or-mobile-menu")));
  });

  it("Should return from viewer page to Dashboard", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#burger-menu");
    await page.click("#burger-menu");
    await page.waitForSelector("#header-links");
    await page.click("a[href='/dashboard']");

    const currentUrl = page.url();
    expect(currentUrl).toBe("http://localhost:3000/dashboard");
    const dashboardCanvas = await page.$$("#dashboard-app");
    expect(dashboardCanvas).toBeDefined();
    expect(!(await page.$("#tablet-or-mobile-menu")));
  });

  it("Should open and close compare menu", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#burger-menu");
    await page.click("#burger-menu");
    await page.waitForSelector("#compare-tablet-or-mobile-button");
    await page.click("#compare-tablet-or-mobile-button");
    await page.waitForSelector("#across-layers-item");
    await page.waitForSelector("#within-layer-item");

    expect(await page.$$("#across-layers-item")).toBeDefined();
    expect(await page.$$("#within-layer-item")).toBeDefined();

    expect(await page.$eval("#across-layers-item", (e) => e.textContent)).toContain("Across Layers");
    expect(await page.$eval("#within-layer-item", (e) => e.textContent)).toContain("Within a Layer");

    await page.click("#compare-tablet-or-mobile-button");

    expect(!(await page.$("#across-layers-item")));
    expect(!(await page.$("#within-layer-item")));
  }, 30000);

  it("Should go to the Comparison Across Layers Page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#burger-menu");
    await page.click("#burger-menu");
    await page.waitForSelector("#compare-tablet-or-mobile-button");
    await page.click("#compare-tablet-or-mobile-button");

    await page.hover("a[href='/compare-across-layers']");
    await page.click("a[href='/compare-across-layers']");

    await page.waitForSelector("#first-deck-container");
    await page.waitForSelector("#second-deck-container");

    expect(await page.$$("#first-deck-container")).toBeDefined();
    expect(await page.$$("#second-deck-container")).toBeDefined();

    const currentUrl = page.url();
    expect(currentUrl).toBe("http://localhost:3000/compare-across-layers");
  });

  it("Should go to the Comparison Withhin Layer Page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#burger-menu");
    await page.click("#burger-menu");
    await page.waitForSelector("#compare-tablet-or-mobile-button");
    await page.click("#compare-tablet-or-mobile-button");

    await page.hover("a[href='/compare-within-layer']");
    await page.click("a[href='/compare-within-layer']");

    await page.waitForSelector("#first-deck-container");
    await page.waitForSelector("#second-deck-container");

    expect(await page.$$("#first-deck-container")).toBeDefined();
    expect(await page.$$("#second-deck-container")).toBeDefined();

    const currentUrl = page.url();
    expect(currentUrl).toBe("http://localhost:3000/compare-within-layer");
  });
});
