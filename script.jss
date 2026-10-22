const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const keypad = document.querySelector(".keypad");

let currentInput = "0";
let storedValue = null;
let currentOperator = null;
let waitingForOperand = false;
let expressionText = "";
let justCalculated = false;

function updateDisplay() {
  resultDisplay.textContent = currentInput;
  expressionDisplay.textContent = expressionText;
}

function formatNumber(number) {
  if (!Number.isFinite(number)) {
    return "Error";
  }

  const rounded = Number.parseFloat(number.toPrecision(12));
  return String(rounded);
}

function clearCalculator() {
  currentInput = "0";
  storedValue = null;
  currentOperator = null;
  waitingForOperand = false;
  expressionText = "";
  justCalculated = false;
  updateDisplay();
}

function inputNumber(number) {
  if (currentInput === "Error" || justCalculated) {
    currentInput = number;
    expressionText = "";
    storedValue = null;
    currentOperator = null;
    waitingForOperand = false;
    justCalculated = false;
    updateDisplay();
    return;
  }

  if (waitingForOperand) {
    currentInput = number;
    waitingForOperand = false;
  } else {
    currentInput =
      currentInput === "0" ? number : currentInput + number;
  }

  updateDisplay();
}

function inputDecimal() {
  if (currentInput === "Error" || justCalculated) {
    currentInput = "0.";
    expressionText = "";
    storedValue = null;
    currentOperator = null;
    waitingForOperand = false;
    justCalculated = false;
    updateDisplay();
    return;
  }

  if (waitingForOperand) {
    currentInput = "0.";
    waitingForOperand = false;
  } else if (!currentInput.includes(".")) {
    currentInput += ".";
  }

  updateDisplay();
}

function calculate(first, second, operator) {
  switch (operator) {
    case "+":
      return first + second;
    case "-":
      return first - second;
    case "*":
      return first * second;
    case "/":
      return second === 0 ? NaN : first / second;
    default:
      return second;
  }
}

function chooseOperator(operator) {
  if (currentInput === "Error") {
    clearCalculator();
    return;
  }

  const inputValue = Number(currentInput);

  if (currentOperator && !waitingForOperand) {
    const result = calculate(storedValue, inputValue, currentOperator);

    currentInput = formatNumber(result);

    if (currentInput === "Error") {
      expressionText = "Cannot divide by zero";
      storedValue = null;
      currentOperator = null;
      waitingForOperand = true;
      justCalculated = false;
      updateDisplay();
      return;
    }

    storedValue = Number(currentInput);
  } else {
    storedValue = inputValue;
  }

  currentOperator = operator;
  waitingForOperand = true;
  justCalculated = false;
  expressionText = `${currentInput} ${getOperatorSymbol(operator)}`;
  updateDisplay();
}

function getOperatorSymbol(operator) {
  const symbols = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷"
  };

  return symbols[operator] || operator;
}

function performCalculation() {
  if (
    currentOperator === null ||
    storedValue === null ||
    waitingForOperand ||
    currentInput === "Error"
  ) {
    return;
  }

  const first = storedValue;
  const second = Number(currentInput);
  const operator = currentOperator;
  const result = calculate(first, second, operator);

  expressionText =
    `${formatNumber(first)} ${getOperatorSymbol(operator)} ${formatNumber(second)} =`;

  currentInput = formatNumber(result);

  if (currentInput === "Error") {
    expressionText = "Cannot divide by zero";
  }

  storedValue = null;
  currentOperator = null;
  waitingForOperand = true;
  justCalculated = true;

  updateDisplay();
}

function deleteLastCharacter() {
  if (currentInput === "Error" || justCalculated) {
    clearCalculator();
    return;
  }

  if (waitingForOperand) {
    return;
  }

  currentInput =
    currentInput.length > 1
      ? currentInput.slice(0, -1)
      : "0";

  if (currentInput === "-") {
    currentInput = "0";
  }

  updateDisplay();
}

function handleAction(action, value) {
  switch (action) {
    case "number":
      inputNumber(value);
      break;
    case "decimal":
      inputDecimal();
      break;
    case "operator":
      chooseOperator(value);
      break;
    case "calculate":
      performCalculation();
      break;
    case "clear":
      clearCalculator();
      break;
    case "delete":
      deleteLastCharacter();
      break;
  }
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  handleAction(button.dataset.action, button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9]$/.test(key)) {
    inputNumber(key);
  } else if (key === ".") {
    inputDecimal();
  } else if (["+", "-", "*", "/"].includes(key)) {
    chooseOperator(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    performCalculation();
  } else if (key === "Backspace") {
    deleteLastCharacter();
  } else if (key === "Escape" || key === "Delete") {
    clearCalculator();
  }
});

updateDisplay();
