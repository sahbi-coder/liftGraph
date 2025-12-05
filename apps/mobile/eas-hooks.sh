#!/bin/bash
set -euo pipefail

# For file environment variables, EAS makes them available as files
# The file path is stored in the environment variable
if [ -n "${GOOGLE_SERVICES_JSON:-}" ] && [ -f "${GOOGLE_SERVICES_JSON:-}" ]; then
  cp "$GOOGLE_SERVICES_JSON" google-services.json
  echo "✓ Copied google-services.json from file environment variable"
elif [ -n "${GOOGLE_SERVICES_JSON:-}" ]; then
  # If it's the content as a string (fallback)
  echo "$GOOGLE_SERVICES_JSON" > google-services.json
  echo "✓ Copied google-services.json from environment variable content"
fi

# Handle iOS GoogleService-Info.plist if needed
if [ -n "${GOOGLE_SERVICE_INFO_PLIST:-}" ] && [ -f "${GOOGLE_SERVICE_INFO_PLIST:-}" ]; then
  cp "$GOOGLE_SERVICE_INFO_PLIST" GoogleService-Info.plist
  echo "✓ Copied GoogleService-Info.plist from file environment variable"
elif [ -n "${GOOGLE_SERVICE_INFO_PLIST:-}" ]; then
  echo "$GOOGLE_SERVICE_INFO_PLIST" > GoogleService-Info.plist
  echo "✓ Copied GoogleService-Info.plist from environment variable content"
fi

