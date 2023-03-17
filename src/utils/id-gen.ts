export class IdGen {
  private static index = 0;

  static generateId(prefix: string): string {
    return prefix + "-" + ++this.index;
  }
}
