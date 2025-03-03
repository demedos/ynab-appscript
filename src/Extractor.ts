import { Config } from './Config';
import { FormatterFactory, FormatterType } from './Formatter';
import { Payee } from './types';

export abstract class BaseExtractor {
  constructor(protected content: string) {}

  abstract extractDate(): string | undefined;
  abstract extractAmount(): number | undefined;
  abstract extractPayee(): Payee | undefined;
}

class PaymentTransferExtractor extends BaseExtractor {
  extractDate(): string | undefined {
    const formatter = FormatterFactory.createFormatter(FormatterType.DATE);

    const pattern = /il (\d{2}\/\d{2}\/\d{4}) alle/i;
    const match = this.content.match(pattern);
    return match ? formatter.format(match[1]) : undefined;
  }

  extractAmount(): number | undefined {
    const formatter = FormatterFactory.createFormatter(FormatterType.AMOUNT);

    const pattern = /pagamento di \*(\d+,\d+)\* \*EUR/i;
    const match = this.content.match(pattern);
    return match ? formatter.formatOutflow(match[1]) : undefined;
  }

  extractPayee(): Payee | undefined {
    const formatter = FormatterFactory.createFormatter(FormatterType.PAYEE);

    const pattern = /presso\s\*([^\\*]+?)\*/s;
    const match = this.content.match(pattern);
    if (match) {
      const name = formatter.format(match[1]);
      return {
        name,
      };
    }

    return undefined;
  }
}

class RegularTransferExtractor extends BaseExtractor {
  extractDate(): string | undefined {
    const formatter = FormatterFactory.createFormatter(FormatterType.DATE);

    const pattern = /Data valuta \* (\d{2}\/\d{2}\/\d{4})/i;
    const match = this.content.match(pattern);
    return match ? formatter.format(match[1]) : undefined;
  }

  extractAmount(): number | undefined {
    const formatter = FormatterFactory.createFormatter(FormatterType.AMOUNT);

    const pattern = /\*Importo \*(\d+,\d+) euro\*/i;
    const match = this.content.match(pattern);
    return match ? formatter.formatOutflow(match[1]) : undefined;
  }

  extractPayee(): Payee | undefined {
    return undefined;
  }
}

class RecurringTransferExtractor extends BaseExtractor {
  extractDate(): string | undefined {
    const formatter = FormatterFactory.createFormatter(FormatterType.DATE);

    const pattern = /Data di esecuzione \* (\d{2}\/\d{2}\/\d{4})/i;
    const match = this.content.match(pattern);
    return match ? formatter.format(match[1]) : undefined;
  }

  extractAmount(): number | undefined {
    const formatter = FormatterFactory.createFormatter(FormatterType.AMOUNT);

    const pattern = /\*Importo \*(\d+,\d+) EUR\*/i;
    const match = this.content.match(pattern);
    return match ? formatter.formatOutflow(match[1]) : undefined;
  }

  extractPayee(): Payee | undefined {
    return undefined;
  }
}

class WithdrawalTransferExtractor extends BaseExtractor {
  extractDate(): string | undefined {
    const formatter = FormatterFactory.createFormatter(FormatterType.DATE);

    const pattern = /il (\d{2}\/\d{2}\/\d{4}) alle/i;
    const match = this.content.match(pattern);
    return match ? formatter.format(match[1]) : undefined;
  }

  extractAmount(): number | undefined {
    const formatter = FormatterFactory.createFormatter(FormatterType.AMOUNT);

    const pattern = /prelievo di \*(\d+,\d+)\* \*EUR/i;
    const match = this.content.match(pattern);
    return match ? formatter.formatOutflow(match[1]) : undefined;
  }

  extractPayee(): Payee | undefined {
    return {
      id: Config.CASH_ACCOUNT_TRANSFER_PAYEE_ID,
    };
  }
}

class InstantTransferExtractor extends BaseExtractor {
  extractDate(): string | undefined {
    const formatter = FormatterFactory.createFormatter(FormatterType.DATE);

    const pattern = /Data di esecuzione \* (\d{2}\/\d{2}\/\d{4})/i;
    const match = this.content.match(pattern);
    return match ? formatter.format(match[1]) : undefined;
  }

  extractAmount(): number | undefined {
    const formatter = FormatterFactory.createFormatter(FormatterType.AMOUNT);

    const pattern = /\*Importo \* (\d+(?:\.\d+)*,\d+) EUR \*/i;
    const match = this.content.match(pattern);
    return match ? formatter.formatOutflow(match[1]) : undefined;
  }

  extractPayee(): Payee | undefined {
    return undefined;
  }
}

class CBillTransferExtractor extends BaseExtractor {
  extractDate(): string | undefined {
    const formatter = FormatterFactory.createFormatter(FormatterType.DATE);

    const pattern =
      /Data di esecuzione del pagamento \* (\d{2}\/\d{2}\/\d{4})/i;
    const match = this.content.match(pattern);
    return match ? formatter.format(match[1]) : undefined;
  }

  extractAmount(): number | undefined {
    const formatter = FormatterFactory.createFormatter(FormatterType.AMOUNT);

    const pattern = /\*Importo totale \* (\d+,\d+) EUR \*/i;
    const match = this.content.match(pattern);
    return match ? formatter.formatOutflow(match[1]) : undefined;
  }

  extractPayee(): Payee | undefined {
    return undefined;
  }
}

class CreditTransferExtractor extends BaseExtractor {
  extractDate(): string | undefined {
    const formatter = FormatterFactory.createFormatter(FormatterType.DATE);

    const pattern = /il (\d{2}\/\d{2}\/\d{4}) hai ricevuto/i;
    const match = this.content.match(pattern);
    return match ? formatter.format(match[1]) : undefined;
  }

