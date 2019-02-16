declare var require: any;
export const assert = require('assert');

const queue: any[] = [];
let passCount = 0;
let failCount = 0;
const prettyError = (e, name) => `
Failure: ${ name}
    testing: ${ e.message}
    Expected: ${ e.expected}
    Actual: ${ e.actual}
`;
export function test(name, testfn) {
  queue.push([testfn, name]);
}

export function run() {
  queue.forEach(([fn, name]) => {
    try {
      fn();
      passCount++;
    } catch (e) {
      failCount++;
      console.log(prettyError(e, name));
    }
  });
  console.log('Finished running tests');
  console.log(`Passed: ${passCount}`, `Failed: ${failCount}`);
}
