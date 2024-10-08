# Утилита наблюдателя

Модуль «Утилита наблюдателя» компонента «Распределенное хранение данных и учет голосов» предназначен для проверки результатов ДЭГ. Реализован в виде standalone-утилиты, запускаемой в виде Docker-образа.

Утилита используется для выполнения криптографических проверок корректности учета бюллетеней и подведения итогов голосования. По файловым выгрузкам из блокчейн сети утилита восстанавливает историю проведения голосования, проверяет корректность учтенных бюллетеней, основываясь на сохраненных в транзакциях доказательствах корректности зашифрованной информации, суммирует бюллетени (без их расшифровывания) с применением техники гомоморфного сложения, проверяет и выдает заключение о корректности записанных в блокчейн сеть расшифрованных результатов голосования.

Утилита выполняет следующие проверки каждого бюллетеня и хода голосования в целом:

1. Подпись ГОСТ Р 34.10-2012 транзакции бюллетеня корректна (корректность проверяется при помощи открытого ключа ГОСТ Р 34.10-2012 голосующего).
2. Слепая подпись открытого ключа голосующего корректна (ключ соответствует слепой подписи и открытому ключу Регистратора). Эта подпись выдается Регистратором и подтверждает, что голосующий имеет право голосовать, т.к. его открытый ключ был подписан вслепую Регистратором (т.е. Регистратор не видел, какой открытый ключ он подписывал, хотя знал, что голосующий имеет на это право). Утилита поддерживает алгоритм слепой подписи - Тессаро-Жу.
3. В бюллетене присутствуют все необходимые ячейки с шифротекстами голосов за каждого отдельного кандидата из бюллетеня.
4. Каждое доказательство с нулевым разглашением range proof (в диапазоне [0,1]) в каждой ячейке бюллетеня корректно. Голосующий может положить в ячейку за каждого кандидата либо 0, либо 1 и зашифровать их. Если в ячейке будет какое-либо другое число, то доказательство будет некорректным.
5. Каждое доказательство с нулевым разглашением range proof для суммы ячеек [1,N] корректно. Число N устанавливается избирательной комиссией для каждого голосования и указывается в параметре dimension при инициализации смарт-контракта. Голосующий может проголосовать за любое количество кандидатов строго в диапазоне от 1 до N включительно. При этом само число кандидатов, за которых он проголосовал, остается известным только самому голосующему, так же, как и выбор кандидатов.
6. Доказательство расшифровки корректно для суммы всех валидных бюллетеней. Проверка проводится для двух частичных расшифровок суммы бюллетеней - расшифровок на ключе Учетчика и ключе Комиссии. В качестве схемы доказательства корректности расшифровывания используется схема Chaum Pedersen.
7. Опубликованные на блокчейне результаты голосования совпадают с результатами подсчитанными утилитой путем «сложения» частичных расшифровок.


## Установка

- Установите [https://www.docker.com/products/docker-desktop/](Docker)
- Склонируйте этот репозиторий с утилитой наблюдателя (observer-tool)
- Перейдите в корневую директорию утилиты
- Скачайте библиотеку ```cpblindsig.zip``` и положите файл в корневую директорию утилиты наблюдателя
- Скачайте пакет [КриптоПро CSP 5.0 R3 для Linux (x64, deb) - Astra Linux](https://www.cryptopro.ru/products/csp/downloads#latest_csp50r3_linux) и положите файл ```linux-amd64_deb.tgz``` в корневую директорию утилиты наблюдателя
- Очистите cache перед следующим шагом командой <br> ```docker builder prune -a```
- Соберите docker-образ, выполнив команду (точка в конце строки является частью команды):
<br> для Intel/AMD: ```docker build  -t observer-tool -f Dockerfile .```
<br> для M1: ```docker build --platform linux/x86_64 -t observer-tool -f Dockerfile .```


## Запуск
Для увеличения производительности проверки, увеличьте количество используемых ядер в Docker.
- Проверка транзакций голосования. Перейдите в каталог с zip-архивами транзакций голосований и выполните команду:
  - для Intel/AMD: ```docker run --rm -ti -v .:/app/files observer-tool run validate [contractId]```
  - для M1: ```docker run --rm -ti -v .:/app/files --platform linux/x86_64 observer-tool run validate [contractId]```
  
  ```[contractId]``` - указать id контракта, если требуется проверить определенный контракт, иначе параметр указывать не надо.
- Для остановки проверки нажмите ```CTRL+C```
- Для дополнительных логов добавьте в команду ```--verbose```

Утилите может не хватить выделенных по умолчанию ресурсов при проверке больших объемов. В этом случае при запуске появится сообщение с ошибкой. Воспользуйтесь [данной официальной инструкцией](https://docs.docker.com/desktop/settings/mac/) для выделения большего количество памяти и процессоров в docker через интерфейс приложения. Рекомендуем выставить значения 16Гб RAM и 10 CPU. Затем повторите процедуру запуска проверки голосования с дополнительными параметрами (в команде запуска значения "memory" и "cpus" не должны превышать максимальное значение, выставленное в настройках docker):
- для Intel/AMD: ```docker run --rm --memory=16g --cpus=10 -ti -v .:/app/files observer-tool run validate [contractId]```
- для M1: ```docker run --rm --memory=16g --cpus=10 -ti --platform linux/x86_64 -v .:/app/files observer-tool run validate [contractId]``` 

Проверка доказательства принятия бюллетеня урной: перейдите в каталог квитком (файл json-формата) и выполните команду:
- для Intel/AMD: ```docker run --rm -ti -v .:/app/files observer-tool run validate-receipt```
- для M1: ```docker run --rm -ti --platform linux/x86_64 -v .:/app/files observer-tool run validate-receipt```
