import { getRequestConfig } from "next-intl/server";
import { defaultLocale } from "./config";
import messages from "@/messages/zh-CN.json";

export default getRequestConfig(() => ({
  locale: defaultLocale,
  messages,
}));
