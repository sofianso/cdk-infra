#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CODEPIPELINE } from "./lib/codepipeline";
import { S3 } from "./lib/s3/cdk-s3-stack";
import { EC2 } from "./lib/ec2/cdk-ec2-stack";

import { BuildConfig, IBuildConfig } from "./lib/util";

const app = new cdk.App();
// const supportedEnvironments: string[] = ["dev", "prod"];
const supportedEnvironments: string[] = ["dev"];
const env: string = app.node.tryGetContext("config");

if (!env || !supportedEnvironments.includes(env))
  throw new Error(
    "Context variable missing on CDK command. Pass in as `-c config=dev`."
  );

const defaultConfigFolderName: string = "./config";
const environmentConfigFileName: string = `${defaultConfigFolderName}/environment/${env}.yaml`;

function Main(): void {
  let configFiles: string[] = [
    `${defaultConfigFolderName}/default.yaml`,
    environmentConfigFileName,
  ];
  let Configuration: IBuildConfig = new BuildConfig().loadConfigFiles(
    configFiles
  );
  let Synthesizer = new cdk.DefaultStackSynthesizer({
    qualifier: Configuration.BootstrapQualifier,
  });

  if (env === "builder") {
    console.log(Configuration);
    // Create a codepipline stack ///
    const buildpipeline = new CODEPIPELINE(app, "app", Configuration, {
      env: {
        region: Configuration.AWSRegion,
        account: Configuration.AccountId as string,
      },
      tags: Configuration.StackTags,
      synthesizer: Synthesizer,
      stackName: Configuration.Stacks["AppStackName"],
      terminationProtection: Configuration.TerminationProtection,
    });
  } else if (env === "dev" || env === "nonprd") {
    console.log(Configuration);
    const s3bucket = new S3.Bucket(this, "website-assets", {});
    // Create a apigateway stack ///
    const apigateway = new APIGATEWAY(app, "app", Configuration, {
      env: {
        region: Configuration.AWSRegion,
        account: Configuration.AccountId as string,
      },
      tags: Configuration.StackTags,
      synthesizer: Synthesizer,
      stackName: Configuration.Stacks["AppStackName"],
      terminationProtection: Configuration.TerminationProtection,
    });
  }
}

Main();
