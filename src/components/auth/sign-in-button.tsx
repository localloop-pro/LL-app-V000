"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "@/lib/auth-client";

export function SignInButton() {
  const { data: session, isPending } = useSession();
  const [isStartingAuth, setIsStartingAuth] = useState(false);

  if (isPending) {
    return <Button disabled>Loading...</Button>;
  }

  if (session) {
    return null;
  }

  return (
    <Button
      disabled={isStartingAuth}
      onClick={async () => {
        setIsStartingAuth(true);
        try {
          // First-time Google OAuth acts as "sign up"; returning users are "sign in".
          const result = await signIn.social({
            provider: "google",
            callbackURL: "/dashboard",
          });

          // If Better Auth returns an error instead of redirecting, surface it for debugging.
          // (This often happens when the auth client baseURL/origin is misconfigured.)
          if (result && typeof result === "object" && "error" in result && result.error) {
            console.error("Auth error starting Google OAuth:", result.error);
          }
        } catch (e) {
          console.error("Auth error starting Google OAuth:", e);
          setIsStartingAuth(false);
        }
      }}
    >
      {isStartingAuth ? "Opening Google..." : "Sign in"}
    </Button>
  );
}
