#!/usr/bin/env bash
# Retries terraform apply, cycling through all availability domains until capacity is found.
set -uo pipefail

cd "$(dirname "$0")"

compartment_ocid=$(awk -F'"' '/^[[:space:]]*oci_compartment_ocid[[:space:]]*=/{print $2}' terraform.tfvars)
if [[ -z "$compartment_ocid" ]]; then
  echo "Could not read oci_compartment_ocid from terraform.tfvars"
  exit 1
fi

mapfile -t ads < <(
  oci iam availability-domain list \
    --compartment-id "$compartment_ocid" \
    --query 'data[*].name' \
    --raw-output \
  | jq -r '.[]'
)

if [[ ${#ads[@]} -eq 0 ]]; then
  echo "No availability domains found"
  exit 1
fi

max_attempts=60
interval=60
output_file=$(mktemp)
trap 'rm -f "$output_file"' EXIT

success=false

echo "Found ${#ads[@]} availability domain(s). Trying up to ${max_attempts} attempts, ${interval}s apart."

print_status() {
  local attempt=$1
  local current_ad=$2

  printf "\r\033[K"
  printf "Attempt %s/%s  [" "$attempt" "$max_attempts"
  for a in "${ads[@]}"; do
    if [[ "$a" == "$current_ad" ]]; then
      printf " \033[32m%s\033[0m" "$a"
    else
      printf " %s" "$a"
    fi
  done
  printf " ]"
}

for (( i = 0; i < max_attempts; i++ )); do
  ad="${ads[$(( i % ${#ads[@]} ))]}"

  print_status "$(( i + 1 ))" "$ad"

  if terraform apply -auto-approve \
       -var "oci_availability_domain=${ad}" \
       >"$output_file" 2>&1; then
    success=true
    break
  fi

  (( i + 1 < max_attempts )) && sleep "$interval"
done

printf "\n\n"

if $success; then
  echo "Succeeded on attempt $(( i + 1 )) (availability domain: ${ad})"
else
  echo "Failed after ${max_attempts} attempts."
fi

echo ""
echo "--- Output from final attempt ---"
cat "$output_file"

if $success; then
  echo ""
  echo "--- Terraform outputs ---"
  terraform output
fi

$success
