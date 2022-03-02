import { v4 } from 'uuid'
import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'

const TABLE_NAME = process.env.TABLE_NAME;
const dbClient = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> => {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: 'Hello from DynamoDB'
  }

  const item = typeof event.body === 'object'
    ? event.body
    : JSON.parse(event.body)

  item.spaceId = v4()

  try {
    const operationResult = await dbClient.put({
      TableName: TABLE_NAME!,
      Item: item
    }).promise()

    if (!operationResult.$response.error) {
      result.body = 'Successfuly created a item with id ' + item.spaceId
    }
  } catch(err: any) {
    result.body = err.message
    result.statusCode = 500
  }

  return result
}
