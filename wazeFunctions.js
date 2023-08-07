async function clickGotItBtn(page) {
  const buttonSelector = "button.waze-tour-tooltip__acknowledge";
  const buttonExists = await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    return !!element; // Returns true if the element is found, false otherwise
  }, buttonSelector);

  if (buttonExists) {
    await page.click(buttonSelector);
  }
}

async function clickFilledSearchInput(page) {
  //   await clickGotItBtn(page);
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
  }
}

async function clearSearchInput(inputSelector, page) {
  //   clickGotItBtn(page);
  // Clear the input field
  await page.evaluate((selector) => {
    const inputElement = document.querySelector(selector);
    inputElement.value = "";
  }, inputSelector);
}

async function typeSearchInput(inputSelector, page, text) {
  await clickGotItBtn(page);
  await page.click(inputSelector);
  // Now you can interact with the input element
  await page.type(inputSelector, text).then(async () => {
    await page.keyboard.press("Enter");
  });
}

async function searchInputIsFilled(page) {
  await clickGotItBtn(page);
  // Define the selector for the element
  const elementSelector = "div.wm-search.has-value";

  // Check if the element exists on the page
  const elementExists = await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    return !!element; // Returns true if the element is found, false otherwise
  }, elementSelector); // Define the selector for the element

  return elementExists;
}

async function getHospitalAddress(page) {
  //   await clickGotItBtn(page);
  await page.waitForSelector(".wm-poi-name-and-address__address");
  const addressElement = await page.evaluate(() => {
    const addressElement = document.querySelector(
      ".wm-poi-name-and-address__address"
    );

    return addressElement.innerText;
  });
  return addressElement;
}

async function getLatLng(page) {
  //   await clickGotItBtn(page);
  const latlngElement = await page.evaluate(() => {
    const latlngElement = document.querySelector(
      ".wm-attribution-control__latlng span"
    );
    return latlngElement.innerText;
  });
  const latlngArray = latlngElement.split("|");

  return latlngArray.map((item) => {
    return parseFloat(item.trim());
  });
}

async function getPhone(page) {
  //   await clickGotItBtn(page);
  const phoneIconExists = await page.evaluate(() => {
    const targetSelector = "div.w-icon-call.w-icon.wz-venue-section__icon";
    const element = document.querySelector(targetSelector);
    return !!element;
  });

  if (phoneIconExists) {
    const textNextToElement = await page.evaluate(() => {
      const targetSelector = "div.w-icon-call.w-icon.wz-venue-section__icon";
      const element = document.querySelector(targetSelector);
      const nextSibling = element.nextElementSibling;
      return nextSibling.textContent.trim();
    });
    return textNextToElement;
  } else {
    return "Not Listed";
  }
}

async function getWebsite(page) {
  //   await clickGotItBtn(page);
  const websiteIconExists = await page.evaluate(() => {
    const targetSelector = "div.w-icon-computer.w-icon.wz-venue-section__icon";
    const element = document.querySelector(targetSelector);
    return !!element;
  });

  if (websiteIconExists) {
    const textNextToElement = await page.evaluate(() => {
      const targetSelector =
        "div.w-icon-computer.w-icon.wz-venue-section__icon";
      const element = document.querySelector(targetSelector);
      const nextSibling = element.nextElementSibling;
      return nextSibling.textContent.trim();
    });
    return textNextToElement;
  } else {
    return "Not Listed";
  }
}

async function getHours(page) {
  //   await clickGotItBtn(page);
  const hoursIconExists = await page.evaluate(() => {
    const targetSelector = "div.w-icon-clock.w-icon.wz-venue-section__icon";
    const element = document.querySelector(targetSelector);
    return !!element;
  });

  if (hoursIconExists) {
    const hoursText = await page.evaluate(() => {
      const targetSelector = ".wz-venue__hours-item";
      const element = document.querySelector(targetSelector);
      const spanText = element.querySelector("span:last-child").textContent;
      return spanText.trim();
    });
    return hoursText;
  } else {
    return "Not Listed";
  }
}

module.exports = {
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
};
