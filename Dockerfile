FROM python:3.8

RUN apt-get update && apt-get install jq -y && pip install awscli aws-cdk-lib
# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get install --yes nodejs
# Install CDK
RUN npm install -g aws-cdk