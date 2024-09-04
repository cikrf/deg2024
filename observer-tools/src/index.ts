#!/usr/bin/env node

import { basename, resolve } from 'path'
import { mkdtemp } from 'fs/promises'
import * as rimraf from 'rimraf'
import { validate } from './validate'
import { log, logError, logTxs } from './utils/log-utils'
import { unpackFile } from './unpack'
import { terminateWorkers } from './worker'
import { ValidationBadTxs, ValidationConfig, ValidationSummary } from './types'
import { getFiles } from './utils/get-files'
import { validateReceipt } from './validate-receipt'
import { existsSync, readFileSync } from 'fs'
import * as process from 'process'
import { getArgv } from './utils/get-argv'

(async () => {
  const argv = await getArgv()

  const command = argv['_'][0]

  if (argv.debug && existsSync('version.txt')) {
    const version = readFileSync('version.txt').toString()
    log(`Версия: ${version}`)
  }

  let files: string[]

  switch (command) {
    case 'validate':
      const config: ValidationConfig = {
        debug: argv.debug !== undefined ? Boolean(argv.debug) : false,
        txSig: argv.txSig !== undefined ? Boolean(argv.txSig) : true,
        blindSig: argv.blindSig !== undefined ? Boolean(argv.blindSig) : true,
        zkp: argv.zkp !== undefined ? Boolean(argv.zkp) : true,
      }

      let contractIds: string[] = []
      if (argv.contractId) {
        files = await getFiles(resolve('.', 'files', '**', `${argv.contractId}*.zip`))
        if (files.length === 0) {
          logError('Выгрузка транзакций голосования не найдена')
        } else {
          contractIds.push(argv.contractId)
        }
      } else {
        files = await getFiles(resolve('.', 'files', '**', '*.zip'))
        files.map((filename) => {
          const contractId = basename(filename.split('_')[0])
          if (!contractIds.includes(contractId)) {
            contractIds.push(contractId)
          }
        })
      }

      const totalSummary: ValidationSummary = {
        issued: 0,
        accepted: 0,
        rejected: 0,
        revote: 0,
        wrongTxSig: 0,
        wrongBlindSig: 0,
        wrongZKP: 0,
        correct: 0,
      }

      const badTxs: ValidationBadTxs = {
        revote: [],
        wrongTxSig: [],
        wrongBlindSig: [],
        wrongZKP: [],
      }

      const incorrect: string[] = []

      for (const contractId of contractIds) {
        const tmpDir = await mkdtemp(`observer-tool-tmp-`)
        try {
          files = await getFiles(resolve('.', 'files', '**', `${contractId}*.zip`))
          log(`\n\nПроверка голосования ${contractId}`)
          log('Распаковка архивов... ')
          for (const filename of files) {
            await unpackFile(filename, tmpDir)
          }

          log('Обработка файлов с транзакциями...')
          const summary = await validate(contractId, tmpDir, config)
          if (summary) {
            Object.keys(totalSummary).map((key) => {
              // @ts-ignore
              totalSummary[key] += summary[key]
            })

            if (summary.revote) {
              badTxs.revote.push(contractId)
            }
            if (summary.wrongTxSig) {
              badTxs.wrongTxSig.push(contractId)
            }
            if (summary.wrongZKP) {
              badTxs.wrongZKP.push(contractId)
            }
            if (summary.wrongBlindSig) {
              badTxs.wrongBlindSig.push(contractId)
            }
            if (!summary.correct) {
              incorrect.push(contractId)
            }

          }
        } catch (e) {
          incorrect.push(contractId)
          logError(e)
        }
        rimraf.sync(tmpDir)
      }

      log(`\n\nОБЩИЙ ИТОГ ПРОВЕРКИ.\n`)
      log(`Бюллетени:`)
      log(`Принято смарт-контрактом: ${totalSummary.accepted}.`)
      log(`Отклонено смарт-контрактом: ${totalSummary.rejected}.`)
      log(`Некорректная подпись транзакции: ${totalSummary.wrongTxSig}.`)
      logTxs(badTxs.wrongTxSig)
      log(`\nНекорректная слепая подпись (бюллетень неустановленной формы): ${totalSummary.wrongBlindSig}.`)
      logTxs(badTxs.wrongBlindSig)
      log(`\nНекорректный ZKP (недействительный бюллетень): ${totalSummary.wrongZKP}.`)
      logTxs(badTxs.wrongZKP)
      log(`\nПовторное голосование: ${totalSummary.revote}.`)
      logTxs(badTxs.revote)
      log(`\n`)

      log(`Голосования:`)
      log(`Результаты совпадают: ${contractIds.length - incorrect.length}.`)
      log(`Результаты не совпадают: ${incorrect.length}.`)
      logTxs(incorrect)
      log(`\n`)

      break

    case 'validate-receipt':
      files = await getFiles(resolve('.', 'files', '**', `*.json`))
      if (files.length === 0) {
        logError('Файлы для проверки не найдены')
      }

      for (const file of files) {
        await validateReceipt(file)
      }

      break
    default:
      logError('Требуется указать команду')
      break
  }
  terminateWorkers()
  process.exit(0)

})()

