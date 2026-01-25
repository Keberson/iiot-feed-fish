// Тест для определения правильного подключения датчиков Холла
// Помогает понять, нужно ли переключать датчики

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

bool testStartup(bool direction) {
  // Тест автостарта в заданном направлении
  unlockSafetyStart();
  
  digitalWrite(PIN_DIR, direction ? HIGH : LOW);
  delay(100);
  analogWrite(PIN_BRAKE, 0);
  delay(50);
  
  // Пробуем старт с разной мощностью
  bool started = false;
  
  for (int power = 100; power <= 200; power += 20) {
    analogWrite(PIN_SPEED, power);
    delay(400);
    
    // Проверяем, начал ли мотор вращаться
    bool lastState = digitalRead(PIN_ENCODER);
    int changes = 0;
    for (int i = 0; i < 30; i++) {
      bool currentState = digitalRead(PIN_ENCODER);
      if (currentState != lastState) {
        changes++;
        lastState = currentState;
      }
      delay(5);
    }
    
    if (changes > 5) {
      started = true;
      analogWrite(PIN_SPEED, 0);
      break;
    }
  }
  
  analogWrite(PIN_SPEED, 0);
  delay(200);
  return started;
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_DIR, OUTPUT);
  pinMode(PIN_ENCODER, INPUT_PULLUP);
  
  Serial.println(F("\n=== ТЕСТ ПОДКЛЮЧЕНИЯ ДАТЧИКОВ ХОЛЛА ===\n"));
  Serial.println(F("Этот тест поможет определить, нужно ли"));
  Serial.println(F("переключать провода датчиков Холла.\n"));
  Serial.println(F("Нажмите любую клавишу для начала теста...\n"));
  
  while (Serial.available() == 0) delay(100);
  Serial.read();
}

void loop() {
  Serial.println(F("\n=== ТЕСТ АВТОСТАРТА ===\n"));
  
  // Тест 1: Вперед
  Serial.print(F("Тест ВПЕРЕД: "));
  bool forwardOK = testStartup(true);
  if (forwardOK) {
    Serial.println(F("ОК - мотор стартовал!"));
  } else {
    Serial.println(F("FAIL - мотор НЕ стартовал"));
    Serial.println(F("  -> Нужно переключить датчики Холла"));
  }
  delay(2000);
  
  // Тест 2: Назад
  Serial.print(F("Тест НАЗАД: "));
  bool backwardOK = testStartup(false);
  if (backwardOK) {
    Serial.println(F("ОК - мотор стартовал!"));
  } else {
    Serial.println(F("FAIL - мотор НЕ стартовал"));
    Serial.println(F("  -> Нужно переключить датчики Холла"));
  }
  delay(2000);
  
  // Резюме
  Serial.println(F("\n=== РЕЗУЛЬТАТ ==="));
  if (forwardOK && backwardOK) {
    Serial.println(F("✓ ОТЛИЧНО! Мотор стартует в обоих направлениях."));
    Serial.println(F("  Подключение датчиков Холла ПРАВИЛЬНОЕ!"));
    Serial.println(F("\nМожно использовать основной код управления."));
  } else if (forwardOK || backwardOK) {
    Serial.println(F("⚠ ЧАСТИЧНО: Мотор стартует только в одном направлении."));
    Serial.println(F("  Рекомендуется переключить датчики Холла для"));
    Serial.println(F("  работы в обоих направлениях."));
  } else {
    Serial.println(F("✗ ПРОБЛЕМА: Мотор НЕ стартует ни в одном направлении."));
    Serial.println(F("\nНУЖНО ПЕРЕКЛЮЧИТЬ ДАТЧИКИ ХОЛЛА!"));
    Serial.println(F("\nИнструкция:"));
    Serial.println(F("1. Отключите питание драйвера"));
    Serial.println(F("2. Поменяйте местами два провода датчиков:"));
    Serial.println(F("   - Вариант A: 1Ha <-> 1Hb"));
    Serial.println(F("   - Вариант B: 1Hb <-> 1Hc"));
    Serial.println(F("   - Вариант C: 1Ha <-> 1Hc"));
    Serial.println(F("3. Включите питание и запустите этот тест снова"));
  }
  
  Serial.println(F("\n--- Повтор теста через 5 сек ---\n"));
  delay(5000);
}
