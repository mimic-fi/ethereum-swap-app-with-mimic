import sdk from '@/lib/sdk'
import { TASK_CID } from '@/lib/constants'

export interface Execution {
  description: string
  createdAt: Date
  result: string
  url: string
}

export async function findExecutions(signer: string): Promise<Execution[]> {
  const configs = await sdk().configs.get({ signer, taskCid: TASK_CID, offset: 0, limit: 10 })
  return Promise.all(
    configs.map(async (config) => {
      const executions = await sdk().executions.get({ configSig: config.sig })
      if (executions.length == 0 || executions[0].outputs.length == 0) {
        return {
          createdAt: config.createdAt,
          description: config.description,
          result: config.trigger.endDate < Date.now() && sdk().configs.isExpired(config) ? 'expired' : 'waiting',
          url: `https://protocol.mimic.fi/configs/${config.sig}`,
        }
      }

      const output = executions[0].outputs[0]
      const intent = await sdk().intents.getByHash(output.hash)
      return {
        description: config.description,
        createdAt: config.createdAt,
        result: intent.status,
        url: `https://protocol.mimic.fi/intents/${intent.hash}`,
      }
    })
  )
}
