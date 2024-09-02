export enum ConfigKey {
  YNAB_API_TOKEN,
  YNAB_BUDGET_ID,
  GMAIL_LABEL_NAME,
  YNAB_BUDGET_ACCOUNT_ID,
  CASH_ACCOUNT_TRANSFER_PAYEE_ID,
}

export class Config {
  static get(name: ConfigKey): string {
    return (
      PropertiesService.getScriptProperties().getProperty(ConfigKey[name]) || ''
    );
  }

  static readonly GMAIL_LABEL_NAME = Config.get(ConfigKey.GMAIL_LABEL_NAME);
  static readonly YNAB_BUDGET_ID = Config.get(ConfigKey.YNAB_BUDGET_ID);
  static readonly YNAB_BUDGET_ACCOUNT_ID = Config.get(
    ConfigKey.YNAB_BUDGET_ACCOUNT_ID
  );
  static readonly CASH_ACCOUNT_TRANSFER_PAYEE_ID = Config.get(
    ConfigKey.CASH_ACCOUNT_TRANSFER_PAYEE_ID
  );
  static readonly YNAB_API_TOKEN = Config.get(ConfigKey.YNAB_API_TOKEN);
  static readonly BASE_YNAB_API_URL = 'https://api.ynab.com/v1';
}
