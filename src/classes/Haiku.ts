import Phrase from './Phrase';
import { checkLine } from '../utils';

const MAX_SYLLABLE_LENGTH = 17;

class Haiku {
  private _author: string;

  private _phrases: Phrase[];

  constructor(message: string, author: string) {
    if (!Haiku.validate(message))
      throw new Error(
        `Incorrect syllable count, expected ${MAX_SYLLABLE_LENGTH}, received ${checkLine(
          message,
        )}`,
      );

    const words = message.split(' ');

    this._author = author;
    this._phrases = [new Phrase(5), new Phrase(7), new Phrase(5)];

    this._phrases.forEach((phrase) => {
      while (words.length > 0 && phrase.length < phrase.maxLength) {
        const word = words.shift();
        if (word) phrase.insert(word);
      }
    });
  }

  public isValid = (): boolean =>
    !this._phrases.filter((phrase) => !phrase.isValid()).length;

  public toString = (): string => {
    const [firstLine, secondLine, thirdLine] = this._phrases.map((phrase) =>
      phrase.toString(),
    );

    return `_${firstLine}_\n_${secondLine}_\n_${thirdLine}_\n- <@${this._author}>`;
  };

  public static validate = (message: string): boolean =>
    checkLine(message) === MAX_SYLLABLE_LENGTH;
}

export default Haiku;
