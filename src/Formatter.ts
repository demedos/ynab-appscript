abstract class BaseFormatter<T> {
  abstract format(value: string): T;
}

class AmountFormatter extends BaseFormatter<number> {
  /**
   * The transaction amount in milliunits format
   */
  format = (value: string): number => {
    return Math.round(parseFloat(value.replace(',', '.')) * 1000);
  };

  /**
   * The transaction amount in milliunits format and formatted as a negative number
   */
  formatOutflow = (value: string): number => {
    return -this.format(value);
  };
}

class DateFormatter extends BaseFormatter<string> {
  /**
   * Convert from DD/MM/YYYY to YYYY-MM-DD
   */
  format = (value: string): string => {
    const parts = value.split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };
}

class PayeeFormatter extends BaseFormatter<string> {
  /**
   * Trims the Payee name
   */
  format = (value: string): string => {
    return value.trim();
  };
}
export enum FormatterType {
  DATE,
  PAYEE,
  AMOUNT,
}

type FormatterMap = {
  [FormatterType.DATE]: DateFormatter;
  [FormatterType.PAYEE]: PayeeFormatter;
  [FormatterType.AMOUNT]: AmountFormatter;
};

export class FormatterFactory {
  private static formatters: FormatterMap = {
    [FormatterType.DATE]: new DateFormatter(),
    [FormatterType.PAYEE]: new PayeeFormatter(),
    [FormatterType.AMOUNT]: new AmountFormatter(),
  };

  static createFormatter<T extends FormatterType>(type: T): FormatterMap[T] {
    const formatter = FormatterFactory.formatters[type];
    if (!formatter) {
      throw new Error('Formatter type not implemented');
    }

    return formatter as FormatterMap[T];
  }
}
