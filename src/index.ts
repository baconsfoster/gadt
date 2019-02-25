import { MatchesWith } from '@baconsfoster/matches-with';

export class Base<T> implements MatchesWith {
  static matchesWith = MatchesWith.matchesWith;
  matchesWith = MatchesWith.prototype.matchesWith;

  // TypeScript doesn't allow `this` in typeguards in static methods
  // TypeScript ALSO doesn't allow static methods to be abstract
  // SO here's a copy-pastable example (replacing the first `this` with the class name)
  // It's a shame it can't be inherited or enforced to exist by the compiler :(

  // static is(someValue: any): someValue is this {
  //   return someValue instanceof this;
  // }

  constructor(public readonly value: T){}
}



export abstract class Maybe<T> extends Base<T> {
  new(val?: T) {
    if (val) return new Some(val);
    return new None();
  }
}
export class Some<T> extends Maybe<T>{
  static is<T>(someValue: any): someValue is Some<T> {
    return someValue instanceof this;
  }
}
export class None extends Maybe<void>{
  static is(someValue: any): someValue is None {
    return someValue instanceof this;
  }
  constructor() {
    super();
  }
}

export abstract class Either<T> extends Base<T>{}
export class Left<T> extends Either<T>{
  static is<T>(someValue: any): someValue is Left<T> {
    return someValue instanceof this;
  }
}
export class Right<T> extends Either<T>{
  static is<T>(someValue: any): someValue is Right<T> {
    return someValue instanceof this;
  }
}

export abstract class Infer<T> extends Base<T>{}

export class Unsolvable extends Infer<void> {
  static is(someValue: any): someValue is Unsolvable {
    return someValue instanceof this;
  }

  constructor() {
    super(undefined);
  }
}

interface _Guess<T> {
  confirm(): Actual<T>;
  decline(): Unsolvable | GuessList<T>
}

export class Guess<T> extends Infer<T> implements _Guess<T> {
  static is<T>(someValue: any): someValue is Guess<T> {
    return someValue instanceof this;
  }

  static isGuessLike(someValue: any): boolean {
    return Guess.is(someValue) || GuessList.is(someValue);
  }

  confirm() {
    return new Actual(this.value);
  }

  decline() {
    return new Unsolvable();
  }
}

export class GuessList<T> extends Infer<T> implements _Guess<T>{
  static is<T>(someValue: any): someValue is GuessList<T> {
    return someValue instanceof this;
  }

  static isGuessLike(someValue: any): boolean {
    return Guess.is(someValue) || GuessList.is(someValue);
  }

  constructor(public readonly values: T[]) {
    super(values[0]);
  }

  confirm() {
    return new Actual(this.value);
  }

  decline(): Unsolvable | GuessList<T> {
    if (this.values.length <2) {
      return new Unsolvable();
    }
    return new GuessList(this.values.slice(1));
  }
}

export class Actual<T> extends Infer<T>{
  static is<T>(someValue: any): someValue is Actual<T> {
    return someValue instanceof this;
  }

}

const MatchLookupMap = {
  Actual: Actual,
  Guess: Guess,
  Guesses: GuessList,
  Unsolvable: Unsolvable
};
