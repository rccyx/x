import type { Optional } from "typyx";

const OPTIONAL_PROTOCOL_URL_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?([^/]+)(?:\/.*)?$/;

export class NamesService {
  public static getSiteName({ url }: { url: string }): Optional<string> {
    const match = OPTIONAL_PROTOCOL_URL_REGEX.exec(url);
    if (match) {
      const parts = match[1]?.split(".");
      if (!parts) {
        return null;
      }
      const tld = parts.pop();
      const domain = parts.join(".");
      if (!domain || !tld) {
        return null;
      }
      return domain + "." + tld;
    } else {
      return null;
    }
  }
}
