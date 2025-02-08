import { Config as MockConfig } from './__mocks__/Config';
import { ExtractorFactory } from './Extractor';

jest.mock('./Config');

describe('Extractors', () => {
  describe('PaymentTransferExtractor', () => {
    const sampleContent = `
      il 15/03/2024 alle 14:30 hai effettuato un pagamento di *50,00* *EUR presso *AMAZON EU S.A R.L*
    `;

    const extractor = ExtractorFactory.createExtractor(sampleContent);

    it('should extract date correctly', () => {
      expect(extractor.extractDate()).toBe('2024-03-15');
    });

    it('should extract amount correctly', () => {
      expect(extractor.extractAmount()).toBe(-50_000);
    });

    it('should extract payee correctly', () => {
      expect(extractor.extractPayee()).toEqual({
        name: 'AMAZON EU S.A R.L',
      });
    });
  });

  describe('WithdrawalTransferExtractor', () => {
    const sampleContent = `
      il 16/03/2024 alle 10:15 hai effettuato un prelievo di *100,00* *EUR
    `;

    const extractor = ExtractorFactory.createExtractor(sampleContent);

    it('should extract date correctly', () => {
      expect(extractor.extractDate()).toBe('2024-03-16');
    });

    it('should extract amount correctly', () => {
      expect(extractor.extractAmount()).toBe(-100_000);
    });

    it('should extract payee with cash account ID', () => {
      expect(extractor.extractPayee()).toEqual({
        id: MockConfig.CASH_ACCOUNT_TRANSFER_PAYEE_ID,
      });
    });
  });

  describe('RegularTransferExtractor', () => {
    const sampleContent = `
      hai inserito un bonifico dal tuo conto
      Data valuta * 17/03/2024
      *Importo *200,00 euro*
    `;

    const extractor = ExtractorFactory.createExtractor(sampleContent);

    it('should extract date correctly', () => {
      expect(extractor.extractDate()).toBe('2024-03-17');
    });

    it('should extract amount correctly', () => {
      expect(extractor.extractAmount()).toBe(-200_000);
    });

    it('should return undefined for payee', () => {
      expect(extractor.extractPayee()).toBeUndefined();
    });
  });

  describe('CreditTransferExtractor', () => {
    const sampleContent = `
      il 18/03/2024 hai ricevuto sul tuo conto illimity un accredito di *300,00* *EUR
    `;

    const extractor = ExtractorFactory.createExtractor(sampleContent);

    it('should extract date correctly', () => {
      expect(extractor.extractDate()).toBe('2024-03-18');
    });

    it('should extract amount correctly', () => {
      expect(extractor.extractAmount()).toBe(300_000);
    });

    it('should return undefined for payee', () => {
      expect(extractor.extractPayee()).toBeUndefined();
    });
  });

  describe('CBillTransferExtractor', () => {
    const sampleContent = `
      Il pagamento del bollettinoè andato a buon fine
      Data di esecuzione del pagamento * 19/03/2024
      *Importo totale * 75,50 EUR *
    `;

    const extractor = ExtractorFactory.createExtractor(sampleContent);

    it('should extract date correctly', () => {
      expect(extractor.extractDate()).toBe('2024-03-19');
    });

    it('should extract amount correctly', () => {
      expect(extractor.extractAmount()).toBe(-75_500);
    });

    it('should return undefined for payee', () => {
      expect(extractor.extractPayee()).toBeUndefined();
    });
  });

  describe('InstantTransferExtractor', () => {
    const sampleContent = `
      bonifico istantaneo richiesto è andato a buon fine
      Data di esecuzione * 20/03/2024
      *Importo * 150,00 EUR *
    `;

    const extractor = ExtractorFactory.createExtractor(sampleContent);

    it('should extract date correctly', () => {
      expect(extractor.extractDate()).toBe('2024-03-20');
    });

    it('should extract amount correctly', () => {
      expect(extractor.extractAmount()).toBe(-150_000);
    });

    it('should return undefined for payee', () => {
      expect(extractor.extractPayee()).toBeUndefined();
    });

    it('should extract amounts with dots as thousand separators', () => {
      const sampleContent = `
        bonifico istantaneo richiesto è andato a buon fine
        Data di esecuzione * 20/03/2024
        *Importo * 1.500,00 EUR *
      `;

      const extractor = ExtractorFactory.createExtractor(sampleContent);
      expect(extractor.extractAmount()).toBe(-1_500_000);
    });

    it('should extract amounts with dots as millions separators', () => {
      const sampleContent = `
        bonifico istantaneo richiesto è andato a buon fine
        Data di esecuzione * 20/03/2024
        *Importo * 1.500.000,00 EUR *
      `;

      const extractor = ExtractorFactory.createExtractor(sampleContent);
      expect(extractor.extractAmount()).toBe(-1_500_000_000);
    });
  });

  describe('SalaryTransferExtractor', () => {
    const sampleContent = `
      il 21/03/2024 hai ricevuto l'accredito dello stipendio
    `;

    const extractor = ExtractorFactory.createExtractor(sampleContent);

    it('should extract date correctly', () => {
      expect(extractor.extractDate()).toBe('2024-03-21');
    });

    it('should return 0 for amount', () => {
      expect(extractor.extractAmount()).toBe(0);
    });

    it('should return undefined for payee', () => {
      expect(extractor.extractPayee()).toBeUndefined();
    });
  });

  describe('RecurringTransferExtractor', () => {
    const sampleContent = `
      Il bonifico richiestoè andato a buon fine
      Data di esecuzione * 22/03/2024
      *Importo *250,00 EUR*
    `;

    const extractor = ExtractorFactory.createExtractor(sampleContent);

    it('should extract date correctly', () => {
      expect(extractor.extractDate()).toBe('2024-03-22');
    });

    it('should extract amount correctly', () => {
      expect(extractor.extractAmount()).toBe(-250_000);
    });

    it('should return undefined for payee', () => {
      expect(extractor.extractPayee()).toBeUndefined();
    });
  });

  describe('ExtractorFactory', () => {
    it('should throw error for unknown content', () => {
      const invalidContent = 'This is some invalid content';
      expect(() => {
        ExtractorFactory.createExtractor(invalidContent);
      }).toThrow('Unable to determine extractor type');
    });
  });
});
