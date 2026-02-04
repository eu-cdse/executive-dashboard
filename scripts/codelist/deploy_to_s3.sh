#!/bin/bash

set -e
set -x


echo "Generating Codelist..."
node generate/generateSatProductCL.js

echo "Building docker image..."
docker build -t my-python-app .

echo "Uploading to cf..."
docker run --rm my-python-app
