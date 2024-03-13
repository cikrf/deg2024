import { basename, resolve } from 'path'
import * as readline from 'readline'
import * as fs from 'fs'
import { parseLine } from './utils/parse-line'
import { ContractState, STATE_TX_OPERATIONS, SumAB, Tx, ValidationBadTxs, ValidationConfig, ValidationSummary, VotingOperation } from './types'
import { log, logError, logTxs, logVerbose } from './utils/log-utils'
import { getFiles } from './utils/get-files'
import { chunk, isEqual } from 'lodash'
import { addVotesChunk, calculateResults, chunkSize, validateBlindSignature, validateBulletinZKP, validateDecryption, validateTxSignature } from './worker'
import { getContractState } from './utils/get-contract-state'
import { decode } from '@wavesenterprise/rtk-encrypt/dist'
import { getABs } from './utils/get-abs'

export const validate = async (contractId: string, dir: string, config: ValidationConfig): Promise<ValidationSummary | undefined> => {
  const files = await getFiles(resolve(dir, `*.csv`))

  if (files.length === 0) {
    logError('Файлы с транзакциями указанного голосования не найдены')
    return
  }

  const summary: ValidationSummary = {
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

  const buffer: Tx[] = []
  log('Проверка подписей транзакций и учет роллбеков...')
  for (const filename of files) {
    const fileStream = fs.createReadStream(filename, {
      start: 0,
    })
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    })
    let i = 0;
    for await (const line of rl) {
      i++
      try {
        const tx = parseLine(line, contractId)
        if (tx.rollback) {
          const idx = buffer.findIndex(({ txId }) => tx.txId === txId)
          buffer.splice(idx, 1)
          logVerbose(`${tx.txId.padStart(44, ' ')}: Транзакция удалена (роллбек)`)
        } else {
          buffer.push(tx)
        }
      } catch (e) {
        logError(`Выгрузка транзакций голосования ${contractId} содержит некорректные данные в ${basename(filename)}:${i}`)
      }
    }
    rl.close()

    fileStream.close()
  }

  await Promise.all(chunk(buffer, chunkSize).map(async (txs) => {
    if (config.txSig) {
      await Promise.all(txs.map(async (tx) => {
        try {
          tx.valid = await validateTxSignature(tx)
        } catch (e) {
          logError(e)
          tx.valid = false
        }
        if (tx.valid) {
          logVerbose(`${tx.txId.padStart(44, ' ')}: Подпись транзакции корректна`)
        } else {
          summary.wrongTxSig++
          badTxs.wrongTxSig.push(tx.txId)
          logError(`${tx.txId.padStart(44, ' ')}: Неверная подпись транзакции`)
        }
      }))
    } else {
      txs.map((tx) => tx.valid = true)
    }
  }))

  // Восстанавливаем стейт контракта
  const contractState = getContractState(buffer.filter((tx) => tx.valid && STATE_TX_OPERATIONS.includes(tx.operation)))

  summary.issued = buffer.filter((tx) => tx.operation === VotingOperation.blindSigIssue).length
  summary.accepted = buffer.filter((tx) => tx.operation === VotingOperation.vote && !Object.keys(tx.diff).some((key) => key.indexOf('FAIL') > -1)).length
  summary.rejected = buffer.filter((tx) => Object.keys(tx.diff).some((key) => key.indexOf('FAIL') > -1)).length

  if (!contractState.MAIN_KEY) {
    logError('Ошибка валидации голосования: не найден главный ключ')
  }

  if (!contractState.VOTING_BASE) {
    logError('Ошибка валидации голосования: не найдена конфигурация')
  }

  const mainKey = contractState.MAIN_KEY
  const dimension = contractState.VOTING_BASE.dimension

  log('Проверка на переголосования...')
  const voted: Set<string> = new Set()
  const unique = buffer
    .filter((tx) => tx.valid)
    .filter((tx) => tx.operation === VotingOperation.vote)
    .filter((tx) => {
      if (!voted.has(tx.senderPublicKey)) {
        voted.add(tx.senderPublicKey)
        return true
      } else {
        summary.revote++
        badTxs.revote.push(tx.txId)
        return false
      }
    })

  const validateBulletin = async (tx: Tx) => {
    if (config.blindSig) {
      if (!await validateBlindSignature(contractState, tx)) {
        logError(`${tx.txId.padStart(44, ' ')}: Слепая подпись не прошла проверку`)
        badTxs.wrongBlindSig.push(tx.txId)
        summary.wrongBlindSig++
        return false
      } else {
        logVerbose(`${tx.txId.padStart(44, ' ')}: Слепая подпись корректна`)
      }
    }
    if (config.zkp) {
      const res = await validateBulletinZKP(tx, mainKey, dimension)
      if (!res.valid) {
        logError(`${res.txId.padStart(44, ' ')}: Некорректный ZKP`)
        badTxs.wrongZKP.push(tx.txId)
        summary.wrongZKP++
        return false
      } else {
        logVerbose(`${res.txId.padStart(44, ' ')}: Проверка ZKP успешна`)
      }
    }
    return true
  }

  log('Проверка бюллетеней...')
  const validVotes = (await Promise.all(chunk(unique, chunkSize).map(async (txs) => {
    const validatedChunkVotes = await Promise.all(txs.map(async tx => {
      const valid = await validateBulletin(tx)
      return { ...tx, valid }
    }))

    return validatedChunkVotes
      .filter((tx) => tx.valid)
      .map((tx) => Buffer.from(tx.params.vote, 'base64'))
      .map((b) => decode(b))
      .map((b) => getABs(b))

  }))).flat()

  const totalValid = validVotes.length
  while (validVotes.length > 1) {
    const sumChunk = validVotes.splice(0, chunkSize)
    const sum = await addVotesChunk(sumChunk, dimension.map(((d: any) => d[2])))
    validVotes.push(sum)
  }

  log(`\n`)
  log(`ИТОГ ПРОВЕРКИ ГОЛОСОВАНИЯ ${contractId}.\n`)
  log(`Выдано бюллетеней: ${summary.issued}.`)
  log(`Принято смарт-контрактом: ${summary.accepted}.`)
  log(`Отклонено смарт-контрактом: ${summary.rejected}.`)
  log(`\nНекорректная подпись транзакции: ${summary.wrongTxSig}.`)
  logTxs(badTxs.wrongTxSig)
  log(`\nНекорректная слепая подпись (аналогично бюллетеню неустановленной формы): ${summary.wrongBlindSig}.`)
  logTxs(badTxs.wrongBlindSig)
  log(`\nНекорректный ZKP (аналогично недействительному бюллетеню): ${summary.wrongZKP}.`)
  logTxs(badTxs.wrongZKP)
  log(`\nПовторное голосование: ${summary.revote}.`)
  logTxs(badTxs.revote)
  log(`\n`)

  log(`РЕЗУЛЬТАТЫ:\n`)
  if (validVotes.length) {
    summary.correct = await checkSum(config, validVotes[0], contractState, totalValid)
  }

  return summary
}

