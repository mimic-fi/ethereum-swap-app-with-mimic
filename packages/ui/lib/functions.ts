import sdk from '@/lib/sdk'
import { FUNCTION_CID } from '@/lib/constants'

export interface Execution {
  description: string
  createdAt: Date
  result: string
  url: string
}

export async function findExecutions(signer: string): Promise<Execution[]> {
  const triggers = await sdk().triggers.get({ signer, functionCid: FUNCTION_CID, offset: 0, limit: 10 })
  return Promise.all(
    triggers.map(async (trigger) => {
      const executions = await sdk().executions.get({ triggerSig: trigger.sig })
      if (executions.length == 0 || executions[0].outputs.length == 0) {
        return {
          createdAt: trigger.createdAt,
          description: trigger.description,
          result: trigger.config.endDate < Date.now() && sdk().triggers.isExpired(trigger) ? 'expired' : 'waiting',
          url: `https://protocol.mimic.fi/triggers/${trigger.sig}`,
        }
      }

      const output = executions[0].outputs[0]
      const intent = await sdk().intents.getByHash(output.hash)
      return {
        description: trigger.description,
        createdAt: trigger.createdAt,
        result: intent.status,
        url: `https://protocol.mimic.fi/intents/${intent.hash}`,
      }
    })
  )
}
