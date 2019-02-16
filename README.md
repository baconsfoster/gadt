# gadt

## A dependency-free generalized library of pseudo-algebraic data structures

If you're already familiar with monads and kin, you'll discover that these don't conform to fantasyland or any other spec. These were designed to solve particular real-world problems, with interfaces that can be readily understood by most programmers. The goal is to provide container classes which represent the **context** for a value, without requiring additional state tracking flags.

A brief list of available classes:

* Infer (Actual, Guess, GuessList, Unsolvable)
* Either (Left, Right)
* Maybe (Some, None)

### Infer

Infer came about to solve a particular problem: How can we conviently keep track of a value when the value could be supplied by either the user or the system?

Example: A project manager opens a page to schedule a new project. A list of suggested employees is put together, along with when they will be available. For each, the manager can confirm an appropriate fit, or cycle through suggestions, or manually enter data.

The core classes are `Acutal`, `Guess`, `GuessList` and `Unsolvable`. While Actual represents a user-confirmed value, Guess represents a value suggested by the system which needs to be confirmed. GuessList reprsents a suggested value, and a series of other possibilities, ultimately returning Unsolvable if no suggestions are accepted.

Here is a contrived example:

```javascript
// pseudo-javascript code
const state = {
  selected: new GuessList(['Apple', 'Orange', 'Banana'])
}

const confirm = () => {
  state.selected = state.selected.confirm();
  render();
}

const decline = () => {
  state.selected = state.selected.decline();
  render();
}

const manualEntry = value => {
  state.selected = new Actual(value);
  render();
}

const render = () => {
  state.selected.matchesWith({
    Actual: () => `You selected ${state.selected.value}`,
    GuessList: () => (
      <div>
        You should eat a {state.selected.value}.
        <button onClick={confirm}>Yes</button>
        <button onClick={decline}>No</button>
        <div>
          Or enter what you want instead: <input onSubmit={e => manualEntry(e.target.value)} />
        </div>
      </div>
    ),
    Unsolvable: () => (
      <div>
        What would you like?
        <input onSubmit={e => manualEntry(e.target.value)} />
      </div>
    )
  })
}
```

The render method uses the `Infer.matchesWith` method to automatically present an appropriate message depending on the *current context* of the value. Notice that `state` doesn't need to store any extraneous flags indicating whether the user has interacted with the message, or how many times. That context is provided by the *type* of Infer value stored (Actual, GuessList, Unsovlable).

While `Infer.matchesWith` is useful for switching on *any* context, each class also has a static method to determine if a value is that particular class. So, if you only need to switch on whether something is an Actual or Unsolvable, you might use `if (Actual.is(state.selected)) {...}` or `Unsolvable.is(value) ? ... : ...`.All of the static `is` methods are implemented as TypeScript guard functions, so this is safe:

```javascript
const value: Infer<string> = new Guess('a');

if (Guess.is(value)) {
  console.log(value.decline()); // no TS error that "Infer" doesn't have decline,
                                // because Guess.is tells TS that it is in fact a Guess
}
```

Unfortunately, due to some TS limitations `Guess.is(new GuessList(['a']))` will return false, and so will the inverse. Both Guess and GuessList have an `isGuessLike` static method which will return true for either, but cannot be implemented as a type guard, so the following won't work:

```javascript
const value: Infer<string> = new Guess('a');

if (GuessList.isGuessLike(value)) {
  console.log(value.confirm()); // this code would run, but TS will error because it still thinks value could be any Infer

  // instead, you still have to cast the value, or wrap it in extra if clauses using Guess.is and GuessList.is
  console.log(
    (value as Guess).confirm()
  );
}
```
