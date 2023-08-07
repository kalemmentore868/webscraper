const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const {
  clickGotItBtn,
  clickFilledSearchInput,
  clearSearchInput,
  typeSearchInput,
  searchInputIsFilled,
  getHospitalAddress,
  getLatLng,
  getPhone,
  getWebsite,
  getHours,
} = require("./wazeFunctions");

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

    await page.waitForTimeout(2000);

    for (let i = 301; i < hospitalNames.length; i++) {
      await clickGotItBtn(page);

      await clickFilledSearchInput(page);

      const inputSelector =
        "div.wz-search-container.is-destination input.wm-search__input";
      let currentHospital = hospitalNames[i];
      // Wait for the input element to be visible

      if (await searchInputIsFilled(page))
        await clearSearchInput(inputSelector, page);

      await typeSearchInput(inputSelector, page, currentHospital);

      await page.keyboard.press("Enter");

      // await page.waitForSelector("div.wz-livemap");

      await page.waitForTimeout(2000);

      const type = "hospital";
      const name = currentHospital;

      await clickGotItBtn(page);

      //const addressElement = page.locator("div.wm-poi-name-and-address__address")
      const address = await getHospitalAddress(page);

      const latlng = await getLatLng(page);

      const contact = await getPhone(page);

      const website = await getWebsite(page);

      const hours = await getHours(page);

      const hospitalObj = {
        type,
        name,
        address,
        latlng,
        contact,
        website,
        hours,
      };
      allHospitalsObjs.push(hospitalObj);

      if (i % 100 === 0 && i !== 0 && i !== 100) {
        const jsonData = JSON.stringify(allHospitalsObjs, null, 2);
        const fileSavePath = `./allhospitalsObjs${i}.json`;

        fs.writeFile(fileSavePath, jsonData, "utf8", (err) => {
          if (err) {
            console.error("Error writing JSON file:", err);
          } else {
            console.log("JSON file has been saved successfully!");
          }
        });
      }
      console.log(hospitalObj);
    }

    const jsonData = JSON.stringify(allHospitalsObjs, null, 2);
    const fileSavePath = "./allhospitalsObjs.json";

    fs.writeFile(fileSavePath, jsonData, "utf8", (err) => {
      if (err) {
        console.error("Error writing JSON file:", err);
      } else {
        console.log("JSON file has been saved successfully!");
      }
    });

    await browser.close();
    console.log(allHospitalsObjs);
  } catch (error) {
    console.error("Error scraping data:", error);
  }
}

//scrapeWaze();

function joinfiles() {
  const list1 = JSON.parse(fs.readFileSync("allhospitalsObjs100.json", "utf8"));
  const list2 = JSON.parse(fs.readFileSync("allhospitalsObjs200.json", "utf8"));
  const list3 = JSON.parse(fs.readFileSync("allhospitalsObjs300.json", "utf8"));
  const list4 = JSON.parse(fs.readFileSync("allhospitalsObjs400.json", "utf8"));

  const combinedList = [...list1, ...list2, ...list3, ...list4];

  // Write the combined list to a new JSON file
  fs.writeFileSync(
    "combinedList.json",
    JSON.stringify(combinedList, null, 2),
    "utf8"
  );
}

joinfiles();
