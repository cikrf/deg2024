import * as chalk from 'chalk'
import * as process from 'process'

const logLevel = ['error', 'log']

if (process.argv.includes('--verbose')) {
  logLevel.push('verbose')
}

export const log = (message: string) => {
  if (logLevel.includes('log')) {
    console.log(message)
  }
}

export const logTxs = (list: string[]) => {
  if (logLevel.includes('log')) {
    list.map((txId) => {
      log(`${txId.padStart(44, ' ')}`)
    })
  }
}

export const logVerbose = (message: string) => {
  if (logLevel.includes('verbose')) {
    console.log(chalk.blueBright(message))
  }
}

export const logError = (message: string) => {
  if (logLevel.includes('error')) {
    console.log(chalk.red(message))
  }
}
