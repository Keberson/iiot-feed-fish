// ========== RFID_TEST.INO ==========
// Тестовый скрипт для диагностики RFID модуля MFRC522

#include <SPI.h>
#include <MFRC522.h>

// ========== НАСТРОЙКИ ПИНОВ RFID (MFRC522) ==========
// Стандартная распиновка для Arduino Uno/Nano:
#define SS_PIN 10      // SDA (SS) - выбор устройства SPI
#define RST_PIN 9      // RST - сброс модуля
// SPI пины (стандартные для Arduino):
// MOSI = Pin 11
// MISO = Pin 12
// SCK = Pin 13

// ========== ГЛОБАЛЬНЫЕ ОБЪЕКТЫ ==========
MFRC522 rfid(SS_PIN, RST_PIN);  // Создаем объект RFID

// ========== ФУНКЦИЯ РАСШИРЕННОЙ ДИАГНОСТИКИ ==========
void advancedDiagnostics() {
  Serial.println(F("\n=== РАСШИРЕННАЯ ДИАГНОСТИКА ==="));
  
  // Проверка состояния пинов
  Serial.println(F("\n--- Проверка пинов ---"));
  pinMode(SS_PIN, OUTPUT);
  pinMode(RST_PIN, OUTPUT);
  
  digitalWrite(SS_PIN, HIGH);
  digitalWrite(RST_PIN, HIGH);
  delay(10);
  Serial.print(F("SS Pin (10): "));
  Serial.println(digitalRead(SS_PIN) ? F("HIGH") : F("LOW"));
  Serial.print(F("RST Pin (9): "));
  Serial.println(digitalRead(RST_PIN) ? F("HIGH") : F("LOW"));
  
  // Проверка SPI пинов
  Serial.println(F("\n--- Проверка SPI пинов ---"));
  Serial.print(F("MOSI (11): "));
  pinMode(11, OUTPUT);
  digitalWrite(11, HIGH);
  delay(1);
  Serial.println(digitalRead(11) ? F("OK") : F("ERROR"));
  
  Serial.print(F("MISO (12): "));
  pinMode(12, INPUT);
  Serial.println(F("OK (input)"));
  
  Serial.print(F("SCK (13): "));
  // Пин 13 может конфликтовать с LED_BUILTIN, проверяем отдельно
  // Сначала отключаем LED полностью
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
  delay(10);
  
  // Теперь проверяем пин 13
  pinMode(13, OUTPUT);
  digitalWrite(13, LOW);
  delay(5);
  bool sckLow = !digitalRead(13);  // Проверяем что можем установить LOW
  
  digitalWrite(13, HIGH);
  delay(5);
  bool sckHigh = digitalRead(13);  // Проверяем что можем установить HIGH
  
  // Проверяем несколько раз для надежности
  for (int i = 0; i < 3; i++) {
    digitalWrite(13, LOW);
    delay(2);
    sckLow = sckLow && !digitalRead(13);
    digitalWrite(13, HIGH);
    delay(2);
    sckHigh = sckHigh && digitalRead(13);
  }
  
  if (sckLow && sckHigh) {
    Serial.println(F("OK"));
  } else {
    Serial.print(F("ERROR (LOW="));
    Serial.print(sckLow ? F("OK") : F("FAIL"));
    Serial.print(F(", HIGH="));
    Serial.print(sckHigh ? F("OK") : F("FAIL"));
    Serial.println(F(")"));
    Serial.println(F("\nКРИТИЧЕСКАЯ ПРОБЛЕМА: Пин 13 (SCK) не работает правильно!"));
    Serial.println(F("Это блокирует работу SPI шины."));
    Serial.println(F("\nВозможные причины:"));
    Serial.println(F("1. Пин 13 физически поврежден"));
    Serial.println(F("2. Короткое замыкание на пине 13"));
    Serial.println(F("3. Конфликт с другим устройством"));
    Serial.println(F("4. Проблема с платой Arduino"));
    Serial.println(F("\nРЕШЕНИЕ:"));
    Serial.println(F("1. Проверьте мультиметром пин 13 (должен переключаться LOW/HIGH)"));
    Serial.println(F("2. Отключите все устройства от пина 13"));
    Serial.println(F("3. Попробуйте другую плату Arduino"));
    Serial.println(F("4. Без исправления пина 13 модуль RFID работать не будет!"));
  }
  
  // Попытка ручного сброса модуля
  Serial.println(F("\n--- Попытка ручного сброса ---"));
  digitalWrite(RST_PIN, LOW);
  delay(50);
  digitalWrite(RST_PIN, HIGH);
  delay(50);
  Serial.println(F("RST выполнен"));
  
  // Повторная инициализация SPI с разными настройками
  Serial.println(F("\n--- Переинициализация SPI ---"));
  SPI.end();
  delay(100);
  
  // Отключаем LED на пине 13 перед инициализацией SPI
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
  
  SPI.begin();
  // Пробуем разные скорости SPI
  Serial.println(F("Пробуем разные скорости SPI..."));
  
  byte version = 0;
  int clockDividers[] = {SPI_CLOCK_DIV4, SPI_CLOCK_DIV8, SPI_CLOCK_DIV16, SPI_CLOCK_DIV32};
  const char* dividerNames[] = {"DIV4 (4MHz)", "DIV8 (2MHz)", "DIV16 (1MHz)", "DIV32 (500kHz)"};
  
  for (int i = 0; i < 4; i++) {
    SPI.setClockDivider(clockDividers[i]);
    delay(50);
    
    // Сброс модуля перед каждой попыткой
    digitalWrite(RST_PIN, LOW);
    delay(10);
    digitalWrite(RST_PIN, HIGH);
    delay(50);
    
    // Инициализация RFID
    rfid.PCD_Init();
    delay(50);
    
    // Попытка чтения версии
    version = rfid.PCD_ReadRegister(rfid.VersionReg);
    Serial.print(F("  Скорость "));
    Serial.print(dividerNames[i]);
    Serial.print(F(": Version = 0x"));
    Serial.print(version, HEX);
    
    if (version != 0x00 && version != 0xFF) {
      Serial.println(F(" - УСПЕХ!"));
      break;
    } else {
      Serial.println(F(" - не отвечает"));
    }
  }
  
  if (version == 0x00 || version == 0xFF) {
    Serial.println(F("\nВсе скорости SPI не дали результата."));
    Serial.println(F("Проверьте физическое подключение модуля!"));
  }
  
  Serial.println(F("\n=====================================\n"));
}

