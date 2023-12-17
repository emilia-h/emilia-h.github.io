let currentInQuantity = 'amount-of-substance';

function getQuantity(type) {
    const inQuantityElement = document.querySelector('input[name="' + type + '-quantity"]:checked');
    if (inQuantityElement === null || inQuantityElement.id === null) {
        return;
    } else {
        return inQuantityElement.id.slice((type + '-quantity-').length);
    }
}

function getUnit(type, quantity) {
    const dividendUnitElement = document.getElementById(type + '-unit-dividend');
    const divisorUnitElement = document.getElementById(type + '-unit-divisor');
    const dividendUnit = dividendUnitElement.value === ''
        ? getDefaultUnit(quantity)[0]
        : dividendUnitElement.value.trim();

    if (divisorUnitElement.style.display === 'none') {
        return [dividendUnit];
    }

    const divisorUnit = divisorUnitElement.value === ''
        ? getDefaultUnit(quantity)[1]
        : divisorUnitElement.value.trim();

    return divisorUnit ? [dividendUnit, divisorUnit] : [dividendUnit];
}

function getDefaultUnit(quantity) {
    switch (quantity) {
        case 'amount-of-substance':
            return ['mol'];
        case 'concentration':
            return ['kg', 'L'];
        case 'mass':
            return ['kg'];
        case 'molarity':
            return ['mol', 'L'];
        case 'time':
            return ['s'];
        default:
            return [];
    }
}

function updateUnitField(type, placeholderUnit) {
    const dividendUnitElement = document.getElementById(type + '-unit-dividend');
    const slashElement = document.getElementById(type + '-slash');
    const divisorUnitElement = document.getElementById(type + '-unit-divisor');
    if (placeholderUnit.length === 1) {
        dividendUnitElement.placeholder = placeholderUnit[0];
        slashElement.style.display = 'none';
        divisorUnitElement.style.display = 'none';
    } else if (placeholderUnit.length === 2) {
        dividendUnitElement.placeholder = placeholderUnit[0];
        slashElement.style.display = 'inline';
        divisorUnitElement.style.display = 'inline';
        divisorUnitElement.placeholder = placeholderUnit[1];
    } else {
        console.error('no default unit');
    }
    dividendUnitElement.value = '';
    divisorUnitElement.value = '';
}

function updateConverter() {
    const inQuantity = getQuantity('in');
    if (!inQuantity) return;

    // update which out quantities are possible
    const outQuantities = [
        'amount-of-substance',
        'concentration',
        'mass',
        'molarity',
    ];
    let possibleOutQuantities;
    switch (inQuantity) {
        case 'amount-of-substance':
            possibleOutQuantities = ['mass'];
            break;
        case 'concentration':
            possibleOutQuantities = ['molarity'];
            break;
        case 'mass':
            possibleOutQuantities = ['amount-of-substance'];
            break;
        case 'molarity':
            possibleOutQuantities = ['concentration'];
            break;
        case 'time':
            possibleOutQuantities = [];
            break;
        default:
            console.error('non-existent quantity', inQuantity);
            return;
    }

    for (const quantity of possibleOutQuantities) {
        const element = document.getElementById('out-quantity-' + quantity);
        element.parentElement.style.display = 'flex';
    }
    for (const quantity of outQuantities) {
        if (!possibleOutQuantities.includes(quantity)) {
            const element = document.getElementById('out-quantity-' + quantity);
            element.parentElement.style.display = 'none';
        }
    }

    // decide what other input elements need to be visible
    // TODO

    if (inQuantity !== currentInQuantity) {
        // set a target quantity to checked to always have something checked
        document.getElementById('out-quantity-same').checked = true;

        // set placeholders for units
        const placeholderInUnit = getDefaultUnit(inQuantity);
        updateUnitField('in', placeholderInUnit);

        currentInQuantity = inQuantity;
    }

    const outQuantity = getQuantity('out');
    if (!outQuantity) return;

    const placeholderOutUnit = getDefaultUnit(outQuantity === 'same' ? inQuantity : outQuantity);
    updateUnitField('out', placeholderOutUnit);
}

function updateOut() {
    const inQuantity = getQuantity('in');
    const inValueElement = document.getElementById('in-value');
    const inValue = parseFloat(inValueElement.value);
    const inUnit = getUnit('in', inQuantity);

    const substance = document.getElementById('substance').value;

    const outQuantity = getQuantity('out');
    const outUnit = getUnit('out', outQuantity === 'same' ? inQuantity : outQuantity);

    console.log(`${inQuantity}: ${inValue} ${inUnit} to ${outQuantity}: ${outUnit}`);

    let out = 'unknown';

    switch (inQuantity) {
        case 'amount-of-substance':
            // TODO
            break;
        case 'concentration':
            // TODO
            break;
        case 'mass':
            // TODO
            break;
        case 'molarity':
            if (outQuantity === 'same') {
                // TODO
            } else if (outQuantity === 'concentration') {
                if (
                    substance === 'estradiol' &&
                    inUnit[0] === 'pmol' && inUnit[1] === 'L' &&
                    outUnit[0] === 'pg' && outUnit[1] === 'mL'
                ) {
                    const factor = 0.27238;
                    out = inValue * factor;
                }
            }
            break;
        case 'time':
            // TODO
            break;
    }

    const displayValue = inValue + ' ' + inUnit[0] +
        (inUnit.length >= 2 ? '/' + inUnit[1] : '') +
        (substance ? ' of ' + substance : '') +
        ' corresponds to ' + out + ' ' + outUnit[0] +
        (outUnit.length >= 2 ? '/' + outUnit[1] : '');
    console.log(displayValue);
    document.getElementById('out-value').textContent = displayValue;
}

updateConverter();

// add event listener to each radio box
const radioElements = document.querySelectorAll('main .input-element input[type="radio"]');
for (const radioElement of radioElements) {
    radioElement.addEventListener('change', function(event) {
        updateConverter();
    });
}

const inputElements = document.querySelectorAll('main .input-element input[type="text"]');
for (const inputElement of inputElements) {
    inputElement.addEventListener('change', function() {
        updateOut();
    });
}
