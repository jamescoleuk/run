import { Colors } from "./deps.ts";

export const log = {
  info: (text: string) => console.log(text),
  header: (text: string) => console.log(Colors.green(text)),
  warn: (text: string) => console.warn(Colors.yellow(text)),
  error: (text: string) => console.error(Colors.red(text)),
};
