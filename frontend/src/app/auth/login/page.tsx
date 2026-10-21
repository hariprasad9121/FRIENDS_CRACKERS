import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md px-4 py-12">
      <AuthForm mode="login" />
    </div>
  );
}
