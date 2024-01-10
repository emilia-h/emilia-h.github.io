
// global state
let currentInQuantity = getQuantity('in');
let currentOutQuantity = getQuantity('out');

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

function createSITable(unit) {
    return {
        ['p' + unit]: 1e-12,
        ['n' + unit]: 1e-9,
        ['u' + unit]: 1e-6,
        ['m' + unit]: 1e-3,
        ['c' + unit]: 1e-2,
        ['d' + unit]: 1e-1,
        [unit]: 1,
        ['da' + unit]: 1e1,
        ['h' + unit]: 1e2,
        ['k' + unit]: 1e3,
        ['M' + unit]: 1e6,
        ['G' + unit]: 1e9,
        ['T' + unit]: 1e12,
    };
}

conversionTable = {
    'amount-of-substance': createSITable('mol'),
    volume: {
        ...createSITable('L'),
        ...createSITable('l'),
    },
    mass: createSITable('g'),
    time: {
        s: 1,
        second: 1,
        seconds: 1,
        min: 60,
        minute: 60,
        minutes: 60,
        h: 60 * 60,
        hour: 60 * 60,
        hours: 60 * 60,
        d: 60 * 60 * 24,
        day: 60 * 60 * 24,
        days: 60 * 60 * 24,
        w: 60 * 60 * 24 * 7,
        week: 60 * 60 * 24 * 7,
        weeks: 60 * 60 * 24 * 7,
    },
};

function calculateConversionFactor(quantity, unit) {
    let quantityParts;
    if (quantity === 'concentration') {
        quantityParts = ['mass', 'volume'];
    } else if (quantity === 'molarity') {
        quantityParts = ['amount-of-substance', 'volume'];
    } else {
        quantityParts = [quantity];
    }

    const factor1 = conversionTable[quantityParts[0]][unit[0]];

    let factor2 = 1;
    if (quantityParts.length === 2) {
        factor2 = conversionTable[quantityParts[1]][unit[1]];
    }

    if (!factor1 || !factor2) {
        return NaN;
    } else {
        return factor1 / factor2;
    }
}

// `type` is 'in' or 'out'
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
}

function clearUnitField(type) {
    const dividendUnitElement = document.getElementById(type + '-unit-dividend');
    const divisorUnitElement = document.getElementById(type + '-unit-divisor');
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
        currentInQuantity = inQuantity;

        clearUnitField('in');

        // set a target quantity to checked to always have something checked
        document.getElementById('out-quantity-same').checked = true;
        document.getElementById('out-value').textContent = '';
    }

    // set placeholders for units
    const placeholderInUnit = getDefaultUnit(inQuantity);
    updateUnitField('in', placeholderInUnit);

    const outQuantity = getQuantity('out');
    if (!outQuantity) return;

    const placeholderOutUnit = getDefaultUnit(outQuantity === 'same' ? inQuantity : outQuantity);
    updateUnitField('out', placeholderOutUnit);

    if (outQuantity !== currentOutQuantity) {
        currentOutQuantity = outQuantity;

        clearUnitField('out');
    }
}

function updateOut() {
    const inQuantity = getQuantity('in');
    const inValue = parseFloat(document.getElementById('in-value').value);
    if (isNaN(inValue)) {
        document.getElementById('out-value').textContent = 'No valid number given.';
        return;
    }

    const inUnit = getUnit('in', inQuantity);
    const inDisplayUnit = inUnit.length === 2 ? `${inUnit[0]}/${inUnit[1]}` : String(inUnit[0]);

    const substance = document.getElementById('substance').value;

    const outQuantity = getQuantity('out');
    const realOutQuantity = outQuantity === 'same' ? inQuantity : outQuantity;
    const outUnit = getUnit('out', realOutQuantity);
    const outDisplayUnit = outUnit.length === 2 ? `${outUnit[0]}/${outUnit[1]}` : String(outUnit[0]);

    console.log(`${inQuantity}: ${inValue} ${inUnit} to ${outQuantity}: ${outUnit}`);

    const inFactor = calculateConversionFactor(inQuantity, inUnit);
    if (isNaN(inFactor)) {
        document.getElementById('out-value').textContent =
            `No unit '${inDisplayUnit}' for quantity ${inQuantity}.`;
        return;
    }

    const outFactor = calculateConversionFactor(realOutQuantity, outUnit);
    if (isNaN(outFactor)) {
        document.getElementById('out-value').textContent =
            `No unit '${outDisplayUnit}' for quantity ${realOutQuantity}.`;
        return;
    }

    let result = NaN;
    if (outQuantity === 'same') {
        result = inValue * inFactor / outFactor;
    } else if (inQuantity === 'amount-of-substance' && outQuantity === 'mass') {
        // TODO
    } else if (inQuantity === 'concentration' && outQuantity === 'molarity') {
        // TODO
    } else if (inQuantity === 'mass' && outQuantity === 'amount-of-substance') {
        // TODO
    } else if (inQuantity === 'molarity' && outQuantity === 'concentration') {
        // 1 mol/L corresponds to ??? g/L
        let substanceFactor = NaN;
        if (substance === 'estradiol') {
            substanceFactor = 2.7238e2;
        } else if (substance === 'testosterone') {
            substanceFactor = 2.8842e2;
        } else {
            document.getElementById('out-value').textContent = `The substance ${substance} is unknown.`;
            return;
        }
        result = inValue * substanceFactor * inFactor / outFactor;
    }

    if (isNaN(result)) {
        document.getElementById('out-value').textContent =
            'Calculations could not be made with these inputs.';
    } else {
        const displayValue = inValue + ' ' + inUnit[0] +
            (inUnit.length >= 2 ? '/' + inUnit[1] : '') +
            (substance ? ' of ' + substance : '') +
            (outQuantity === 'same' ? ' = ' : ' corresponds to ') +
            result + ' ' + outUnit[0] +
            (outUnit.length >= 2 ? '/' + outUnit[1] : '');

        document.getElementById('out-value').textContent = displayValue;
    }
}

updateConverter();

// add event listener to each radio box
const radioElements = document.querySelectorAll('main .input-element input[type="radio"]');
for (const radioElement of radioElements) {
    radioElement.addEventListener('change', function(event) {
        updateConverter();
        updateOut();
    });
}

const inputElements = document.querySelectorAll('main .input-element input[type="text"]');
for (const inputElement of inputElements) {
    inputElement.addEventListener('change', function() {
        updateOut();
    });
}
