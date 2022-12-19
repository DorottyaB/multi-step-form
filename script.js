const navBtns = document.querySelectorAll('input[type="radio"][name="steps"]');
const sections = document.querySelectorAll('section');
const toggleSwitch = document.getElementById('toggle-switch');
const nextBtn = document.getElementById('btn-next');
const backBtn = document.getElementById('btn-back');
const form = document.querySelector('form');
const invalidTooltips = document.querySelectorAll('.invalid-tooltip');
const planBtns = document.querySelectorAll('input[type="radio"][name="plan"]');
const addOnBtns = document.querySelectorAll('input[type="checkbox"][name="add-on"]');

let isValid = false;
let storedData = {};

navBtns.forEach(btn => (btn.disabled = true));

// STEP 1 (FORM)
function validateForm() {
  const inputs = form.querySelectorAll('input');
  inputs.forEach((input, index) =>
    input.validity.valueMissing
      ? (invalidTooltips[index].textContent = 'This field is required') &&
        (invalidTooltips[index].hidden = false)
      : (invalidTooltips[index].hidden = true)
  );
  if (!inputs[1].validity.valueMissing && !inputs[1].validity.valid) {
    invalidTooltips[1].textContent = 'Not a valid email address';
    invalidTooltips[1].hidden = false;
  }
  if (!inputs[2].validity.valueMissing && inputs[2].validity.patternMismatch) {
    invalidTooltips[2].textContent = 'Not a valid phone number';
    invalidTooltips[2].hidden = false;
  }
  // Hide tooltip when user starts typing again
  inputs.forEach((input, index) =>
    input.addEventListener('keydown', () => {
      invalidTooltips[index].hidden = true;
      nextBtn.disabled = false;
    })
  );

  isValid = form.checkValidity();
  if (!isValid) {
    nextBtn.disabled = true;
  } else {
    navBtns.forEach(btn => (btn.disabled = false));
  }
}

function storeData() {
  storedData = {
    name: form.name.value,
    email: form.email.value,
    phone: form.phone.value,
    plan: Array.from(planBtns).filter(plan => plan.checked)[0].value,
    isYearly: toggleSwitch.checked,
    addOns: Array.from(addOnBtns)
      .filter(addOn => addOn.checked)
      .map(el => el.value),
  };
}

// STEP 2 & 3
toggleSwitch.addEventListener('change', () => {
  const monthly = document.getElementById('monthly-plan');
  const yearly = document.getElementById('yearly-plan');
  const planPrice = document.querySelectorAll('.plan-price');
  const deal = document.querySelectorAll('.yearly-deal');
  const addOnPrice = document.querySelectorAll('.add-on-price');
  if (toggleSwitch.checked) {
    monthly.classList.remove('active');
    yearly.classList.add('active');
    planPrice.forEach((el, index) => (el.textContent = `$${data.plans[index].price.yearly}/yr`));
    deal.forEach(element => element.classList.remove('hidden'));
    addOnPrice.forEach((el, index) => (el.textContent = `+$${data.addOns[index].price.yearly}/yr`));
  } else {
    monthly.classList.add('active');
    yearly.classList.remove('active');
    planPrice.forEach((el, index) => (el.textContent = `$${data.plans[index].price.monthly}/mo`));
    deal.forEach(element => element.classList.add('hidden'));
    addOnPrice.forEach(
      (el, index) => (el.textContent = `+$${data.addOns[index].price.monthly}/mo`)
    );
  }
});