// ========== ФУНКЦИЯ ДИАГНОСТИКИ ПОДКЛЮЧЕНИЯ ==========
void diagnoseConnection() {
  Serial.println(F("\n=== ДИАГНОСТИКА ПОДКЛЮЧЕНИЯ RFID ==="));
  
  // Проверка версии прошивки
  byte version = rfid.PCD_ReadRegister(rfid.VersionReg);
  Serial.print(F("Firmware Version: 0x"));
  Serial.print(version, HEX);
  
  if (version == 0x00 || version == 0xFF) {
    Serial.println(F(" = (unknown)"));
    Serial.println(F("ERROR: Модуль не отвечает!"));
    
    // Расширенная диагностика
    advancedDiagnostics();
    
    Serial.println(F("\n--- ВОЗМОЖНЫЕ ПРИЧИНЫ ПРОБЛЕМЫ ---"));
    Serial.println(F("1. Модуль подключен к 5V вместо 3.3V (поврежден!)"));
    Serial.println(F("2. Неправильное подключение SPI (MOSI/MISO перепутаны)"));
    Serial.println(F("3. Проблема с пином SCK (13) - конфликт с LED_BUILTIN"));
    Serial.println(F("4. Плохой контакт на пинах SS или RST"));
    Serial.println(F("5. Модуль не получает питание (проверьте VCC и GND)"));
    Serial.println(F("6. Неисправный модуль"));
    Serial.println(F("\nПроверьте подключение:"));
    Serial.println(F("1. SS (SDA) -> Pin 10"));
    Serial.println(F("2. RST -> Pin 9"));
    Serial.println(F("3. MOSI -> Pin 11"));
    Serial.println(F("4. MISO -> Pin 12"));
    Serial.println(F("5. SCK -> Pin 13"));
    Serial.println(F("6. VCC -> 3.3V (НЕ 5V!)"));
    Serial.println(F("7. GND -> GND"));
    Serial.println(F("\nВАЖНО: MFRC522 работает только от 3.3V!"));
    Serial.println(F("Если подключен к 5V - модуль может быть поврежден!"));
    Serial.println(F("\nКРИТИЧЕСКИ ВАЖНО - ПРОВЕРЬТЕ:"));
    Serial.println(F("1. МУЛЬТИМЕТРОМ измерьте напряжение на VCC модуля:"));
    Serial.println(F("   - Должно быть 3.3V (не 5V!)"));
    Serial.println(F("   - Если 5V - модуль поврежден, нужен новый"));
    Serial.println(F("   - Если 0V - проблема с питанием"));
    Serial.println(F("2. Проверьте GND - должен быть общий с Arduino"));
    Serial.println(F("3. Проверьте пин 13 (SCK) мультиметром:"));
    Serial.println(F("   - Должен переключаться между 0V и 5V"));
    Serial.println(F("   - Если не переключается - проблема с пином"));
    Serial.println(F("4. Проверьте все соединения на обрыв и короткое замыкание"));
    Serial.println(F("5. Попробуйте другой модуль MFRC522 (если есть)"));
    Serial.println(F("\nБЕЗ ИСПРАВЛЕНИЯ ПИНА 13 МОДУЛЬ РАБОТАТЬ НЕ БУДЕТ!"));
  } else {
    Serial.print(F(" = "));
    if (version == 0x91) {
      Serial.println(F("v1.0"));
    } else if (version == 0x92) {
      Serial.println(F("v2.0"));
    } else {
      Serial.println(F("(unknown version)"));
    }
    Serial.println(F("OK: Модуль обнаружен!"));
  }
  
  // Проверка регистров
  Serial.println(F("\n--- Проверка регистров ---"));
  byte regValue;
  
  regValue = rfid.PCD_ReadRegister(rfid.CommandReg);
  Serial.print(F("CommandReg: 0x"));
  Serial.println(regValue, HEX);
  
  regValue = rfid.PCD_ReadRegister(rfid.ComIEnReg);
  Serial.print(F("ComIEnReg: 0x"));
  Serial.println(regValue, HEX);
  
  regValue = rfid.PCD_ReadRegister(rfid.DivIEnReg);
  Serial.print(F("DivIEnReg: 0x"));
  Serial.println(regValue, HEX);
  
  // Самотестирование модуля
  Serial.println(F("\n--- Самотестирование модуля ---"));
  if (rfid.PCD_PerformSelfTest()) {
    Serial.println(F("OK: Самотестирование пройдено успешно!"));
  } else {
    Serial.println(F("ERROR: Самотестирование не пройдено!"));
  }
  
  Serial.println(F("\n=====================================\n"));
}

