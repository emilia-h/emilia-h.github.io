
function filterByTarget(elements, id) {
    let result;
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].dataset.target && elements[i].dataset.target === id) {
            result = elements[i];
        }
    }
    return result;
}

function initializeStepper(element) {
    const previousButtons = document.getElementsByClassName('stepper-previous');
    const counters = document.getElementsByClassName('stepper-counter');
    const nextButtons = document.getElementsByClassName('stepper-next');

    const previousButton = filterByTarget(previousButtons, element.id);
    const counter = filterByTarget(counters, element.id);
    const nextButton = filterByTarget(nextButtons, element.id);

    if (!previousButton || !counter || !nextButton) {
        console.error('unhappy, no corresponding stepper controls for ' + element.id);
        return;
    }

    const children = element.children;
    let indexState = 0;
    function updateStepperChildren() {
        children[indexState].style.display = 'initial';
        for (let i = 0; i < children.length; i++) {
            if (i !== indexState) {
                children[i].style.display = 'none';
            }
        }

        counter.innerText = `${indexState + 1} / ${children.length}`;
    }

    previousButton.addEventListener('click', () => {
        if (indexState === 0) {
            return;
        }
        indexState--;
        updateStepperChildren();
    });
    nextButton.addEventListener('click', () => {
        if (indexState === children.length - 1) {
            return;
        }
        indexState++;
        updateStepperChildren();
    });

    updateStepperChildren();
}

const stepperElements = document.getElementsByClassName('stepper');
for (const element of stepperElements) {
    initializeStepper(element);
}
