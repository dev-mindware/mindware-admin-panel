import { redirect } from "next/navigation";
import { BASE_PATH } from "@/constants/routes";

export default function Home() {
  redirect(`${BASE_PATH}/dashboard`);
}
