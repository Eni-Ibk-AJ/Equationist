function evaluate(source) {
  const input = String(source ?? '')
    .replace(/×|Ã—/g, '*')
    .replace(/÷|Ã·/g, '/')
    .replace(/−|–|âˆ’/g, '-');
  if (!input.trim() || input.length > 100 || !/^[\d+\-*/^().\s]+$/.test(input)) {
    throw new Error('Enter a valid arithmetic expression.');
  }

  const tokens = input.match(/\d+(?:\.\d+)?|[+\-*/^()]|\S/g) || [];
  if (tokens.length > 80) throw new Error('Expression is too long.');
  let index = 0;

  function primary() {
    const token = tokens[index++];
    if (token === '(') {
      const value = expression();
      if (tokens[index++] !== ')') throw new Error('Unmatched parenthesis.');
      return value;
    }
    const number = Number(token);
    if (!Number.isFinite(number) || token === undefined) {
      throw new Error('Invalid number.');
    }
    return number;
  }

  function power() {
    const base = primary();
    if (tokens[index] === '^') {
      index += 1;
      return base ** unary();
    }
    return base;
  }

  function unary() {
    if (tokens[index] === '+') {
      index += 1;
      return unary();
    }
    if (tokens[index] === '-') {
      index += 1;
      return -unary();
    }
    return power();
  }

  function term() {
    let value = unary();
    while (tokens[index] === '*' || tokens[index] === '/') {
      const operator = tokens[index++];
      const right = unary();
      value = operator === '*' ? value * right : value / right;
    }
    return value;
  }

  function expression() {
    let value = term();
    while (tokens[index] === '+' || tokens[index] === '-') {
      const operator = tokens[index++];
      const right = term();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  }

  const result = expression();
  if (index !== tokens.length || !Number.isFinite(result)) {
    throw new Error('Invalid arithmetic expression.');
  }
  return result;
}

function matchesAnswer(input, target, mode) {
  const parts = String(input ?? '').split('=');
  if (parts.length > 2) return false;
  if (parts.length === 2) {
    const left = evaluate(parts[0]);
    const right = evaluate(parts[1]);
    return Math.abs(left - right) < 1e-9 && Math.abs(left - Number(target)) < 1e-9;
  }
  const value = evaluate(input);
  return Number.isFinite(Number(target)) && Math.abs(value - Number(target)) < 1e-9;
}

export { evaluate, matchesAnswer };
