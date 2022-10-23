import { Aspects, aws_ecs, aws_ecs_patterns, aws_iam, IAspect, Stack, StackProps } from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { CfnService } from 'aws-cdk-lib/aws-ecs';
import { Construct, IConstruct } from 'constructs';

class EnableExecuteCommand implements IAspect {
  public visit(node: IConstruct): void {
    if (node instanceof CfnService) {
      node.addOverride('Properties.EnableExecuteCommand', true);
    }
  }
}

export class EcsExecDemoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const vpc = new Vpc(this, 'Vpc', {
      cidr: '10.0.0.0/16',
    });

    const cluster = new aws_ecs.Cluster(this, 'cluster', {
      vpc,
      clusterName: 'cluster'
    });

    const loadBalancedFargateService = new aws_ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      'fargate',
      {
        cluster,
        desiredCount: 1,
        taskImageOptions: {
          image: aws_ecs.ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
        },
        publicLoadBalancer: true,
      }
    )

    // ECS execを有効化する
    loadBalancedFargateService.taskDefinition.taskRole.addToPrincipalPolicy(
      new aws_iam.PolicyStatement({
        actions: [
          'ssmmessages:CreateControlChannel',
          'ssmmessages:CreateDataChannel',
          'ssmmessages:OpenControlChannel',
          'ssmmessages:OpenDataChannel',
        ],
        resources: ['*'],
      }),
    );
    Aspects.of(loadBalancedFargateService).add(new EnableExecuteCommand());
  }
}
