import { v4 } from 'uuid'

export const handler = async (_evt: any, _context: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      id: v4(),
      message: 'Hello world',
      language: 'Typescript'
    })
  }
}
