const operators = ["/", "*", "-", "+"]
const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const special = ["C", "±", "%"]

export const keyMap = {
  "÷": "/",
  "×": "*",
}

export const calc = (x, op, y) => {
  switch (op) {
    case "/":
      return x / y
    case "*":
      return x * y
    case "-":
      return x - y
    case "+":
      return x + y
    default:
      return y
  }
}

export const isValidChar = char => {
  const validChars = [
    ...operators,
    ...special,
    ...numbers,
    ".",
    "=",
    "backspace",
  ]
  return validChars.includes(char) || validChars.includes(Number(char))
}

export const isOperator = char => {
  return operators.includes(char)
}

export const isNumber = char => {
  return numbers.includes(Number(char))
}