  extractAmount(): number | undefined {
    const formatter = FormatterFactory.createFormatter(FormatterType.AMOUNT);

    const pattern = /un accredito di \*(\d+,\d+)\* \*EUR/i;
    const match = this.content.match(pattern);
    return match ? formatter.format(match[1]) : undefined;
  }

  extractPayee(): Payee | undefined {
    return undefined;
  }
}

class SalaryTransferExtractor extends BaseExtractor {
  extractDate(): string | undefined {
    const formatter = FormatterFactory.createFormatter(FormatterType.DATE);

    const pattern = /il (\d{2}\/\d{2}\/\d{4}) hai ricevuto/i;
    const match = this.content.match(pattern);
    return match ? formatter.format(match[1]) : undefined;
  }

  extractAmount(): number | undefined {
    return 0;
  }

  extractPayee(): Payee | undefined {
    return undefined;
  }
}

export enum ExtractorType {
  CBILL,
  CREDIT,
  SALARY,
  PAYMENT,
  REGULAR,
  INSTANT,
  RECURRING,
  WITHDRAWAL,
}

type ExtractorMap = {
  [ExtractorType.CBILL]: (content: string) => CBillTransferExtractor;
  [ExtractorType.CREDIT]: (content: string) => CreditTransferExtractor;
  [ExtractorType.SALARY]: (content: string) => SalaryTransferExtractor;
  [ExtractorType.INSTANT]: (content: string) => InstantTransferExtractor;
  [ExtractorType.PAYMENT]: (content: string) => PaymentTransferExtractor;
  [ExtractorType.REGULAR]: (content: string) => RegularTransferExtractor;
  [ExtractorType.RECURRING]: (content: string) => RecurringTransferExtractor;
  [ExtractorType.WITHDRAWAL]: (content: string) => WithdrawalTransferExtractor;
};

export class ExtractorFactory {
  private static extractors: ExtractorMap = {
    [ExtractorType.CBILL]: (content: string) =>
      new CBillTransferExtractor(content),
    [ExtractorType.INSTANT]: (content: string) =>
      new InstantTransferExtractor(content),
    [ExtractorType.PAYMENT]: (content: string) =>
      new PaymentTransferExtractor(content),
    [ExtractorType.REGULAR]: (content: string) =>
      new RegularTransferExtractor(content),
    [ExtractorType.WITHDRAWAL]: (content: string) =>
      new WithdrawalTransferExtractor(content),
    [ExtractorType.CREDIT]: (content: string) =>
      new CreditTransferExtractor(content),
    [ExtractorType.SALARY]: (content: string) =>
      new SalaryTransferExtractor(content),
    [ExtractorType.RECURRING]: (content: string) =>
      new RecurringTransferExtractor(content),
  };

  private static isWithdrawalTransfer(content: string): boolean {
    const pattern = /prelievo di \*(\d+,\d+)\* \*EUR/i;
    return pattern.test(content);
  }

  private static isPaymentTransfer(content: string): boolean {
    const pattern = /pagamento di \*(\d+,\d+)\* \*EUR/i;
    return pattern.test(content);
  }

  private static isRegularTransfer(content: string): boolean {
    const pattern = /hai inserito un bonifico dal tuo conto/i;
    return pattern.test(content);
  }

  private static isRecurringTransfer(content: string): boolean {
    const pattern = /Il bonifico richiestoè andato a buon fine/i;
    return pattern.test(content);
  }

  private static isInstantTransfer(content: string): boolean {
    const pattern = /bonifico istantaneo richiesto è andato a buon fine/i;
    return pattern.test(content);
  }

  private static isCreditTransfer(content: string): boolean {
    const pattern = /hai ricevuto sul tuo conto illimity un accredito/i;
    return pattern.test(content);
  }

  private static isSalaryTransfer(content: string): boolean {
    const pattern = /hai ricevuto l.*accredito dello stipendio/i;
    return pattern.test(content);
  }

  private static isCBillTransfer(content: string): boolean {
    const pattern = /Il pagamento del bollettinoè andato a buon fine/i;
    return pattern.test(content);
  }

  private static getExtractorType(content: string): ExtractorType {
    const isWithdrawal = this.isWithdrawalTransfer(content);
    if (isWithdrawal) {
      return ExtractorType.WITHDRAWAL;
    }

    const isInstantTransfer = this.isInstantTransfer(content);
    if (isInstantTransfer) {
      return ExtractorType.INSTANT;
    }

    const isPaymentTransfer = this.isPaymentTransfer(content);
    if (isPaymentTransfer) {
      return ExtractorType.PAYMENT;
    }

    const isRegularTransfer = this.isRegularTransfer(content);
    if (isRegularTransfer) {
      return ExtractorType.REGULAR;
    }

    const isRecurringTransfer = this.isRecurringTransfer(content);
    if (isRecurringTransfer) {
      return ExtractorType.RECURRING;
    }

    const isCreditTransfer = this.isCreditTransfer(content);
    if (isCreditTransfer) {
      return ExtractorType.CREDIT;
    }

    const isSalaryTransfer = this.isSalaryTransfer(content);
    if (isSalaryTransfer) {
      return ExtractorType.SALARY;
    }

    const isCBillTransfer = this.isCBillTransfer(content);
    if (isCBillTransfer) {
      return ExtractorType.CBILL;
    }

    throw new Error('Unable to determine extractor type');
  }

  static createExtractor(content: string): BaseExtractor {
    const type = this.getExtractorType(content);
    const extractorFactory = ExtractorFactory.extractors[type];

    return extractorFactory(content);
  }
}
