export class IdGen {
  private static index = 0;

  static generateId(prefix: string): string {
    this.index++;

    return prefix + "-" + this.index;
  }
}
