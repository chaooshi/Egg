import { parse } from "./parser.js";

const specialForms = Object.create(null);

specialForms.if = (args, scope) => {
  if (args.length !== 3) {
    throw new SyntaxError("Wrong number of args to if");
  } else if (evaluate(args[0], scope) !== false) {
    return evaluate(args[1], scope);
  } else {
    return evaluate(args[2], scope);
  }
};

specialForms.do = (args, scope) => {
  let value = false;
  args.forEach((arg) => {
    value = evaluate(arg, scope);
  });
  return value;
};

specialForms.define = (args, scope) => {
  if (args.length !== 2) {
    throw new SyntaxError("Wrong number of args to define");
  } else if (args[0].type !== "word") {
    throw new SyntaxError("Invalid args to define");
  }
  let value = evaluate(args[1], scope);
  scope[args[0].name] = value;
  return value;
};

specialForms.while = (args, scope) => {
  if (args.length != 2) {
    throw new SyntaxError("Wrong number of args to while");
  }
  while (evaluate(args[0], scope) !== false) {
    evaluate(args[1], scope);
  }
  return false;
};

specialForms.fun = (args, scope) => {
  if (!args.length) {
    throw new SyntaxError("Functions need a body.");
  }
  const body = args[args.length - 1];
  const params = args.slice(0, args.length - 1).map((expr) => {
    if (expr.type !== "word") {
      throw new TypeError("Parameter names must be words");
    }
    return expr.name;
  });
  return function (...args) {
    if (args.length !== params.length) {
      throw new TypeError("Wrong number of arguments");
    }
    const localScope = Object.create(scope);
    params.forEach((param, idx) => (localScope[param] = args[idx]));
    return evaluate(body, localScope);
  };
};

specialForms.set = (args, scope) => {
  if (args.length !== 2) {
    throw new SyntaxError("Wrong number of args to set");
  } else if (args[0].type !== "word") {
    throw new SyntaxError("Invalid args to set");
  }
  let outerScope = Object.getPrototypeOf(scope);
  let innerScope = scope;
  let value = evaluate(args[1], scope);
  while (outerScope) {
    if (Object.hasOwn(innerScope, args[0].name)) {
      innerScope[args[0].name] = value;
      return value;
    }
    innerScope = outerScope;
    outerScope = Object.getPrototypeOf(outerScope);
  }
  throw new ReferenceError(`${args[0].name} is not defined.`);
};

const topScope = Object.create(null);

topScope.true = true;
topScope.false = false;

topScope.print = (value) => {
  console.log(value);
  return value;
};

["+", "-", "*", "/", "==", "!=", "<", ">"].forEach(
  (op) => (topScope[op] = Function("a,b", `return a ${op} b;`))
);

topScope.array = (...value) => {
  const arr = new Array(...value);
  return arr;
};

topScope.length = (array) => {
  if (!Array.isArray(array)) {
    throw new TypeError("Applying length to non-array");
  }
  return array.length;
};

topScope.element = (array, n) => {
  if (!Array.isArray(array)) {
    throw new TypeError("Applying element to non-array");
  }
  return array[n];
};

function evaluate(expr, scope) {
  if (expr.type == "value") {
    return expr.value;
  } else if (expr.type == "word") {
    if (expr.name in scope) {
      return scope[expr.name];
    } else {
      throw new ReferenceError(`Undefined binding: ${expr.name}`);
    }
  } else if (expr.type === "apply") {
    let { operator, args } = expr;
    if (operator.type == "word" && operator.name in specialForms) {
      return specialForms[operator.name](args, scope);
    } else {
      let op = evaluate(operator, scope);
      if (typeof op == "function") {
        return op(...args.map((arg) => evaluate(arg, scope)));
      } else {
        throw new TypeError("Applying a non-function");
      }
    }
  }
}

function run(program) {
  return evaluate(parse(program), Object.create(topScope));
}

// FIRST PROGRAM

/*
console.dir(
  parse(`
do(define(total, 0),
   define(count, 1),
   while(<(count, 11),
         do(define(total, +(total, count)),
            define(count, +(count, 1)))),
   print(total))
`),
  { depth: null }
);

run(`
do(define(total, 0),
   define(count, 1),
   while(<(count, 11),
         do(define(total, +(total, count)),
            define(count, +(count, 1)))),
   print(total))
`);
 */

// SECOND PROGRAM (illustrate usage of fun)

/*
run(`
do(define(plusOne, fun(a, +(a, 1))),
   print(plusOne(10)))
`);
*/

// THIRD PROGRAM (illustrate usage of fun)

/*
run(`
do(define(pow, fun(base, exp,
     if(==(exp, 0),
        1,
        *(base, pow(base, -(exp, 1)))))),
   print(pow(2, 10)))
`);
*/

// FORTH PROGRAM (illustrate array)

/*
run(`
do(define(sumArray, fun(array,
     do(define(i, 0),
        define(sum, 0),
        while(<(i, length(array)),
          do(define(sum, +(sum, element(array, i))),
             define(i, +(i, 1)))),
        sum))),
   print(sumArray(array(1, 2, 3))))
`);
*/

// FIFTH PROGRAM (illustrate closure)
/*

console.dir(
  parse(
    `
do(define(f, fun(a, fun(b, +(a, b)))),
   print(f(4)(5)))
`
  ),
  { depth: null }
);

console.dir(parse(`print(f(4)(5))`), { depth: null });
*/

// SIXTH PROGRAM (illustrate set)
/*
run(`do(define(x, 4),
    define(setx, fun(val, set(x, val))),
    setx(50),
    print(x))
`);


run(`
do(define(sum, fun(array,
     do(define(i, 0),
        define(sum, 0),
        while(<(i, length(array)),
          do(set(sum, +(sum, element(array, i))),
             set(i, +(i, 1)))),
        sum))),
   print(sum(array(1, 2, 3))))
`);
*/
