import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { join } from 'path'
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { GenericTable } from './GenericTable'

export class SpaceStack extends Stack {

  private api = new RestApi(this, 'SpaceApi')
  // private spacesTable = new GenericTable('SpacesTable', 'spaceId', this)
  private spacesTable = new GenericTable(this, {
    tableName: 'SpacesTable',
    primaryKey: 'spaceId',
    createLambdaPath: 'Create'
  })

  constructor (scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    const helloLambdaNodeJs = new NodejsFunction(this, 'helloLambdaNodeJs', {
      entry: join(__dirname, '..', 'services', 'node-lambda', 'hello.ts'),
      handler: 'handler'
    })

    const s3ListPolicy = new PolicyStatement()
    s3ListPolicy.addActions('s3:ListAllMyBuckets')
    s3ListPolicy.addResources('*')
    helloLambdaNodeJs.addToRolePolicy(s3ListPolicy)

    const helloLambdaNodeJsIntegration = new LambdaIntegration(helloLambdaNodeJs)
    const helloLambdaNodeJsResource = this.api.root.addResource('helloNodeJs')
    helloLambdaNodeJsResource.addMethod('Get', helloLambdaNodeJsIntegration)

    const spaceResource = this.api.root.addResource('spaces')
    spaceResource.addMethod('POST', this.spacesTable.createLambdaIntegration)
  }

}
