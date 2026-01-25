// Полная диагностика датчиков Холла и альтернативные методы старта

#define PIN_SPEED 9
#define PIN_DIR   7
#define PIN_BRAKE 10
#define PIN_ENCODER 4

void unlockSafetyStart() {
  analogWrite(PIN_SPEED, 0);
  analogWrite(PIN_BRAKE, 0);
  delay(100);
  analogWrite(PIN_BRAKE, 128);
  delay(300);
  analogWrite(PIN_BRAKE, 0);
  delay(200);
}

void checkHallSensors() {
  Serial.println(F("\n=== ПРОВЕРКА ДАТЧИКОВ ХОЛЛА ==="));
  Serial.println(F("Вращайте мотор ВРУЧНУЮ и наблюдайте за энкодером\n"));
  
  unlockSafetyStart();
  
  Serial.println(F("Начало проверки..."));
  Serial.println(F("Вращайте мотор медленно в любую сторону\n"));
  
  unsigned long startTime = millis();
  int pulseCount = 0;
  bool lastState = digitalRead(PIN_ENCODER);
  
  while (millis() - startTime < 10000) {  // 10 секунд
    bool currentState = digitalRead(PIN_ENCODER);
    if (currentState != lastState) {
      pulseCount++;
      lastState = currentState;
      Serial.print(F("Импульс #"));
      Serial.println(pulseCount);
    }
    delay(10);
  }
  
  Serial.print(F("\nВсего импульсов за 10 сек: "));
  Serial.println(pulseCount);
  
  if (pulseCount == 0) {
    Serial.println(F("\n⚠ ПРОБЛЕМА: Энкодер не выдает импульсы!"));
    Serial.println(F("Возможные причины:"));
    Serial.println(F("1. Датчики Холла не подключены"));
    Serial.println(F("2. Датчики Холла не работают"));
    Serial.println(F("3. Проблема с подключением 1M (энкодер)"));
  } else if (pulseCount < 10) {
    Serial.println(F("\n⚠ ПРОБЛЕМА: Слишком мало импульсов!"));
    Serial.println(F("Датчики Холла работают, но возможно неправильно подключены"));
  } else {
    Serial.println(F("\n✓ Датчики Холла работают нормально"));
    Serial.print(F("Частота: ~"));
    Serial.print(pulseCount / 10);
    Serial.println(F(" импульсов/сек"));
  }
}

void alternativeStartMethod1(int targetSpeed, bool direction) {
  // Метод 1: Очень медленный старт с минимальной скоростью
  Serial.println(F("\nМетод 1: Очень медленный старт"));
  
  unlockSafetyStart();
  digitalWrite(PIN_DIR, direction ? HIGH : LOW);
  delay(100);
  analogWrite(PIN_BRAKE, 0);
  delay(50);
  
  // Начинаем с очень маленькой скорости
  for (int speed = 20; speed <= targetSpeed; speed += 5) {
    analogWrite(PIN_SPEED, speed);
    delay(100);
    
    // Проверяем вращение
    bool lastState = digitalRead(PIN_ENCODER);
    int changes = 0;
    for (int i = 0; i < 20; i++) {
      bool currentState = digitalRead(PIN_ENCODER);
      if (currentState != lastState) {
        changes++;
        lastState = currentState;
      }
      delay(5);
    }
    
    if (changes > 2) {
      Serial.print(F("  Старт на скорости "));
      Serial.println(speed);
      analogWrite(PIN_SPEED, targetSpeed);
      return;
    }
  }
  
  analogWrite(PIN_SPEED, targetSpeed);
}

