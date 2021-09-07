#!/bin/bash

set -e

FLOW_ECR_REGISTRY="093652424831.dkr.ecr.eu-west-2.amazonaws.com"
BRANCH_NAME="${bamboo_planRepository_branchName}"

docker login --username AWS --password "${bamboo.custom.aws.ecr.password}" "${FLOW_ECR_REGISTRY}"

if [ "$BRANCH_NAME" = "" ]; then
  echo "No bamboo_planRepository_branchName environment variable is set" 1>&2
  exit 1
fi

if [ "$BRANCH_NAME" = "develop" ]; then
  # We're building the base branch, so we want to push the "latest" tag
  docker build -t "${FLOW_ECR_REGISTRY}"/ui-runtime:latest .
  docker push "${FLOW_ECR_REGISTRY}"/ui-runtime:latest
fi

# Replace the slashes in branch names with dashes, so we can use it as an image tag
IMAGE_TAG=$(echo "${BRANCH_NAME}" | sed -e "s/\//-/g")
IMAGE="${FLOW_ECR_REGISTRY}/ui-runtime:${IMAGE_TAG}"

# We always want to push the "branched" image tag too
docker build -t "${IMAGE}" .
docker push "${IMAGE}"
