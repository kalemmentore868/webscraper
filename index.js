const puppeteer = require('puppeteer');
const cheerio = require('cheerio')

const caribbeanCountries = [
  'Anguilla',
  'Antigua and Barbuda',
  'Aruba',
  'The Bahamas',
  'Barbados',
  'Belize',
  'Bermuda',
  'Bonaire, Sint Eustatius, and Saba',
  'British Virgin Islands',
  'Cayman Islands',
  'Cuba',
  'Curaçao',
  'Dominica',
  'Dominican Republic',
  'Grenada',
  'Guadeloupe',
  'Haiti',
  'Jamaica',
  'Martinique',
  'Montserrat',
  'Puerto Rico',
  'Saint Barthélemy',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Martin',
  'Saint Vincent and the Grenadines',
  'Sint Maarten',
  'Trinidad and Tobago',
  'Turks and Caicos Islands',
  'United States Virgin Islands'
];

async function run(){
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://google.com");

    const searchInput = await page.$('input');
    await searchInput.type("List of hospitals and medical centers in Trinidad and tobago")

    // Submit the search query
    await searchInput.press('Enter');

    // Wait for the search results page to load (you can customize the wait time based on your internet speed)
    await page.waitForTimeout(3000);

     const content = await page.content();

     const $ = cheerio.load(content);
  const hospitalTitles = [];
   $('div.rllt__details span.OSrXXb').each((index, element) => {
    const title = $(element).text();
    hospitalTitles.push(title);
  });

  console.log(hospitalTitles)

    await browser.close();
}

run()