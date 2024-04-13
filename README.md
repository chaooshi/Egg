# Egg: A Programming Language

This implementation is for a project described in Chapter 12 of Eloquent JavaScript, 4th Edition, where this language is introduced. It includes solutions to all additional exercises, such as adding arrays, supporting comments, and updating scoped variables.

## Features

- Egg supports comments, which start with the # sign and end at the end of the line.
- The Syntax Tree can be viewed by running .\parser.js.
- Egg allows functions to reference the surrounding scope, commonly referred to as closures.

## Usage/Examples

In the evaluator.js file, define your expression or program at the end, and then pass it to the run function. Execute Egg using Node to see the evaluation results.

for example write this code at the end of evaluator.js file:

```javascript
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
```

and in terminal run this:

```cmd
node .\evaluator.js
```

The expected output in the terminal is 6.
