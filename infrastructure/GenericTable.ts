import { Stack } from 'aws-cdk-lib'
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'

export class GenericTable {

  private _table: Table;

  public constructor(
    private _name: string,
    private _primaryKey: string,
    private _stack: Stack
  ) {
    this.initialize()
  }

  private initialize () {
    this.createTable()
  }

  private createTable () {
    this._table = new Table(this._stack, this._name, {
      partitionKey: {
        name: this._primaryKey,
        type: AttributeType.STRING
      },
      tableName: this._name
    })
  }

}
