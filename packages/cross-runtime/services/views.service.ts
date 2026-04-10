export class ViewsService {
  public static formatViews(views: number): string {
    if (views < 1000) {
      return views.toString();
    }

    if (views < 1000000) {
      const thousands = views / 1000;
      return thousands % 1 === 0
        ? `${thousands.toFixed(0)}K`
        : `${thousands.toFixed(1)}K`;
    }

    if (views < 1000000000) {
      const millions = views / 1000000;
      return millions % 1 === 0
        ? `${millions.toFixed(0)}M`
        : `${millions.toFixed(1)}M`;
    }

    const billions = views / 1000000000;
    return billions % 1 === 0
      ? `${billions.toFixed(0)}B`
      : `${billions.toFixed(1)}B`;
  }
}
