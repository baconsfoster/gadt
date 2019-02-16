import { test, run, assert } from './_test_utils';
import { None, Actual, Unsolvable, Guess, GuessList } from './index';

test('Infer.is', () => {
  assert(Actual.is(new Actual(1)), 'matches constructor types');
  assert(!(Actual.is(new Unsolvable())), 'does not match other types');
});

test('Guess confirm', () => {
  assert(
    Actual.is((new Guess(1)).confirm())
  ),
  'returns a new Actual'
});

test('Guess decline', () => {
  assert(
    Unsolvable.is((new Guess(1)).decline())
  ),
  'returns a new Unsolvable'
});

test('Guesses confirm', () => {
  assert(
    Actual.is(
      (new GuessList([1,2])).confirm()
    ),
    'returns a new Actual'
  )
});

test('Guesses decline', () => {
  const firstGuess = new GuessList([1, 2]);
  const secondGuess = firstGuess.decline();

  assert(GuessList.is(secondGuess), 'Declining with remaining guesses returns a new Guesses');

  const endResult = (secondGuess as GuessList<number>).decline();
  assert(Unsolvable.is(endResult), 'Declining without remaining guesses returns an Unsolvable');
});

test('Infer matchesWith', () => {
  const actual = new Actual(1);
  assert(
    actual.matchesWith({
      Unsolvable: () => false,
      Guess: () => false,
      Guesses: () => false,
      Actual: () => true
    }),
    'matches only the actual instance type'
  );

  const guess = new Guess(1);
  assert(
    None.is(guess.matchesWith({
      Actual: () => false,
    })),
    'returns a None if no matching conditions are present'
  )
});

run();
