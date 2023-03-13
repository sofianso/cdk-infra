import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { IpAddresses } from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam"; // import iam library for permissions
import { Construct } from "constructs";
import { readFileSync } from "fs";

export class CdkEc2stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Get the default VPC. This is the network where your instance will be provisioned
    // All activated regions in AWS have a default vpc.
    // You can create your own of course as well. https://aws.amazon.com/vpc/
    const sofianVpc = new ec2.Vpc(this, "Sofian-Vpc", {
      ipAddresses: IpAddresses.cidr("10.0.0.0/16"),
      natGateways: 0,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      vpcName: "my-super-vpc",
      subnetConfiguration: [
        { name: "public", cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC },
      ],
    });

    // Lets create a role for the instance
    // You can attach permissions to a role and determine what your
    // instance can or can not do
    const webserverRole = new iam.Role(this, "webserver-role", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
    });
    // lets create a security group for our instance
    // A security group acts as a virtual firewall for your instance to control inbound and outbound traffic.
    const securityGroup = new ec2.SecurityGroup(this, "simple-instance-1-sg", {
      vpc: sofianVpc,
      allowAllOutbound: true, // will let your instance send outboud traffic
      securityGroupName: "web-server-sg",
    });

    // lets use the security group to allow inbound traffic on specific ports
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "Allows SSH access from Internet"
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "Allows HTTP access from Internet"
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      "Allows HTTPS access from Internet"
    );

    // Finally lets provision our ec2 instance
    const ec2Instance = new ec2.Instance(this, "ec2-instance", {
      vpc: sofianVpc,
      role: webserverRole,
      securityGroup: securityGroup,
      instanceName: "frontend",
      instanceType: ec2.InstanceType.of(
        // t2.micro has free tier usage in aws
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),

      keyName: "sofian-cdk-key", // we will create this in the console before we deploy
    });

    const userDataScript = readFileSync("./lib/ec2/user-data.sh", "utf8");
    // 👇 add user data to the EC2 instance
    ec2Instance.addUserData(userDataScript);

    // cdk lets us output prperties of the resources we create after they are created
    // we want the ip address of this new instance so we can ssh into it later
    new cdk.CfnOutput(this, "output-ec2", {
      value: ec2Instance.instancePublicIp,
    });
  }
}
