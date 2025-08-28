
// API setup
let apiKey = "fe97cf3e20094d2f8b01e1b3";
let api = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded");

  // Get references to DOM elements
  const fromDropDown = document.getElementById("from-currency-select");
  const toDropDown = document.getElementById("to-currency-select");
  const result = document.getElementById("result");

  console.log("From dropdown:", fromDropDown);
  console.log("To dropdown:", toDropDown);

  // Check if currencies array exists (should be loaded from currency-codes.js)
  if (typeof currencies === 'undefined') {
    console.error("currencies array is not defined! Make sure currency-codes.js is loaded properly.");
    // Fallback to some basic currencies if the external file isn't loaded
  }
  // Populate dropdowns
  if (fromDropDown && toDropDown) {
    // Create dropdown options
    currencies.forEach((currency) => {
      // For 'from' dropdown
      const fromOption = document.createElement("option");
      fromOption.value = currency;
      fromOption.text = currency;
      fromDropDown.appendChild(fromOption);

      // For 'to' dropdown
      const toOption = document.createElement("option");
      toOption.value = currency;
      toOption.text = currency;
      toDropDown.appendChild(toOption);
    });

    // Set default values
    fromDropDown.value = "USD";
    toDropDown.value = "INR";

    // Initialize flags
    initializeFlags();

    // Add event listeners
    fromDropDown.addEventListener("change", function() {
      updateFlag(this);
      convertCurrency();
    });

    toDropDown.addEventListener("change", function() {
      updateFlag(this);
      convertCurrency();
    });

    // Event listener for convert button
    const convertButton = document.getElementById("convert-button");
    if (convertButton) {
      convertButton.addEventListener("click", convertCurrency);
    }

    // Event listener for swap button
    const swapButton = document.getElementById("swap-button");
    if (swapButton) {
      swapButton.addEventListener("click", function() {
        const temp = fromDropDown.value;
        fromDropDown.value = toDropDown.value;
        toDropDown.value = temp;

        updateFlag(fromDropDown);
        updateFlag(toDropDown);
        convertCurrency();
      });
    }

    // Initial conversion
    convertCurrency();
  } else {
    console.error("Dropdown elements not found in the DOM");
  }
});

// Function to update flag
function updateFlag(element) {
  console.log("Updating flag for", element.value);

  if (!element || !element.parentElement) {
    console.error("Invalid element or parent for updateFlag");
    return;
  }

  const currCode = element.value;

  // Find existing flag or create new one
  let flagImg = element.parentElement.querySelector("img");
  if (!flagImg) {
    flagImg = document.createElement("img");
    flagImg.style.width = "2em";
    flagImg.style.height = "1.5em";
    flagImg.style.marginRight = "0.5em";
    element.parentElement.insertBefore(flagImg, element);
  }

  // Update flag image
  if (countryList[currCode]) {
    const countryCode = countryList[currCode];
    flagImg.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
    flagImg.style.display = "inline";
    console.log("Setting flag to", countryCode);
  } else {
    // If we don't have a mapping, hide the flag
    flagImg.style.display = "none";
    console.log("No country code found for", currCode);
  }
}

// Function to initialize flags
function initializeFlags() {
  console.log("Initializing flags");

  const fromDropDown = document.getElementById("from-currency-select");
  const toDropDown = document.getElementById("to-currency-select");

  if (fromDropDown) updateFlag(fromDropDown);
  if (toDropDown) updateFlag(toDropDown);
}

// Function to convert currency
function convertCurrency() {
  console.log("Converting currency");

  const amount = document.getElementById("amount");
  const fromDropDown = document.getElementById("from-currency-select");
  const toDropDown = document.getElementById("to-currency-select");
  const result = document.getElementById("result");

  if (!amount || !fromDropDown || !toDropDown || !result) {
    console.error("Required elements not found");
    return;
  }

  const amountValue = amount.value || 1;
  const fromCurrency = fromDropDown.value;
  const toCurrency = toDropDown.value;

  console.log(`Converting ${amountValue} from ${fromCurrency} to ${toCurrency}`);

  // Fetch exchange rates
  fetch(api)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log("API data received:", data);

      const fromExchangeRate = data.conversion_rates[fromCurrency];
      const toExchangeRate = data.conversion_rates[toCurrency];

      if (fromExchangeRate && toExchangeRate) {
        const convertedAmount = (amountValue / fromExchangeRate) * toExchangeRate;
        result.innerHTML = `${amountValue} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
      } else {
        console.error("Exchange rates not found");
        result.innerHTML = "Unable to get exchange rates";
      }
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      result.innerHTML = "Error fetching exchange rates";
    });
}