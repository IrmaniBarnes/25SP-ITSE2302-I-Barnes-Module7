/* ------------- Constants ----------- */

const CURRENCY_SUFFIX = ' USD';   // Constant
const TAX_RATE = 0;               // Constant
const MIN_NAME_CHARS = 2;         // Constant

/* ------------- Event wiring once the page loads ------------- */

document.addEventListener('DOMContentLoaded', function () { // Event Listener
    var form = document.getElementById('orderForm');          // Variables
    if (form) {                                               // If & Else
        form.addEventListener('submit', handleSubmit);          // Event Listener
        form.addEventListener('reset', handleReset);            // Event Listener
    } else {
        console.log('Order form not found.');                   // If & Else
    }
});

/* ------------ Format numbers ------------ */

function formatUSD(amountNumber) {
    var n = Number(amountNumber);                              // Variables, String Methods (Number)
    if (isNaN(n)) {                                           // If & Else
        n = 0;
    } else {
        n = n + 0;                                              // Arithmetic Operators
    }
    var text = '$' + n.toFixed(2) + CURRENCY_SUFFIX;          // String Methods
    return text;                                              // returns string
}

/* ----------- Collect checked items ---------- */

function getCheckedItems() {
    var chosen = [];                                          // Arrays
    var nodes = document.querySelectorAll('input[name="items"]:checked'); // Variables

    for (let i = 0; i < nodes.length; i++) {                  // Loops, Let
        var box = nodes[i];                                     // Variables
        var labelText = box.parentElement.textContent.trim();   // String Methods
        var price = parseFloat(box.value);                      // Variables
        chosen.push({ label: labelText, price: price });        // Arrays
    }

    if (chosen.length > 0) {                                  // If & Else
        return chosen;
    } else {
        return [];                                              // If & Else
    }
}

/* ----------- Get selected shipping ----------- */

function getSelectedShipping() {
    var selected = document.querySelector('input[name="shipping"]:checked'); // Variables
    var price = 0;                                            // Variables
    var label = 'Standard';                                   // Variables

    if (selected) {                                           // If & Else
        price = parseFloat(selected.value);
        switch (selected.value) {                               // Switch
            case '0':
                label = 'Standard';
                break;
            case '8':
                label = 'Express';
                break;
            default:
                label = 'Custom';
                break;
        }
    } else {
        label = 'Standard';                                     // If & Else
        price = 0;
    }

    var isExpress = price > 0 ? true : false;                 // Boolean
    return { label: label, price: price, isExpress: isExpress };
}

/* ---------- Calculate total -------------- */

function calculateTotal(pricesArray, shippingPrice) {
    var subtotal = 0;                                         // Variables
    for (let i = 0; i < pricesArray.length; i++) {            // Loops, Let
        subtotal = subtotal + Number(pricesArray[i]);           // Arithmetic Operators
    }

    var withShipping = subtotal + Number(shippingPrice);      // Arithmetic Operators
    var tax = withShipping * TAX_RATE;                        // Arithmetic Operators
    var finalTotal = withShipping + tax;                      // Arithmetic Operators

    if (finalTotal >= 0) {                                    // If & Else
        return finalTotal;
    } else {
        return 0;                                               // If & Else
    }
}

/* ----------- Validations (throw errors when invalid) ----------- */

function validateField(value, fieldLabel, minChars) {
    var text = value.trim();                                  // String Methods
    if (text.length < minChars) {                             // If & Else
        throw new Error('Please enter a valid ' + fieldLabel + '.'); // Try/Catch/Throw
    } else {
        return true;                                            // Boolean
    }
}

function validateEmail(emailValue) {
    var email = emailValue.trim();                            // String Methods
    var looksOk = email.indexOf('@') > 0 && email.indexOf('.') > 0; // Boolean + String Methods
    if (!looksOk) {                                          // If & Else
        throw new Error('Please enter a valid email address.'); // Try/Catch/Throw
    } else {
        return true;                                           // Boolean
    }
}

function validateStylePref(styleValue) {
    var val = (styleValue || '').trim();                      // String Methods
    if (val === '') {                                        // If & Else
        throw new Error('Please choose a Style Preference.');
    } else {
        return true;                                           // Boolean
    }
}

/* ------------ Build the summary ----------- */

