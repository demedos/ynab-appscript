import { Config } from './Config';

export class YNABHttpClient {
  private static readonly authHeaders: GoogleAppsScript.URL_Fetch.HttpHeaders =
    {
      Authorization: `Bearer ${Config.YNAB_API_TOKEN}`,
      'Content-Type': 'application/json',
    };

  static get(url: string): GoogleAppsScript.URL_Fetch.HTTPResponse {
    return UrlFetchApp.fetch(`${Config.BASE_YNAB_API_URL}/${url}`, {
      method: 'get',
      headers: this.authHeaders,
    });
  }

  static post(
    url: string,
    payload: object | string
  ): GoogleAppsScript.URL_Fetch.HTTPResponse {
    return UrlFetchApp.fetch(`${Config.BASE_YNAB_API_URL}/${url}`, {
      method: 'post',
      headers: this.authHeaders,
      contentType: 'application/json',
      payload: JSON.stringify(payload),
    });
  }
}
