import { checkLine } from '../utils';

class Phrase {
  private _maxLength: number;

  private _phrase: string[] = [];

  constructor(maxLength: number) {
    this._maxLength = maxLength;
  }

  get length(): number {
    return checkLine(this.toString());
  }

  get maxLength(): number {
    return this._maxLength;
  }

  public insert = (word: string): number => this._phrase.push(word);

  public isValid = (): boolean => this.length === this.maxLength;

  public toString = (): string => this._phrase.join(' ');
}

export default Phrase;
