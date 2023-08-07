const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");

const caribbeanCountries = [
  "Anguilla",
  "Antigua and Barbuda",
  "Aruba",
  "The Bahamas",
  "Barbados",
  "Belize",
  "Bermuda",
  "Bonaire, Sint Eustatius, and Saba",
  "British Virgin Islands",
  "Cayman Islands",
  "Cuba",

  "Dominica",
  "Dominican Republic",
  "Grenada",
  "Guadeloupe",
  "Haiti",
  "Jamaica",
  "Martinique",
  "Montserrat",
  "Puerto Rico",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Martin",
  "Saint Vincent and the Grenadines",

  "Trinidad and Tobago",
  "Turks and Caicos Islands",
  "United States Virgin Islands",
];

const outliers = ["Saint Barthélemy", "Curaçao", "Sint Maarten"];

async function run() {
  const allHopsitals = [];

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  for (let i = 0; i < caribbeanCountries.length; i++) {
    await page.goto("https://google.com");

    const searchInput = await page.$("input");

    await searchInput.type(
      "List of hospitals and medical centers in " + caribbeanCountries[i]
    );

    // Submit the search query
    await searchInput.press("Enter");

    // Wait for the link
    await page.waitForSelector("g-more-link a");

    await page.click("g-more-link a");

    // Wait for some time (optional)
    await page.waitForTimeout(5000);

    const content = await page.content();

    const $ = cheerio.load(content);

    $('div.dbg0pd[role="heading"] span.OSrXXb').each((index, element) => {
      allHopsitals.push($(element).text());
    });

    console.log(allHopsitals);
    console.log(caribbeanCountries[i]);
  }

  await browser.close();

  const jsonData = JSON.stringify(allHopsitals, null, 2);
  const filePath = "./allhospitals.json";

  fs.writeFile(filePath, jsonData, "utf8", (err) => {
    if (err) {
      console.error("Error writing JSON file:", err);
    } else {
      console.log("JSON file has been saved successfully!");
    }
  });
}

//run();

async function scrapeWaze() {
  const allHospitalsObjs = [];
  const filePath = "./allhospitals.json";

  try {
    // Read the JSON data from the file
    const data = fs.readFileSync(filePath, "utf8");
    // Parse the JSON data back to a JavaScript list
    const hospitalNames = JSON.parse(data);

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://www.waze.com/live-map");

    for (let i = 0; i < 10; i++) {
      const buttonSelector = "button.waze-tour-tooltip__acknowledge";
      const buttonExists = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        return !!element; // Returns true if the element is found, false otherwise
      }, buttonSelector);

      if (buttonExists) {
        await page.click(buttonSelector);
        console.log("Button clicked.");
      }

      // Define the selector for the element
      const elementSelector = "div.wm-search.has-value";

      // Check if the element exists on the page
      const elementExists = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        return !!element; // Returns true if the element is found, false otherwise
      }, elementSelector);

      // If the element exists, click it
      if (elementExists) {
        await page.click(elementSelector);
        console.log("Clicked the element");
        await page.waitForTimeout(2000);
      }

      const inputSelector =
        "div.wz-search-container.is-destination input.wm-search__input";
      let currentHospital = hospitalNames[i];
      // Wait for the input element to be visible
      await page.waitForTimeout(2000);

      // Clear the input field
      await page.evaluate((selector) => {
        const inputElement = document.querySelector(selector);
        inputElement.value = "";
      }, inputSelector);

      // Now you can interact with the input element
      await page.type(inputSelector, currentHospital).then(async () => {
        await page.waitForTimeout(2000);
        await page.keyboard.press("Enter");
      });

      // Wait for a while to see the result (optional)
      await page.waitForTimeout(2000);

      await page.waitForSelector("div.wz-livemap");

      const type = "hospital";
      const name = currentHospital;

      //const addressElement = page.locator("div.wm-poi-name-and-address__address")
      const address = await page.evaluate(() => {
        const addressElement = document.querySelector(
          "div.wm-poi-name-and-address__address"
        );
        return addressElement.innerText;
      });

      const latlngElement = await page.evaluate(() => {
        const latlngElement = document.querySelector(
          ".wm-attribution-control__latlng span"
        );
        return latlngElement.innerText;
      });

      const latlngArray = latlngElement.split("|");
      const latlng = latlngArray.map((item) => {
        return parseFloat(item.trim());
      });

      

      const hospitalObj = { type, name, address, latlng };
      allHospitalsObjs.push(hospitalObj);

      console.log(allHospitalsObjs);
    }

    await browser.close();
    console.log(allHospitalsObjs);
  } catch (error) {
    console.error("Error scraping data:", error);
  }
}

scrapeWaze();