// ========== ФУНКЦИЯ ВЫВОДА UID МЕТКИ ==========
void printUID(byte *buffer, byte bufferSize) {
  Serial.print(F("UID: "));
  for (byte i = 0; i < bufferSize; i++) {
    if (buffer[i] < 0x10) Serial.print(F("0"));
    Serial.print(buffer[i], HEX);
    if (i < bufferSize - 1) Serial.print(F(" "));
  }
  Serial.println();
  
  // Вывод в формате для кода
  Serial.print(F("Код для использования: {0x"));
  for (byte i = 0; i < bufferSize; i++) {
    if (buffer[i] < 0x10) Serial.print(F("0"));
    Serial.print(buffer[i], HEX);
    if (i < bufferSize - 1) Serial.print(F(", 0x"));
  }
  Serial.println(F("}"));
}

// ========== ФУНКЦИЯ ЧТЕНИЯ МЕТКИ ==========
void readCard() {
  // Проверяем наличие новой метки
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }
  
  // Выбираем метку
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }
  
  Serial.println(F("\n=== МЕТКА ОБНАРУЖЕНА ==="));
  
  // Выводим тип метки
  MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
  Serial.print(F("Тип метки: "));
  Serial.println(rfid.PICC_GetTypeName(piccType));
  
  // Выводим SAK
  Serial.print(F("SAK: 0x"));
  Serial.println(rfid.uid.sak, HEX);
  
  // Выводим размер UID
  Serial.print(F("Размер UID: "));
  Serial.print(rfid.uid.size);
  Serial.println(F(" байт"));
  
  // Выводим UID
  printUID(rfid.uid.uidByte, rfid.uid.size);
  
  // Читаем данные из блока (если это MIFARE Classic)
  if (piccType == MFRC522::PICC_TYPE_MIFARE_MINI ||
      piccType == MFRC522::PICC_TYPE_MIFARE_1K ||
      piccType == MFRC522::PICC_TYPE_MIFARE_4K) {
    Serial.println(F("\n--- Данные блоков (MIFARE Classic) ---"));
    Serial.println(F("(Для чтения нужен ключ доступа)"));
  }
  
  Serial.println(F("\n=====================================\n"));
  
  // Останавливаем шифрование PCD
  rfid.PICC_HaltA();
  // Останавливаем шифрование PICC
  rfid.PCD_StopCrypto1();
}

