import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined
}

const createPool = () => {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to connect to Postgres')
  }

  // Default to SSL (required by RDS); allow opt-out for true localhost via POSTGRES_SSL=false.
  const ssl =
    process.env.POSTGRES_SSL === 'false'
      ? false
      : { rejectUnauthorized: false }

  return new Pool({
    connectionString,
    ssl,
  })
}

export const getPool = () => {
  if (!global.pgPool) {
    global.pgPool = createPool()
  }
  return global.pgPool
}

export const withClient = async <T>(fn: (client: import('pg').PoolClient) => Promise<T>) => {
  const client = await getPool().connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}
