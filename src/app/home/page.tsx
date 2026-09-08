import { redirect } from "next/navigation";

/** The reference site lives at /home; keep old links working. */
export default function HomeAlias() {
  redirect("/");
}