// ========== НАЧАЛЬНАЯ НАСТРОЙКА ==========
void setup() {
  // Инициализация Serial
  Serial.begin(115200);
  while (!Serial);  // Ждем подключения Serial (для Leonardo/Micro)
  delay(100);
  
  Serial.println(F("\n\n====================================="));
  Serial.println(F("=== ТЕСТ RFID МОДУЛЯ MFRC522 ==="));
  Serial.println(F("=====================================\n"));
  
  // Настройка пинов SS и RST
  pinMode(SS_PIN, OUTPUT);
  pinMode(RST_PIN, OUTPUT);
  digitalWrite(SS_PIN, HIGH);  // SS должен быть HIGH когда не используется
  digitalWrite(RST_PIN, HIGH);  // RST должен быть HIGH для работы
  
  // Инициализация SPI
  Serial.println(F("Инициализация SPI..."));
  SPI.begin();
  SPI.setClockDivider(SPI_CLOCK_DIV4);  // Установка скорости SPI (4 МГц)
  delay(100);
  
  // Сброс модуля
  Serial.println(F("Сброс RFID модуля..."));
  digitalWrite(RST_PIN, LOW);
  delay(50);
  digitalWrite(RST_PIN, HIGH);
  delay(50);
  
  // Инициализация RFID модуля
  Serial.println(F("Инициализация RFID модуля..."));
  rfid.PCD_Init();
  delay(100);
  
  // Диагностика подключения
  diagnoseConnection();
  
  Serial.println(F("Готов к чтению меток!"));
  Serial.println(F("Поднесите RFID метку к считывателю..."));
  Serial.println(F("\nКоманды:"));
  Serial.println(F("  - Поднесите метку для автоматического чтения"));
  Serial.println(F("  - Отправьте 'test' для повторной диагностики"));
  Serial.println(F("  - Отправьте 'advanced' для расширенной диагностики"));
  Serial.println(F("  - Отправьте 'info' для информации о модуле"));
  Serial.println();
}

// ========== ГЛАВНЫЙ ЦИКЛ ==========
void loop() {
  // Проверка команд из Serial
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    command.toUpperCase();
    
    if (command == "TEST") {
      diagnoseConnection();
    } else if (command == "ADVANCED" || command == "ADV") {
      advancedDiagnostics();
    } else if (command == "INFO") {
      Serial.println(F("\n=== ИНФОРМАЦИЯ О МОДУЛЕ ==="));
      Serial.print(F("SS Pin: "));
      Serial.println(SS_PIN);
      Serial.print(F("RST Pin: "));
      Serial.println(RST_PIN);
      Serial.println(F("SPI: MOSI=11, MISO=12, SCK=13"));
      Serial.println(F("Питание: 3.3V (обязательно!)"));
      Serial.println();
    }
  }
  
  // Постоянная проверка наличия метки
  readCard();
  
  delay(50);  // Небольшая задержка для стабильности
}