function buildSummaryHtml(order) {
    let itemsText = '';                                       // Let
    if (order.items.length > 0) {                             // If & Else
        var labels = [];                                        // Arrays
        for (let i = 0; i < order.items.length; i++) {          // Loops, Let
            labels.push(order.items[i].label);                    // Arrays
        }
        itemsText = labels.join(', ');                          // String Methods
    } else {
        itemsText = 'No items selected';                        // If & Else
    }

    var html = '';                                            // Variables
    html += '<tr><th scope="row">Name</th><td>' + order.firstName + ' ' + order.lastName + '</td></tr>';
    html += '<tr><th scope="row">Email</th><td>' + order.email + '</td></tr>';
    html += '<tr><th scope="row">Phone</th><td>' + (order.phone !== '' ? order.phone : '-') + '</td></tr>'; // If & Else
    html += '<tr><th scope="row">Best Contact Time</th><td>' + (order.contactTime !== '' ? order.contactTime : '-') + '</td></tr>'; // If & Else
    html += '<tr><th scope="row">Delivery Date</th><td>' + (order.date !== '' ? order.date : '-') + '</td></tr>'; // If & Else
    html += '<tr><th scope="row">Style Preference</th><td>' + order.stylePref + '</td></tr>';
    html += '<tr><th scope="row">Items</th><td>' + itemsText + '</td></tr>';
    html += '<tr><th scope="row">Shipping</th><td>' + order.shippingLabel + '</td></tr>';

    return html;
}

/* ------------ Submit handler ----------------- */

function handleSubmit(evt) {
    evt.preventDefault();

    // Read inputs
    var firstNameEl = document.getElementById('firstName');  // Variables
    var lastNameEl = document.getElementById('lastName');   // Variables
    var emailEl = document.getElementById('email');      // Variables
    var phoneEl = document.getElementById('phone');      // Variables
    var dateEl = document.getElementById('date');       // Variables
    var timeEl = document.getElementById('contactTime');// Variables
    var styleEl = document.getElementById('styleSelect');// Variables

    var firstName = firstNameEl ? firstNameEl.value : '';    // If & Else
    var lastName = lastNameEl ? lastNameEl.value : '';    // If & Else
    var email = emailEl ? emailEl.value : '';    // If & Else
    var phone = phoneEl ? phoneEl.value : '';    // If & Else
    var date = dateEl ? dateEl.value : '';    // If & Else
    var contactTime = timeEl ? timeEl.value : '';    // If & Else
    var stylePref = styleEl ? styleEl.value : '';    // If & Else

    var items = getCheckedItems();                        // Arrays
    var shipping = getSelectedShipping();                    // Boolean inside object

    // Validate
    try {                                                    // Try/Catch/Finally/Throw
        validateField(firstName, 'First Name', MIN_NAME_CHARS);
        validateField(lastName, 'Last Name', MIN_NAME_CHARS);
        validateEmail(email);
        validateStylePref(stylePref);
        if (items.length === 0) {                              // If & Else
            throw new Error('Please select at least one item.');
        } else {
            // ok
        }
    } catch (err) {
        alert(err.message);
        return;
    } finally {
        console.log('Validation done.');
    }

    // Build prices array
    var priceNumbers = [];                                    // Arrays
    for (let i = 0; i < items.length; i++) {                  // Loops, Let
        priceNumbers.push(items[i].price);                      // Arrays
    }

    // Totals
    var totalPriceNumber = calculateTotal(priceNumbers, shipping.price);
    var totalPriceText = formatUSD(totalPriceNumber);

    // Order object
    var order = {                                            // Variables
        firstName: firstName.trim().charAt(0).toUpperCase() + firstName.trim().slice(1), // String Methods
        lastName: lastName.trim().charAt(0).toUpperCase() + lastName.trim().slice(1),  // String Methods
        email: email.trim(),                               // String Methods
        phone: phone.trim(),                               // String Methods
        contactTime: contactTime,
        date: date,
        stylePref: stylePref,
        items: items,
        shippingLabel: shipping.label
    };

    // Write summary
    var summaryBody = document.getElementById('summaryBody');  // Variables
    var summaryTotal = document.getElementById('summaryTotal'); // Variables

    if (summaryBody && summaryTotal) {                          // If & Else
        var html = buildSummaryHtml(order);
        summaryBody.innerHTML = html;
        summaryTotal.textContent = totalPriceText;
    } else {
        alert('Summary area not found.');                         // If & Else
    }

    alert('Order placed! Scroll to see your Order Summary.');
}

/* --------------- Reset handler ------------------ */

function handleReset() {
    var summaryBody = document.getElementById('summaryBody');  // Variables
    var summaryTotal = document.getElementById('summaryTotal'); // Variables

    if (summaryBody && summaryTotal) {                          // If & Else
        var emptyRows = '' +
            '<tr><th scope="row">Name</th><td>—</td></tr>' +
            '<tr><th scope="row">Email</th><td>—</td></tr>' +
            '<tr><th scope="row">Phone</th><td>—</td></tr>' +
            '<tr><th scope="row">Best Contact Time</th><td>—</td></tr>' +
            '<tr><th scope="row">Delivery Date</th><td>—</td></tr>' +
            '<tr><th scope="row">Style Preference</th><td>—</td></tr>' +
            '<tr><th scope="row">Items</th><td>—</td></tr>' +
            '<tr><th scope="row">Shipping</th><td>—</td></tr>';
        summaryBody.innerHTML = emptyRows;
        summaryTotal.textContent = formatUSD(0);                  // Arithmetic Operators
    } else {
        console.log('Summary area not found on reset.');          // If & Else
    }

    alert('Form has been reset.');
}
