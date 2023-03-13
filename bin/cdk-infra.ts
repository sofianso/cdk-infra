#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkS3Stack } from "../lib/s3/cdk-s3-stack";
import { CdkEc2stack } from "../lib/ec2/cdk-ec2-stack";

const app = new cdk.App();
// You can create stack no 2 with the line below
new CdkS3Stack(app, "S3", {});
new CdkEc2stack(app, "EC2", {});