async function checkSum(config: ValidationConfig, sumABs: SumAB, contractState: ContractState, validNum: number) {
  const dimension = contractState.VOTING_BASE.dimension.map((o: any[]) => o[2])
  log('Зашифрованная сумма подсчитана.')

  let masterPublicKey, masterDecryption, masterCtx = ''
  let commissionDecryption, commissionPublicKey

  Object.entries(contractState).map(([key, value]) => {
    if (key === 'DKG_KEY' && typeof value === 'string') {
      masterPublicKey = value
    } else if (key === 'COMMISSION_KEY' && typeof value === 'string') {
      commissionPublicKey = value
    } else if (key.indexOf('DECRYPTION_') > -1 && typeof value === 'string') {
      masterDecryption = JSON.parse(value)
    } else if (key === 'COMMISSION_DECRYPTION' && typeof value === 'string') {
      commissionDecryption = JSON.parse(value)
    } else if (key === 'VOTING_BASE') {
      masterCtx = value.pollId
    }
  })

  log(`Количество корректно заполенных (действительных) бюллетеней: ${validNum}`)
  if (config.debug) {
    const result = contractState.RESULTS.map((question: number[]) => question.reduce((acc, option) => acc + option), 0)
    log(`Сумма из результатов ${JSON.stringify(result)}`)
  }

  if (masterDecryption && commissionDecryption && masterPublicKey && commissionPublicKey) {
    try {
      await validateDecryption(masterCtx, sumABs, dimension, masterPublicKey, masterDecryption)
      log('Расшифровка сервера корректна.')
    } catch (e) {
      logError('Расшифровка сервера некорректна.')
    }
    try {
      await validateDecryption(masterCtx, sumABs, dimension, commissionPublicKey, commissionDecryption)
      log('Расшифровка комиссии корректна.')
    } catch (e) {
      logError('Расшифровка комиссии некорректна.')
    }
  } else {
    throw new Error('Не хватает данных для проверки расшифровок.')
  }
  log(`\nПодсчет результата...`)

  const calculated = await calculateResults(
    sumABs,
    dimension,
    validNum,
    {
      publicKey: masterPublicKey,
      decryption: masterDecryption,
    },
    {
      publicKey: commissionPublicKey,
      decryption: commissionDecryption,
    },
  )

  log(`Размерность голосования (минимальное и максимальное количество отметок, количество кандидатов): ${JSON.stringify(contractState.VOTING_BASE.dimension)}`)
  log(`Результат в блокчейне: ${JSON.stringify(contractState.RESULTS)}`)
  log(`Результат проверки: ${JSON.stringify(calculated)}`)
  log(`\n`)
  if (isEqual(calculated, contractState.RESULTS)) {
    log('Итог проверки - РЕЗУЛЬТАТЫ СОВПАДАЮТ.')
    return 1
  } else {
    logError('Итог проверки - РЕЗУЛЬТАТЫ НЕ СОВПАДАЮТ.')
    return 0
  }
}
