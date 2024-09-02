export class OccurrenceTracker {
  private occurrenceMap = new Map<string, number>();

  private generateKey(date: string, amount: number): string {
    return `${date}-${amount}`;
  }

  private getOccurrence(date: string, amount: number): number {
    const key = this.generateKey(date, amount);

    return this.occurrenceMap.get(key) || 0;
  }

  /**
   * Track and return the occurrence count for a given date and amount.
   */
  track(date: string, amount: number): number {
    const key = this.generateKey(date, amount);
    const newOccurrence = this.getOccurrence(date, amount) + 1;
    this.occurrenceMap.set(key, newOccurrence);

    return newOccurrence;
  }
}
