import { Stack } from 'aws-cdk-lib'
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway'
import { join } from 'path'

export class GenericTable {

  private _table: Table;

  private _createLambda: NodejsFunction | undefined;
  private _readLambda: NodejsFunction | undefined;
  private _updateLambda: NodejsFunction | undefined;
  private _deleteLambda: NodejsFunction | undefined;

  public createLambdaIntegration: LambdaIntegration;
  public readLambdaIntegration: LambdaIntegration;
  public updateLambdaIntegration: LambdaIntegration;
  public deleteLambdaIntegration: LambdaIntegration;

  public constructor(private _stack: Stack, private _props: ITableProps) {
    this.initialize()
  }

  private initialize () {
    this.createTable()
    this.createLambdas()
    this.grantTableRights()
  }

  private createTable () {
    this._table = new Table(this._stack, this._props.tableName, {
      partitionKey: {
        name: this._props.primaryKey,
        type: AttributeType.STRING
      },
      tableName: this._props.tableName
    })
  }

  private createLambdas () {
    if (this._props.createLambdaPath) {
      this._createLambda = this.createSingleLambda(this._props.createLambdaPath)
      this.createLambdaIntegration = new LambdaIntegration(this._createLambda)
    }

    if (this._props.readLambdaPath) {
      this._readLambda = this.createSingleLambda(this._props.readLambdaPath)
      this.readLambdaIntegration = new LambdaIntegration(this._readLambda)
    }

    if (this._props.updateLambdaPath) {
      this._updateLambda = this.createSingleLambda(this._props.updateLambdaPath)
      this.updateLambdaIntegration = new LambdaIntegration(this._updateLambda)
    }

    if (this._props.deleteLambdaPath) {
      this._deleteLambda = this.createSingleLambda(this._props.deleteLambdaPath)
      this.deleteLambdaIntegration = new LambdaIntegration(this._deleteLambda)
    }
  }

  private grantTableRights () {
    if (this._createLambda) {
      this._table.grantWriteData(this._createLambda)
    }

    if (this._readLambda) {
      this._table.grantReadData(this._readLambda)
    }

    if (this._updateLambda) {
      this._table.grantWriteData(this._updateLambda)
    }

    if (this._deleteLambda) {
      this._table.grantWriteData(this._deleteLambda)
    }
  }

  private createSingleLambda (lambdaName: string): NodejsFunction {
    const lambdaId = `${this._props.tableName}-${lambdaName}`
    return new NodejsFunction(this._stack, lambdaId, {
      entry: (join(__dirname, '..', 'services', this._props.tableName, `${lambdaName}.ts`)),
      handler: 'handler',
      functionName: lambdaId,
      environment: {
        TABLE_NAME: this._props.tableName,
        PRIMARY_KEY: this._props.primaryKey
      }
    })
  }

}

export interface ITableProps {
  tableName: string,
  primaryKey: string,
  createLambdaPath?: string,
  readLambdaPath?: string,
  updateLambdaPath?: string,
  deleteLambdaPath?: string
}
