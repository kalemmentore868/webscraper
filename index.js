const puppeteer = require('puppeteer');
const cheerio = require('cheerio')
const fs = require('fs');

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
 
  'Dominica',
  'Dominican Republic',
  'Grenada',
  'Guadeloupe',
  'Haiti',
  'Jamaica',
  'Martinique',
  'Montserrat',
  'Puerto Rico',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Martin',
  'Saint Vincent and the Grenadines',
  
  'Trinidad and Tobago',
  'Turks and Caicos Islands',
  'United States Virgin Islands'
];

const outliers = [ 'Saint Barthélemy', 'Curaçao','Sint Maarten']

const allHopsitals = []

async function run(){
    const browser = await puppeteer.launch({headless: true});
     const page = await browser.newPage();
    for (let i = 0; i < caribbeanCountries.length; i++){
 await page.goto("https://google.com");

    const searchInput = await page.$('input');

    await searchInput.type("List of hospitals and medical centers in " + caribbeanCountries[i])

    // Submit the search query
    await searchInput.press('Enter');


     // Wait for the Shadow DOM element to appear
   await page.waitForSelector('g-more-link a');

    await page.click('g-more-link a');


  // Wait for some time (optional)
  await page.waitForTimeout(5000);

     const content = await page.content();

     const $ = cheerio.load(content);

     $('div.dbg0pd[role="heading"] span.OSrXXb').each((index, element) => {
  allHopsitals.push($(element).text());
});

console.log(allHopsitals)
console.log(caribbeanCountries[i])



    }     
  



    await browser.close();

    const jsonData = JSON.stringify(allHopsitals, null, 2);
    const filePath = './allhospitals.json';

    fs.writeFile(filePath, jsonData, 'utf8', (err) => {
  if (err) {
    console.error('Error writing JSON file:', err);
  } else {
    console.log('JSON file has been saved successfully!');
  }
});






}

run()