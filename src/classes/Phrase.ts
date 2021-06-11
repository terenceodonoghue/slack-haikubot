import { syllables } from '../utils';

class Phrase {
  private _maxLength: number;
  private _phrase: string[] = [];

  constructor(maxLength: number) {
    this._maxLength = maxLength;
  }

  get length() {
    return syllables(this.toString());
  }

  get maxLength() {
    return this._maxLength;
  }

  public insert = (word: string) => this._phrase.push(word);

  public isValid = () => this.length === this.maxLength;

  public toString = () => this._phrase.join(' ');
}

export default Phrase;
