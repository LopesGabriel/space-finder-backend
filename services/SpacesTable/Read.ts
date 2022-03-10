import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyEventPathParameters, APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResult, Context } from 'aws-lambda'

const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;
const dbClient = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> => {
  let result: APIGatewayProxyResult = {
    statusCode: 204,
    body: ''
  }

  try {
    if (event.pathParameters) {
      if (!(PRIMARY_KEY! in event.pathParameters)) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Missing path parameter' }) }
      }

      result = await queryWithPrimaryPartition(event.pathParameters)
    } else {
      if (!event.queryStringParameters) {
        result = { body: await scanTable(), statusCode: 200 }
        return result
      }

      result = await queryWithSecondaryPartition(event.queryStringParameters)
    }
  } catch(err: any) {
    return { statusCode: 500, body: err.message }
  }

  return result
}

const queryWithSecondaryPartition = async (queryParams: APIGatewayProxyEventQueryStringParameters): Promise<APIGatewayProxyResult> => {
  const queryKey = Object.keys(queryParams)[0]
  const queryValue = queryParams[queryKey]

  const queryResponse = await dbClient.query({
    TableName: TABLE_NAME!,
    IndexName: queryKey,
    KeyConditionExpression: '#zz = :zzzz',
    ExpressionAttributeNames: {
      '#zz': queryKey
    },
    ExpressionAttributeValues: {
      ':zzzz': queryValue
    }
  }).promise()

  if (queryResponse.Count! < 1) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: `Could not find resources for query ${queryKey} with value ${queryValue}`
      })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(queryResponse.Items)
  }
  
}

const queryWithPrimaryPartition = async (pathParams: APIGatewayProxyEventPathParameters): Promise<APIGatewayProxyResult> => {
  const keyValue = pathParams[PRIMARY_KEY!]
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

  if (queryResponse.Count! < 1) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: `Could not find resource with id ${keyValue}`
      })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(queryResponse.Items![0])
  }
}

const scanTable = async () => {
  const queryResponse = await dbClient.scan({
    TableName: TABLE_NAME!
  }).promise()

  return JSON.stringify(queryResponse.Items)
}
