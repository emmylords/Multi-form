const steps = document.querySelectorAll('.step');
const stepContents = document.querySelectorAll('.step-content');
const nextBtn = document.getElementById('next-step-btn');
const backBtn = document.getElementById('go-back-btn');
const form = document.querySelector('.main-form');
const planCards = document.querySelectorAll('.plan-card');
const billingSwitch = document.getElementById('billing-switch');
const billingToggleText = document.querySelectorAll('.billing-toggle span');
const addonCheckboxes = document.querySelectorAll('.addon-card input[type="checkbox"]');
const summaryPlanName = document.getElementById('summary-plan-name');
const summaryPlanPrice = document.getElementById('summary-plan-price');
const summaryAddons = document.querySelector('.summary-addons');
const summaryTotalPrice = document.getElementById('summary-total-price');
const totalBillingPeriod = document.getElementById('total-billing-period');
const changePlanLink = document.getElementById('change-plan');

let currentStep = 1;
let billingPeriod = 'monthly';
const userSelections = {
    plan: { name: 'Arcade', price: 9 },
    addons: []
};

// Update UI
function updateUI() {
    // Update step numbers
    steps.forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        if (stepNum === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    // Show/hide steps
    stepContents.forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`step-${currentStep}`).classList.add('active');

    // Show/hide navigation buttons
    if (currentStep === 1) {
        backBtn.classList.add('hidden');
    } else {
        backBtn.classList.remove('hidden');
    }

    if (currentStep === 4) {
        nextBtn.textContent = 'Confirm';
        nextBtn.id = 'confirm-btn';
    } else {
        nextBtn.textContent = 'Next Step';
        nextBtn.id = 'next-step-btn';
    }
}

// Handle form submission and validation
function validateStep() {
    if (currentStep === 1) {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        if (name === '' || email === '' || phone === '') {
            alert('Please fill out all fields.');
            return false;
        }
    }
    return true;
}

// Update billing period and prices
function updateBilling() {
    billingPeriod = billingSwitch.checked ? 'yearly' : 'monthly';
    billingToggleText[0].classList.toggle('active', billingPeriod === 'monthly');
    billingToggleText[1].classList.toggle('active', billingPeriod === 'yearly');

    // Update plan prices
    planCards.forEach(card => {
        const priceMonthly = card.dataset.priceMonthly;
        const priceYearly = card.dataset.priceYearly;
        const priceElement = card.querySelector('p');

        if (billingPeriod === 'yearly') {
            priceElement.textContent = `$${priceYearly}/yr`;
            priceElement.insertAdjacentHTML('afterend', '<p class="free-months">2 months free</p>');
        } else {
            priceElement.textContent = `$${priceMonthly}/mo`;
            const freeMonths = card.querySelector('.free-months');
            if (freeMonths) freeMonths.remove();
        }
    });

    // Update addon prices
    addonCheckboxes.forEach(checkbox => {
        const priceMonthly = checkbox.dataset.priceMonthly;
        const priceYearly = checkbox.dataset.priceYearly;
        const priceElement = checkbox.closest('.addon-card').querySelector('.addon-price');
        priceElement.textContent = `+$${billingPeriod === 'yearly' ? priceYearly : priceMonthly}/${billingPeriod === 'yearly' ? 'yr' : 'mo'}`;
    });

    // Update summary
    updateSummary();
}

// Update summary on step 4
function updateSummary() {
    const planPriceKey = billingPeriod === 'yearly' ? 'price-yearly' : 'price-monthly';
    const selectedPlan = document.querySelector('.plan-card.active');
    const selectedAddons = Array.from(addonCheckboxes).filter(cb => cb.checked);

    // Update plan info
    userSelections.plan = {
        name: selectedPlan.dataset.plan,
        price: parseInt(selectedPlan.dataset[planPriceKey])
    };
    const periodText = billingPeriod === 'yearly' ? 'Yearly' : 'Monthly';
    const periodAbbr = billingPeriod === 'yearly' ? 'yr' : 'mo';
    summaryPlanName.textContent = `${userSelections.plan.name} (${periodText})`;
    summaryPlanPrice.textContent = `$${userSelections.plan.price}/${periodAbbr}`;

    // Update addons
    userSelections.addons = [];
    summaryAddons.innerHTML = '';
    let addonsTotal = 0;

    selectedAddons.forEach(addon => {
        const addonName = addon.value;
        const addonPrice = parseInt(addon.dataset[planPriceKey]);
        addonsTotal += addonPrice;
        userSelections.addons.push({ name: addonName, price: addonPrice });

        const addonItem = document.createElement('div');
        addonItem.classList.add('addon-summary-item');
        addonItem.innerHTML = `
            <p>${addonName}</p>
            <span>+$${addonPrice}/${periodAbbr}</span>
        `;
        summaryAddons.appendChild(addonItem);
    });

    // Update total
    const total = userSelections.plan.price + addonsTotal;
    totalBillingPeriod.textContent = `per ${billingPeriod === 'yearly' ? 'year' : 'month'}`;
    summaryTotalPrice.textContent = `$${total}/${periodAbbr}`;
}

// Event Listeners
nextBtn.addEventListener('click', () => {
    if (validateStep() && currentStep < 4) {
        currentStep++;
        updateUI();
    } else if (currentStep === 4) {
        // Handle final confirmation
        document.getElementById('step-4').classList.remove('active');
        document.getElementById('step-5').classList.add('active');
        document.querySelector('.form-navigation').style.display = 'none';
    }
});

backBtn.addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        updateUI();
    }
});

planCards.forEach(card => {
    card.addEventListener('click', () => {
        planCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        updateSummary();
    });
});

billingSwitch.addEventListener('change', () => {
    updateBilling();
});

addonCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const card = checkbox.closest('.addon-card');
        card.classList.toggle('selected', checkbox.checked);
        updateSummary();
    });
});

changePlanLink.addEventListener('click', (e) => {
    e.preventDefault();
    currentStep = 2;
    updateUI();
});

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    updateBilling(); // Set initial billing prices
});