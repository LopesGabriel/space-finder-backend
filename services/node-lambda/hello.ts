import { v4 } from 'uuid'
import { S3 } from 'aws-sdk'

const s3Client = new S3()

export const handler = async (_evt: any, _context: any) => {
  const buckets = await s3Client.listBuckets().promise()
  return {
    statusCode: 200,
    body: JSON.stringify({
      id: v4(),
      message: 'Hello world',
      language: 'Typescript',
      buckets: buckets.Buckets
    })
  }
}
