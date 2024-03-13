import * as yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import * as process from 'process'

export const getArgv = async () => {
  return yargs(hideBin(process.argv))
    .command('validate [contractId]', 'Проверить голосования', (yargs) => {
      return yargs
        .positional('contractId', {
          describe: 'Идентификатор голосования',
          type: 'string',
          demandOption: true,
        })
        .boolean('tx-sig')
        .boolean('blind-sig')
        .boolean('zkp')
        .boolean('verbose')
        .boolean('debug')
    })
    .argv
}
