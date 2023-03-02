import * as cdk from "aws-cdk-lib";
import * as dynamodb from "@aws-sdk/client-dynamodb";
import { Construct } from "constructs";

export class CdkInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new dynamodb.Table(this, "MyTable", {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "name",
        type: dynamodb.AttributeType.STRING,
      },
    });
  }
}
