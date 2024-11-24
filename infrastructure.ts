import { App, Duration, Stack, StackProps } from "aws-cdk-lib";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { CachePolicy, Distribution } from "aws-cdk-lib/aws-cloudfront";
import { FunctionUrlOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { FunctionUrlAuthType, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";

const { HOSTED_ZONE_ID, HOSTED_ZONE_NAME, DOMAIN_NAME } = process.env;

export class ShuffleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const handler = new NodejsFunction(this, "Lambda", {
      entry: "src/aws/lambda.ts",
      runtime: Runtime.NODEJS_22_X,
      memorySize: 1024,
    });

    const fnUrl = handler.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: HOSTED_ZONE_ID!,
      zoneName: HOSTED_ZONE_NAME!,
    });

    const domainName = DOMAIN_NAME!;

    const certificate = new DnsValidatedCertificate(this, "Certificate", {
      domainName,
      hostedZone,
      region: "us-east-1",
    });

    const cdn = new Distribution(this, "Cdn", {
      certificate,
      domainNames: [domainName],
      defaultBehavior: {
        origin: new FunctionUrlOrigin(fnUrl),
        cachePolicy: new CachePolicy(this, "CachePolicy", {
          enableAcceptEncodingBrotli: true,
          enableAcceptEncodingGzip: true,
          minTtl: Duration.seconds(10),
          maxTtl: Duration.seconds(60),
        }),
      },
    });

    new ARecord(this, "DnsRecord", {
      zone: hostedZone,
      recordName: domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cdn)),
    });
  }
}

const app = new App();
new ShuffleStack(app, "ShuffleStack", { env: { region: "eu-central-1" } });
