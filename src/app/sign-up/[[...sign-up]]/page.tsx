import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-6">
      <SignUp />
    </div>
  );
}
