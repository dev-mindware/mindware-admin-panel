import { redirect } from "next/navigation";

export default function NewDocumentRedirect() {
  redirect("/documents/proposal/add");
}
