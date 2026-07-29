#
# OTMC License.
# Copyright (c) 2026 OTMC Softwares. All rights reserved.
# Contributors: Trung Ng, OTMC Authors.
#

param(
    [Alias('s')]
    [switch]$Server
)

try {
if ($Server) {
    try {
    # Start testing
    Write-Host "Starting testing server ..." -ForegroundColor Green
    node examples/server.js
    } catch {
        Write-Host "Failed to start testing server" -ForegroundColor Red
        exit 1
    }
} else {
    # Run tests
    cd examples
    Write-Host "Running tests ..." -ForegroundColor Green
    npm run test:api
}
}
finally {
    Set-Location $PSScriptRoot
}