// STEP 4 - SUMMARY
function showSummary() {
  const timePeriod = storedData.isYearly ? ' (Yearly)' : ' (Monthly)';
  document.getElementById('selected-plan').textContent = `${storedData.plan} ${timePeriod}`;
  const selectedPlan = data.plans.filter(plan => plan.name === storedData.plan)[0];
  const planPrice = storedData.isYearly ? selectedPlan.price.yearly : selectedPlan.price.monthly;
  document.getElementById('selected-plans-price').textContent = storedData.isYearly
    ? `$${planPrice}/yr`
    : `$${planPrice}/mo`;
  let addOnsPrice = [];
  if (storedData.addOns) {
    const container = document.getElementById('summary-container');
    storedData.addOns.forEach(item => {
      const addOnContainer = document.createElement('div');
      addOnContainer.classList.add('flex', 'justify-between', 'addOnContainer');
      const addOnName = document.createElement('p');
      addOnName.classList.add('text-coolGray', 'text-sm', 'font-medium', 'lg:text-md');
      addOnName.textContent = item;
      const addOnPrice = document.createElement('p');
      addOnPrice.classList.add('text-marineBlue', 'text-sm', 'font-medium', 'lg:text-md');
      const selectedAddOn = data.addOns.filter(addOn => addOn.name === item)[0];
      const price = storedData.isYearly ? selectedAddOn.price.yearly : selectedAddOn.price.monthly;
      addOnsPrice.push(price);
      addOnPrice.textContent = storedData.isYearly ? `+$${price}/yr` : `+$${price}/mo`;
      addOnContainer.append(addOnName, addOnPrice);
      container.appendChild(addOnContainer);
    });
  }
  document.getElementById('total-per-period').textContent = storedData.isYearly
    ? ' (per year)'
    : ' (per month)';
  const addOnsPriceNumbers = addOnsPrice.map(price => Number(price));
  const sum = addOnsPriceNumbers.reduce(function (previousValue, currentValue) {
    return previousValue + currentValue;
  }, 0);
  document.getElementById('total-price').textContent = `$${sum + Number(planPrice)}/${
    storedData.isYearly ? 'yr' : 'mo'
  }`;
}

// NAVIGATION
function changeContent(btn) {
  if (btn.checked) {
    sections.forEach(section =>
      section.id === `section-${btn.id}` ? (section.hidden = false) : (section.hidden = true)
    );
  }
  sections[0].hidden === true ? (backBtn.hidden = false) : (backBtn.hidden = true);
  if (sections[3].hidden === false) {
    storeData();
    nextBtn.textContent = 'Confirm';
    nextBtn.style.backgroundColor = 'hsl(243, 100%, 62%)';
    showSummary();
  } else {
    nextBtn.textContent = 'Next Step';
    nextBtn.style.backgroundColor = 'hsl(213, 96%, 18%)';
  }
  btn.disabled = false;
}

function getSection(direction) {
  const currentSection = Array.from(sections).find(section => section.hidden === false);
  const id = currentSection.id;
  const prevSection = Number(id.slice(-1)) - 1;
  const nextSection = Number(id.slice(-1)) + 1;
  navBtns.forEach(btn => {
    if (direction === 'back' && btn.id === `step-${prevSection}`) {
      btn.checked = true;
      changeContent(btn);
    } else if (direction === 'next' && btn.id === `step-${nextSection}`) {
      btn.checked = true;
      changeContent(btn);
    }
  });
}

// Remove elements to avoid appending them multiple times
function removeElements() {
  if (sections[3].hidden === false) {
    const container = document.getElementById('summary-container');
    const addOnContainers = container.querySelectorAll('.addOnContainer');
    addOnContainers.forEach(item => container.removeChild(item));
  }
}

// Event Listeners
navBtns.forEach(btn =>
  btn.addEventListener('change', () => {
    if (sections[0].hidden === false) {
      validateForm();
      if (isValid) {
        changeContent(btn);
      }
    } else {
      changeContent(btn);
    }
  })
);

nextBtn.addEventListener('click', () => {
  if (nextBtn.textContent === 'Confirm') {
    sections.forEach(section =>
      section.id === 'section-step-5' ? (section.hidden = false) : (section.hidden = true)
    );
    backBtn.hidden = true;
    nextBtn.hidden = true;
    navBtns.forEach(btn => (btn.disabled = true));
    navBtns[3].checked = false;
  } else if (sections[0].hidden === false) {
    validateForm();
    if (isValid) {
      getSection('next');
    }
  } else {
    getSection('next');
  }
});

backBtn.addEventListener('click', () => {
  removeElements();
  getSection('back');
});

document.getElementById('btn-change').addEventListener('click', () => {
  removeElements();
  navBtns.forEach(btn => {
    if (btn.id === 'step-2') {
      btn.checked = true;
      changeContent(btn);
    }
  });
});
