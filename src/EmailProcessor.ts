import { ExtractorFactory } from './Extractor';
import { Payee } from './types';

type EmailPayload = {
  date: string | undefined;
  amount: number | undefined;
  payee: Payee | undefined;
};

export class EmailProcessor {
  private content: string;

  constructor(content: string) {
    this.content = content;
  }

  process(): EmailPayload {
    try {
      const extractor = ExtractorFactory.createExtractor(this.content);

      const date = extractor.extractDate();
      const amount = extractor.extractAmount();
      const payee = extractor.extractPayee();

      return {
        date,
        amount,
        payee,
      };
    } catch (error) {
      Logger.log('Error processing email:', error);
      return {
        date: undefined,
        amount: undefined,
        payee: undefined,
      };
    }
  }
}