void alternativeStartMethod2(int targetSpeed, bool direction) {
  // Метод 2: Короткие импульсы для "раскачки"
  Serial.println(F("\nМетод 2: Импульсная раскачка"));
  
  unlockSafetyStart();
  digitalWrite(PIN_DIR, direction ? HIGH : LOW);
  delay(100);
  analogWrite(PIN_BRAKE, 0);
  delay(50);
  
  // Даем несколько коротких импульсов
  for (int i = 0; i < 5; i++) {
    analogWrite(PIN_SPEED, 150);
    delay(100);
    analogWrite(PIN_SPEED, 0);
    delay(200);
  }
  
  // Затем плавный старт
  for (int speed = 50; speed <= targetSpeed; speed += 10) {
    analogWrite(PIN_SPEED, speed);
    delay(80);
  }
  
  analogWrite(PIN_SPEED, targetSpeed);
}

void alternativeStartMethod3(int targetSpeed, bool direction) {
  // Метод 3: Старт в противоположном направлении, затем переключение
  Serial.println(F("\nМетод 3: Старт с реверсом"));
  
  unlockSafetyStart();
  
  // Сначала пробуем противоположное направление
  digitalWrite(PIN_DIR, !direction ? HIGH : LOW);
  delay(100);
  analogWrite(PIN_BRAKE, 0);
  analogWrite(PIN_SPEED, 80);
  delay(300);
  analogWrite(PIN_SPEED, 0);
  delay(200);
  
  // Затем правильное направление
  digitalWrite(PIN_DIR, direction ? HIGH : LOW);
  delay(100);
  analogWrite(PIN_SPEED, targetSpeed);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_DIR, OUTPUT);
  pinMode(PIN_ENCODER, INPUT_PULLUP);
  
  Serial.println(F("\n=== ДИАГНОСТИКА И АЛЬТЕРНАТИВНЫЕ МЕТОДЫ ===\n"));
  Serial.println(F("Нажмите любую клавишу для начала...\n"));
  
  while (Serial.available() == 0) delay(100);
  Serial.read();
}

void loop() {
  // Шаг 1: Проверка датчиков Холла
  checkHallSensors();
  
  delay(2000);
  
  Serial.println(F("\n=== ТЕСТ АЛЬТЕРНАТИВНЫХ МЕТОДОВ СТАРТА ===\n"));
  Serial.println(F("Мотор должен быть НЕПОДВИЖНЫМ перед каждым тестом!\n"));
  
  delay(3000);
  
  // Метод 1
  Serial.println(F("--- ТЕСТ МЕТОДА 1 ---"));
  alternativeStartMethod1(60, true);
  delay(3000);
  analogWrite(PIN_SPEED, 0);
  delay(2000);
  
  Serial.println(F("\nНажмите любую клавишу для следующего теста..."));
  while (Serial.available() == 0) delay(100);
  Serial.read();
  
  // Метод 2
  Serial.println(F("\n--- ТЕСТ МЕТОДА 2 ---"));
  alternativeStartMethod2(60, true);
  delay(3000);
  analogWrite(PIN_SPEED, 0);
  delay(2000);
  
  Serial.println(F("\nНажмите любую клавишу для следующего теста..."));
  while (Serial.available() == 0) delay(100);
  Serial.read();
  
  // Метод 3
  Serial.println(F("\n--- ТЕСТ МЕТОДА 3 ---"));
  alternativeStartMethod3(60, true);
  delay(3000);
  analogWrite(PIN_SPEED, 0);
  delay(2000);
  
  Serial.println(F("\n=== ТЕСТЫ ЗАВЕРШЕНЫ ==="));
  Serial.println(F("\nЕсли ни один метод не помог, возможные причины:"));
  Serial.println(F("1. Датчики Холла не работают или повреждены"));
  Serial.println(F("2. Недостаточное напряжение питания (проверьте 36V)"));
  Serial.println(F("3. Недостаточный ток (мотор требует больше тока)"));
  Serial.println(F("4. Проблема с самим драйвером"));
  Serial.println(F("5. Мотор несовместим с драйвером"));
  
  Serial.println(F("\n--- Повтор через 10 сек ---\n"));
  delay(10000);
}
