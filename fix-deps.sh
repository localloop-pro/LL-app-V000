#!/usr/bin/env bash
set -euo pipefail

echo "🎯 Stubbing missing modules…"

# 1️⃣ List out all of the aliases you saw errors for
declare -a MISSING=(
  "src/components/star.tsx"
  "src/components/ui/select.tsx"
  "src/components/ui/tabs.tsx"
  "src/components/ui/use-toast.tsx"
  "src/hooks/use-toast.ts"
)

for path in "${MISSING[@]}"; do
  if [[ ! -f "$path" ]]; then
    echo "  ✏️  Creating stub: $path"
    mkdir -p "$(dirname "$path")"
    name="$(basename "$path" .tsx)"
    # Capitalize first letter for component name
    capitalized_name="$(echo "$name" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')"
    cat >"$path" <<EOL
// AUTO-GENERATED stub
export function ${capitalized_name}() {
  return null
}
EOL
  else
    echo "  ✔ $path exists"
  fi
done

echo
echo "🧹 Removing unwanted telemetry/font imports…"

# 2️⃣ Delete any lines importing those two packages
grep -RIl "@vercel/analytics\|geist/font" src/ \
  | xargs -r sed -i '' '/@vercel\/analytics/d; /geist\/font/d'

echo
echo "✅ Done. Now rebuild:"

# 3️⃣ Rebuild
pnpm run build