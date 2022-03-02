import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'

const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;
const dbClient = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> => {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: 'Hello from DynamoDB'
  }

  try {
    if (event.pathParameters) {
      if (PRIMARY_KEY! in event.pathParameters) {
        const keyValue = event.pathParameters[PRIMARY_KEY!]
        const queryResponse = await dbClient.query({
          TableName: TABLE_NAME!,
          KeyConditionExpression: '#zz = :zzzz',
          ExpressionAttributeNames: {
            '#zz': PRIMARY_KEY!
          },
          ExpressionAttributeValues: {
            ':zzzz': keyValue
          }
        }).promise()

        result.body = JSON.stringify(queryResponse.Items)
      }
    } else {
      const queryResponse = await dbClient.scan({
        TableName: TABLE_NAME!
      }).promise()
  
      result.body = JSON.stringify(queryResponse)
    }
  } catch(err: any) {
    result.body = err.message
    result.statusCode = 500
  }

  return result
}
