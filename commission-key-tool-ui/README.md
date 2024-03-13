# Утилита разделения ключей ПТК ДЭГ

Для установки необходимо:
- Скачайте пакет [КриптоПро CSP 5.0 R3 для Linux (x64, deb) - Astra Linux](https://www.cryptopro.ru/products/csp/downloads#latest_csp50r3_linux) и установите его.
- Скачайте пакет, содержащий эфемерный считыватель Криптопро 
[https://www.cryptopro.ru/sites/default/files/private/csp/50/tmp_delete/vote2024/cprocsp-rdr-virt-64_5.0.12859-7_amd64.deb]
Установите его командой sudo dpkg -I cprocsp-rdr-virt-64_5.0.12859-7_amd64.deb
- Воспользоваться утилитой в соответствии с описанием в архиве

Проверка контрольной суммы архива в операционной системе Astra Linux выполняется командой gostsum <имя файла>.

Для разделения ключей применяется операционная система Astra Linux 1.7.4
Разделение ключей ДЭГ выполняется на компьютерах, оборудованных аппаратным датчиком случайных чисел (ДСЧ), биологический ДСЧ Криптопро на применяется для публичных разделений