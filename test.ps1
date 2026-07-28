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
    cd examples
    npx json-server --watch db.json --port 3000
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
catch {
    Set-Location $PSScriptRoot
}

