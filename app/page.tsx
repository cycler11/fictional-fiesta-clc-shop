import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-helpers"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    if (user.role === "operator") {
      redirect("/admin")
    } else {
      redirect("/dashboard")
    }
  } else {
    redirect("/login")
  }
}
