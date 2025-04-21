# Create file called .integration-test-env and define the following variables
# export POSTMAN_API_KEY='your-api-key'
# export POSTMAN_COLLECTION='your-collection'

$envFile = ".env.integration-test"

if (Test-Path .env.integration-test) {
    Get-Content .env.integration-test | ForEach-Object {
        if ($_ -match "^(?<key>[^=]+)=(?<value>.+)$") {
            [System.Environment]::SetEnvironmentVariable($matches.key, $matches.value, [System.EnvironmentVariableTarget]::Process)
        }
    }
}
else {
    Write-Error "Error: .env.integration-test file not found."
    exit 1
}

if (-not (Get-Command postman -ErrorAction SilentlyContinue)) {
    Write-Error "Postman is not installed."
    exit 1
}

if (-not (Test-Path $envFile)) {
    Write-Error "Error: $envFile does not exist."
    exit 1
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match 'export (\w+)=(.+)') {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2].Trim("'"))
    }
}

if (-not $env:POSTMAN_API_KEY -or -not $env:POSTMAN_COLLECTION -or -not $env:POSTMAN_ENV) {
    Write-Error "Error: Environment variables POSTMAN_API_KEY, POSTMAN_COLLECTION, and/or POSTMAN_ENV are not set."
    exit 1
}

postman login --with-api-key $env:POSTMAN_API_KEY
postman collection run $env:POSTMAN_COLLECTION --environment $env:POSTMAN_ENV --reporters cli


