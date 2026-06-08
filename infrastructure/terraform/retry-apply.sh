#!/usr/bin/env bash
# Retries terraform apply, cycling through all availability domains until capacity is found.
set -uo pipefail

cd "$(dirname "$0")"

compartment_ocid=$(awk -F'"' '/oci_compartment_ocid/{print $2}' terraform.tfvars)
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

echo "Found ${#ads[@]} availability domain(s): ${ads[*]}"

max_attempts=60
interval=60
output_file=$(mktemp)
trap 'rm -f "$output_file"' EXIT

success=false

echo "Trying up to ${max_attempts} attempts, ${interval}s apart."
printf "Progress: "

for (( i = 0; i < max_attempts; i++ )); do
  ad="${ads[$(( i % ${#ads[@]} ))]}"

  if terraform apply -auto-approve \
       -var "oci_availability_domain=${ad}" \
       >"$output_file" 2>&1; then
    success=true
    break
  fi

  printf "."
  (( i + 1 < max_attempts )) && sleep "$interval"
done

if $success; then
  printf " done\n\n"
  echo "Succeeded on attempt $(( i + 1 )) (availability domain: ${ad})"
else
  printf "\n\nFailed after ${max_attempts} attempts.\n"
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
