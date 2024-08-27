const scriptProperties = PropertiesService.getScriptProperties();
const BASE_YNAB_API_URL = 'https://api.ynab.com/v1';

// Map to keep track of occurrences for each unique (date, amount) pair
const occurrenceMap = new Map<string, number>();

function getYNABHttpClient() {
  const ynabApiToken = getScriptProperty('YNAB_API_TOKEN');
  const authHeaders: GoogleAppsScript.URL_Fetch.HttpHeaders = {
    Authorization: `Bearer ${ynabApiToken}`,
    'Content-Type': 'application/json',
  };

  return {
    get: (url: string) => {
      return UrlFetchApp.fetch(`${BASE_YNAB_API_URL}/${url}`, {
        method: 'get',
        headers: authHeaders,
      });
    },
    post: (url: string, payload: object | string) => {
      return UrlFetchApp.fetch(`${BASE_YNAB_API_URL}/${url}`, {
        method: 'post',
        headers: authHeaders,
        contentType: 'application/json',
        payload: payload,
      });
    },
  };
}

const ynabHttpClient = getYNABHttpClient();

function getScriptProperty(name: string): string {
  return scriptProperties.getProperty(name) || '';
}

const GMAIL_LABEL_NAME = getScriptProperty('GMAIL_LABEL_NAME');
const YNAB_BUDGET_ID = getScriptProperty('YNAB_BUDGET_ID');
const YNAB_BUDGET_ACCOUNT_ID = getScriptProperty('YNAB_BUDGET_ACCOUNT_ID');
const CASH_ACCOUNT_TRANSFER_PAYEE_ID = getScriptProperty(
  'CASH_ACCOUNT_TRANSFER_PAYEE_ID'
);

type TransactionPayload = ReturnType<typeof createTransactionPayload>;

type Payee = {
  name: string;
  id: string;
};

// This is the script entry point
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseIllimityEmails() {
  // Access Gmail and fetch labeled emails
  const label = GmailApp.getUserLabelByName(GMAIL_LABEL_NAME);
  const threads = label.getThreads();

  if (!threads.length) {
    Logger.log('No threads to precess, aborting.');
    return;
  }

  const transactions: Array<TransactionPayload> = [];

  // Iterate through the emails in the label
  threads.forEach((thread) => {
    const messages = thread.getMessages();
    messages
      .filter((message) => !message.isInTrash())
      .forEach((message) => {
        const content = removeNewlines(message.getPlainBody());

        // Extract relevant details from the email content
        const date = extractDate(content);
        const amount = extractAmount(content);
        const payee = getPayee(content);

        if (date && amount && (payee.id || payee.name)) {
          const occurrence = updateOccurrence(date, amount);

          const transaction = createTransactionPayload({
            date,
            amount,
            payeeId: payee.id,
            payeeName: payee.name,
            occurrence,
          });

          transactions.push(transaction);
        }
      });
  });

  if (!transactions.length) {
    Logger.log('No transactions to precess, aborting.');
    return;
  }

  // Call YNAB API to insert the transaction
  addTransactionsToYNAB(transactions);

  threads.forEach((thread) => {
    // Mark the email as read and trash it after processing
    thread.markRead();
    thread.moveToTrash();
  });

  Logger.log(`Processed ${transactions.length} transactions.`);
}

function updateOccurrence(date: string, amount: number) {
  const key = `${date}-${amount}`;

  // Get the current occurrence count for this (date, amount) pair
  // and update the occurrence count for this pair
  const occurrence = (occurrenceMap.get(key) || 0) + 1;
  occurrenceMap.set(key, occurrence);

  return occurrence;
}

function getPayee(content: string): Partial<Payee> {
  const isWithdrawal = getIsWithdrawal(content);

  if (isWithdrawal) {
    return {
      id: CASH_ACCOUNT_TRANSFER_PAYEE_ID,
    };
  }

  return {
    name: extractPayee(content),
  };
}

function removeNewlines(content: string) {
  return content.replace(/(\r\n|\n|\r)/gm, '');
}

function extractDate(content: string) {
  const datePattern = /il (\d{2}\/\d{2}\/\d{4}) alle/i;
  const match = content.match(datePattern);
  return match ? match[1] : undefined;
}

function extractAmount(content: string) {
  const amountPattern = /(?:pagamento|prelievo) di \*(\d+,\d+)\* \*EUR/i;
  const match = content.match(amountPattern);
  return match
    ? Math.round(parseFloat(match[1].replace(',', '.')) * 1000)
    : undefined; // The transaction amount in milliunits format
}

function extractPayee(content: string) {
  const payeeRegex = /presso\s\*([^\\*]+?)\*/s;
  const match = content.match(payeeRegex);
  return match ? match[1].trim() : undefined;
}

function getIsWithdrawal(content: string) {
  const payeeRegex = /prelievo di \*(\d+,\d+)\* \*EUR/i;
  const match = content.match(payeeRegex);
  return match ? !!match[1].trim() : false;
}

function addTransactionsToYNAB(transactions: TransactionPayload[]) {
  ynabHttpClient.post(
    `budgets/${YNAB_BUDGET_ID}/transactions`,
    JSON.stringify({ transactions })
  );
}

function createTransactionPayload({
  date,
  amount,
  payeeId,
  payeeName,
  occurrence = 1,
}: {
  date: string;
  amount: number;
  payeeId?: string;
  payeeName?: string;
  occurrence?: number;
}) {
  const negativeAmount = -amount; // Make it negative so it's an outflow;
  const isoDate = formatDateForYNAB(date);

  const payload = {
    account_id: YNAB_BUDGET_ACCOUNT_ID,
    date: isoDate,
    amount: negativeAmount,
    payee_id: payeeId,
    payee_name: payeeName,
    cleared: 'uncleared',
    approved: false,
    import_id: generateImportId(negativeAmount, isoDate, occurrence),
  };

  return payload;
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

function formatDateForYNAB(date: string) {
  const parts = date.split('/');
  return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert from DD/MM/YYYY to YYYY-MM-DD
}
