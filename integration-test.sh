#!/bin/bash

# Check if required environment variables are set
if [[ -z "$POSTMAN_API_KEY" || -z "$POSTMAN_COLLECTION" || -z "$POSTMAN_ENV" ]]; then
    echo "Error: Environment variables POSTMAN_API_KEY, POSTMAN_COLLECTION, and/or POSTMAN_ENV are not set." >&2
    exit 1
fi

# Log in to Postman CLI
postman login --with-api-key "$POSTMAN_API_KEY"

# Run the specified collection
postman collection run "$POSTMAN_COLLECTION" --environment "$POSTMAN_ENV" --reporters cli
