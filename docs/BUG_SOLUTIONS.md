# Bug Solutions

## OpenRouter 401: "User not found." (Chat not working)

**Symptoms**

- Chat UI shows `Error: User not found.`
- Server logs show something like:
  - `AI_APICallError` with `statusCode: 401`
  - `responseBody: {"error":{"message":"User not found.","code":401}}`

**Root cause**

- OpenRouter could not authenticate the request because `OPENROUTER_API_KEY` is **missing, invalid, or a placeholder**.

**Fix**

- Put a real OpenRouter key into your local `.env` file:
  - `OPENROUTER_API_KEY=sk-or-v1-...`
- Restart the dev server so Next.js reloads environment variables.

**Notes**

- OpenRouter keys typically start with `sk-or-v1-`.
- Placeholder values like `sk-or-v1-your-key` will fail with the same 401 error.








