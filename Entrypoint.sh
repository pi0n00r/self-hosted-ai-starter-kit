#!/bin/bash
# Source oneAPI environment variables before starting ollama.
# /etc/profile.d/oneapi.sh is only executed by interactive login shells
# and is not sourced by Docker CMD — this entrypoint bridges that gap.
if [ -f /opt/intel/oneapi/setvars.sh ]; then
    source /opt/intel/oneapi/setvars.sh --force
fi

exec "$@"
