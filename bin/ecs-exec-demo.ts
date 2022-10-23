#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EcsExecDemoStack } from '../lib/ecs-exec-demo-stack';

const app = new cdk.App();
new EcsExecDemoStack(app, 'EcsExecDemoStack', {});