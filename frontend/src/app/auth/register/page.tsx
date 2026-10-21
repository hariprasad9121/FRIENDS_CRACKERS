import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md px-4 py-12">
      <AuthForm mode="register" />
    </div>
  );
}
