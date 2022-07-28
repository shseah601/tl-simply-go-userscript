// ==UserScript==
// @name         TL SimplyGo Statement Calculation
// @namespace    simplygo.transitlink.com.sg
// @updateURL    https://github.com/shseah601/tl-simply-go-userscript/blob/main/tl-simply-go.user.js
// @downloadURL  https://github.com/shseah601/tl-simply-go-userscript/blob/main/tl-simply-go.user.js
// @version      0.3
// @description  Calculate the total amount of all transaction in statement page.
// @author       Seah Sheng Hong
// @match        https://simplygo.transitlink.com.sg/Cards/Transactions
// @icon         https://www.google.com/s2/favicons?sz=64&domain=transitlink.com.sg
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @resource     bootstrapCSS https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css
// @require      https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js
// @require      https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.5/dist/umd/popper.min.js
// @require      https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.min.js
// @grant        GM_registerMenuCommand
// @grant        GM_getResourceURL
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

(function () {
    'use strict';

    console.log('TL SimplyGo Extra Scripts Started');

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    document.head.appendChild(cssElement(GM_getResourceURL("bootstrapCSS")));

    GM_registerMenuCommand('Total Amount', calculateTrxAmount, '1');

    fixPageHTMLandCSS();

    addExtraYearMonthFilter();

    addCalculateTotalAmountButton();

    function cssElement(url) {
        var link = document.createElement("link");
        link.href = url;
        link.rel="stylesheet";
        link.type="text/css";
        return link;
    }

    function calculateTrxAmount() {
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

        console.log(`From ${fromDateString} to ${toDateString}`, convertTotalCentsToSGD(total));

        return total;
    }

    function convertTotalCentsToSGD(total) {
        return `$${(total / 100).toFixed(2)}`;
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

    function fixPageHTMLandCSS() {
        // remove extra dropdown icon
        $('body > div.Container > div.Menu > div > div > div.desktop-nav > ul > li > a > span').remove();

        // container width increase
        $('body > div.Container > div.Container-content').css('max-width', '1040px');

        // increase left side menu width
        $('body > div.Container > div.Container-content > aside').css('width', '300px');
    }

    function addExtraYearMonthFilter() {
        const cardSelection = $('#Search_form > fieldset > div > p:nth-child(1)');

        const row = $(document.createElement('div'));
        row.addClass('row');

        const yearSelectCol = $(document.createElement('col'));
        yearSelectCol.prop('id', 'yearSelectCol');
        yearSelectCol.addClass('col-4');
 
        const yearSelectConfig = {
            optionConfigs: [
                
            ]
        };

        const today = new Date();
        const thisYear = today.getFullYear();
        const totalYearRange = 5;

        for (let i = 0; i < totalYearRange; i++) {
            const optionYear = thisYear - i;

            const yearOptionConfig = {
                value: optionYear,
                isSelected: optionYear === thisYear
            };

            yearSelectConfig.optionConfigs.push(yearOptionConfig);
        }

        const yearSelect = createBSSelect(yearSelectConfig);
        yearSelect.css('width', '100%');
        yearSelect.prop('id', 'yearSelect');
        yearSelect.val(thisYear);
        yearSelectCol.append(yearSelect);
        row.append(yearSelectCol);

        const monthSelectCol = $(document.createElement('col'));
        monthSelectCol.prop('id', 'monthSelectCol');
        monthSelectCol.addClass('col-4');

        const monthSelectConfig = {
            optionConfigs: [
                
            ]
        };

        monthSelectConfig.optionConfigs = generateMonthSelectOptionConfigs();

        const monthSelect = createBSSelect(monthSelectConfig);
        monthSelect.css('width', '100%');
        monthSelect.prop('id', 'monthSelect');
        monthSelectCol.append(monthSelect);
        row.append(monthSelectCol);

        // const selectExtraYearMonthFilterButtonCol = $(document.createElement('col'));
        // selectExtraYearMonthFilterButtonCol.addClass('col-4');

        // const selectExtraYearMonthFilterButton = createBSButton({text: 'Select'});
        // selectExtraYearMonthFilterButton.addClass('btn-primary');
        // selectExtraYearMonthFilterButtonCol.append(selectExtraYearMonthFilterButton);
        // row.append(selectExtraYearMonthFilterButtonCol);

        cardSelection.after(row);

        updateDefaultDateInput();
        addExtraYearMonthFilterChangeListener();
    }

    function addExtraYearMonthFilterChangeListener() {
        const yearSelect = $('#yearSelect');
        const monthSelect = $('#monthSelect');

        yearSelect.change(function() {
            refreshMonthSelectOptions();
            updateDefaultDateInput();
        });

        monthSelect.change(function() {
            updateDefaultDateInput();
        });
    }

    function generateMonthSelectOptionConfigs() {
        const yearSelect = $('#yearSelect');
        const monthSelect = $('#monthSelect');

        const today = new Date();
        const thisYear = today.getFullYear();
        const thisMonth = today.getMonth();
        
        let yearSelectValue = thisYear;
        if (yearSelect.length !== 0) {
            yearSelectValue = parseInt(yearSelect.val(), 10);
        }

        let monthSelectValue = thisMonth
        if (monthSelect.length !== 0) {
            monthSelectValue = parseInt(monthSelect.val(), 10);
        }

        const monthOptionConfigs = []
        for (let i = 0; i < monthNames.length; i++) {
            if (yearSelectValue === thisYear && i > thisMonth) {
                continue;
            }

            const monthOptionConfig = {
                text: monthNames[i],
                value: i,
                isSelected: yearSelectValue === thisYear ? i === thisMonth : i === monthSelectValue
            };

            monthOptionConfigs.push(monthOptionConfig);
        }

        return monthOptionConfigs;
    }

    function refreshMonthSelectOptions() {
        const monthSelect = $('#monthSelect');

        const monthSelectConfig = {
            optionConfigs: [
                
            ]
        };

        monthSelectConfig.optionConfigs = generateMonthSelectOptionConfigs();

        monthSelect.empty();

        if (monthSelectConfig.optionConfigs) {
            for (const selectOptionConfig of monthSelectConfig.optionConfigs) {
                const selectOption = createBSSelectOption(selectOptionConfig);

                monthSelect.append(selectOption);
            }
        }
    }

    function updateDefaultDateInput() {
        const yearSelect = $('#yearSelect');
        const monthSelect = $('#monthSelect');

        const yearSelectValue = parseInt(yearSelect.val(), 10);
        const monthSelectValue = parseInt(monthSelect.val(), 10);

        const defaultFromDateInput = $('#FromDate');
        const defaultToDateInput = $('#ToDate');

        const fromDate = new Date(yearSelectValue, monthSelectValue, 1);
        const toDate = new Date(yearSelectValue, monthSelectValue + 1, 0);

        defaultFromDateInput.val(`01-${monthNamesShort[monthSelectValue]}-${yearSelectValue}`);

        let toDateDayNumber = toDate.getDate();
        const today = new Date();
        const todayDayNumber = today.getDate();

        if (toDate.valueOf() > today.valueOf()) {
            toDateDayNumber = todayDayNumber;
        }

        defaultToDateInput.val(`${toDateDayNumber.toString().padStart(2, '0')}-${monthNamesShort[monthSelectValue]}-${yearSelectValue}`);
    }

    function addCalculateTotalAmountButton() {
        const searchButtonGroups = $('#Search_form > div');

        const calculateButton = createBSButton({text: 'Calculate'});
        calculateButton.addClass('btn-primary float-start');

        calculateButton.click(function () {
            const total = calculateTrxAmount();
            getTotalAmountResult(total);
        });

        searchButtonGroups.prepend(calculateButton);
    }

    function getTotalAmountResult(total) {

        const transactionHistory = $('#MyStat_result');

        const alertId = 'totalTransactionsAmountAlert';

        let alert = $('#' + alertId);

        if (alert.length === 0) {
            alert = $(document.createElement('div'));
            alert.prop('id', alertId);
            alert.addClass('alert alert-success');
            
            transactionHistory.prepend(alert);
        }

        alert.text('Total: ' + convertTotalCentsToSGD(total));        
    }

    function createBSButton(buttonConfig) {
        const button = $(document.createElement('button'));
        button.prop('type', 'button');
        button.addClass('btn');
        button.text(buttonConfig.text);

        return button;
    }

    function createBSSelect(selectConfig) {
        const select = $(document.createElement('select'));
        select.addClass('form-select');

        if (selectConfig.optionConfigs) {
            for (const selectOptionConfig of selectConfig.optionConfigs) {
                const selectOption = createBSSelectOption(selectOptionConfig);

                select.append(selectOption);
            }
        }

        return select;
    }

    function createBSSelectOption(selectOptionConfig) {
        const selectOption = $(document.createElement('option'));
        if (selectOptionConfig.isSelected) {
            selectOption.prop('selected', true);
        }

        selectOption.prop('value', selectOptionConfig.value);

        if (selectOptionConfig.text) {
            selectOption.text(selectOptionConfig.text);
        } else {
            selectOption.text(selectOptionConfig.value);
        }

        return selectOption;
    }
})();



