import { Config } from './Config';
import { EmailProcessor } from './EmailProcessor';
import { OccurrenceTracker } from './OccurrenceTracker';
import { YNABHttpClient } from './YNABHttpClient';

type YNABTransactionPayload = {
  account_id: string;
  date: string;
  amount: number;
  payee_id?: string;
  payee_name?: string;
  cleared?: 'cleared' | 'uncleared';
  approved?: boolean;
  import_id?: string;
};

function removeNewlines(content: string): string {
  return content.replace(/(\r\n|\n|\r)/gm, '');
}

/**
 * import_id in the format: 'YNAB:[milliunit_amount]:[iso_date]:[occurrence]'.
 * For example, a transaction dated 2015-12-30 in the amount of -$294.23 USD
 * would have an import_id of 'YNAB:-294230:2015-12-30:1'.
 */
function generateImportId(
  milliunitAmount: number,
  isoDate: string,
  occurrence: number
) {
  return `YNAB:${milliunitAmount}:${isoDate}:${occurrence}`;
}

function getTransactionsCountLabel(count: number): string {
  if (count === 1) {
    return `one transaction`;
  }

  return `${count} transactions`;
}

export function processEmails() {
  const label = GmailApp.getUserLabelByName(Config.GMAIL_LABEL_NAME);
  const threads = label.getThreads();

  if (!threads.length) {
    Logger.log('No threads to process, aborting.');
    return;
  }

  const occurrenceTracker = new OccurrenceTracker();

  for (const thread of threads) {
    const transactions: YNABTransactionPayload[] = [];
    const messages = thread.getMessages();
    let threadProcessedSuccessfully = false;

    for (const message of messages) {
      if (message.isInTrash()) continue;

      const content = removeNewlines(message.getPlainBody());

      const processor = new EmailProcessor(content);
      const { date, amount, payee } = processor.process();

      if (date && amount !== undefined) {
        const occurrence = occurrenceTracker.track(date, amount);
        transactions.push({
          account_id: Config.YNAB_BUDGET_ACCOUNT_ID,
          date,
          amount,
          payee_id: payee?.id,
          payee_name: payee?.name,
          cleared: 'uncleared',
          approved: false,
          import_id: generateImportId(amount, date, occurrence),
        });
      } else {
        Logger.log('Failed to extract some details from the content.');
      }

      message.markRead();
    }

    const transactionsCountLabel = getTransactionsCountLabel(
      transactions.length
    );

    if (transactions.length) {
      try {
        const response = YNABHttpClient.post(
          `budgets/${Config.YNAB_BUDGET_ID}/transactions`,
          { transactions }
        );

        if (response.getResponseCode() === 201) {
          Logger.log(`Successfully imported ${transactionsCountLabel}.`);
          threadProcessedSuccessfully = true;
        } else {
          Logger.log(`Failed to import ${transactionsCountLabel} into YNAB.`);
        }
      } catch (error) {
        Logger.log(
          `Error importing ${transactionsCountLabel} into YNAB: `,
          error
        );
      }
    }

    if (threadProcessedSuccessfully) {
      thread.moveToTrash();
    }
  }
}
