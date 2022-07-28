// ==UserScript==
// @name         TL SimplyGo Statement Calculation
// @namespace    http://tampermonkey.net/
// @updateURL    
// @version      0.1
// @description  Calculate the total amount of all transaction in statement page.
// @author       Seah Sheng Hong
// @match        https://simplygo.transitlink.com.sg/Cards/Transactions
// @icon         https://www.google.com/s2/favicons?sz=64&domain=transitlink.com.sg
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        GM_registerMenuCommand
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

(function() {
  'use strict';

  GM_registerMenuCommand('Total Amount', getTrxAmountRows, '1');
  
  // TODO: add modal to show total amount
  // TODO: add modal to select month

  function getTrxAmountRows() {
      const fromDateInput = $('#FromDate').get(0);
      const toDateInput = $('#ToDate').get(0);

      const fromDate = new Date(fromDateInput.value);
      const toDate = new Date(toDateInput.value);

      const fromDateString = formatDate(fromDate);
      const toDateString = formatDate(toDate);

      const trxAmountRows = $(".Table-payment-statement > tbody > tr > td.col3:not(.hiddenRow)");

      let total = 0;

      for (const trxAmountRow of trxAmountRows) {
          total += convertMoneyTextToNumber(trxAmountRow.innerText);
      }

      console.log(`From ${fromDateString} to ${toDateString}`, `$${(total / 100).toFixed(2)}`);
  }

  function convertMoneyTextToNumber(moneyText) {

      let convertedMoney = 0;

      if (moneyText.startsWith('$')) {
          const moneyNumber = parseFloat(moneyText.slice(1));

          if (!isNaN(moneyNumber)) {

              convertedMoney = convertMoneyNumberWhenValid(moneyNumber);
          }
      } else {
          const moneyNumber = parseFloat(moneyText);

          convertedMoney = convertMoneyNumberWhenValid(moneyNumber);
      }

      return convertedMoney;
  }

  function convertMoneyNumberWhenValid(moneyNumber) {
      if (typeof moneyNumber !== 'number') {
          return 0;
      }

      if (!isNaN(moneyNumber)) {
          return moneyNumber * 100;
      }

      return 0;
  }

  function formatDate(date) {
      const month = date.getMonth() + 1;
      const monthText = month.toString().padStart(2, '0');

      const day = date.getDate();
      const dayText = day.toString().padStart(2, '0');

      return `${date.getFullYear()}-${monthText}-${dayText}`;
  }
})();



