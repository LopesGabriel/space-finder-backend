import { APIGatewayProxyEvent } from 'aws-lambda'
import { handler } from '../../services/SpacesTable/Read'

const event: APIGatewayProxyEvent = {
  pathParameters: {
    spaceId: 'a5bb8c51-d522-40f3-9e39-c87f0512a2dd'
  }
} as any

handler(event, {} as any)
  .then(value => {
    const responseBody = JSON.parse(value.body)
    console.log('Successfully retrieved the response body')
  })
