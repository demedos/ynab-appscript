export class Config {
  static get(name: string): string {
    return name + '-test-value';
  }

  static readonly GMAIL_LABEL_NAME = 'gmail-label-name';
  static readonly YNAB_BUDGET_ID = 'ynab-budget-id';
  static readonly YNAB_BUDGET_ACCOUNT_ID = 'ynab-budget-account-id';
  static readonly CASH_ACCOUNT_TRANSFER_PAYEE_ID =
    'cash-account-transfer-payee-id';
  static readonly YNAB_API_TOKEN = 'ynab-api-token';
  static readonly BASE_YNAB_API_URL = 'base-ynab-api-url';
}
