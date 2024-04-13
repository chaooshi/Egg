export function parse(program) {
  let { expr, rest } = parseExpression(program);
  if (skipSpace(rest).length > 0) {
    throw new SyntaxError("Unexpected text after program");
  }
  return expr;
}

function parseExpression(program) {
  program = skipSpace(program);
  let expr, match;
  if ((match = /^"([^"]*)"/.exec(program))) {
    expr = { type: "value", value: match[1] };
  } else if ((match = /^\d+\b/.exec(program))) {
    expr = { type: "value", value: Number(match[0]) };
  } else if ((match = /^[^\s()",#"]+/.exec(program))) {
    expr = { type: "word", name: match[0] };
  } else {
    throw new SyntaxError(`Invalid Expression: ${program} `);
  }
  return parseApply(expr, program.slice(match[0].length));
}

function parseApply(expr, program) {
  program = skipSpace(program);
  if (program[0] != "(") {
    return { expr: expr, rest: program };
  }
  expr = { type: "apply", operator: expr, args: [] };
  program = program.slice(1);
  while (program[0] != ")") {
    let args = parseExpression(program);
    expr.args.push(args.expr);
    program = skipSpace(args.rest);
    if (program[0] == ",") {
      program = skipSpace(program.slice(1));
    } else if (program[0] != ")") {
      throw new SyntaxError("There must be ',' or ')'");
    }
  }
  return parseApply(expr, program.slice(1));
}

function skipSpace(string) {
  let skippable = /^(\s|#.*)*/.exec(string);
  return string.slice(skippable[0].length);
}

// console.log(parse("+(6, 10)"));
// console.log(
//   parse("do (define (x,10),if (> (x, 5), print('large'), print('small')))")
// );
// console.dir(parse("define(f, fun(a, fun(b, +(a, b))))"), { depth: null });

// console.log(parse("# hello\nx")); // Test comments
// console.log(parse("a # one\n   # two\n()")); // Test Comments
