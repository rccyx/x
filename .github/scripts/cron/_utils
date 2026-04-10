#!/bin/bash
set -euo pipefail

require_env() {
  local var="$1"
  if [[ -z "${!var:-}" ]]; then
    echo "::error::Missing required environment variable: $var"
    exit 1
  fi
}

