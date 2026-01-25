// Автоматический подбор правильного подключения фаз мотора

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

bool checkMotorRotation(int speed, int duration) {
  unsigned long startTime = millis();
  bool lastState = digitalRead(PIN_ENCODER);
  int stateChanges = 0;
  
  analogWrite(PIN_BRAKE, 0);
  delay(50);
  analogWrite(PIN_SPEED, speed);
  
  while (millis() - startTime < duration) {
    bool currentState = digitalRead(PIN_ENCODER);
    if (currentState != lastState) {
      stateChanges++;
      lastState = currentState;
    }
    delay(5);
  }
  
  analogWrite(PIN_SPEED, 0);
  delay(100);
  return (stateChanges > 10);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_DIR, OUTPUT);
  pinMode(PIN_ENCODER, INPUT_PULLUP);
  
  Serial.println(F("\n=== ПОИСК ПРАВИЛЬНОГО ПОДКЛЮЧЕНИЯ ФАЗ ===\n"));
  unlockSafetyStart();
  Serial.println(F("Safety Start разблокирован\n"));
  Serial.println(F("ИНСТРУКЦИЯ:"));
  Serial.println(F("1. Мотор должен быть свободен"));
  Serial.println(F("2. Наблюдайте за мотором"));
  Serial.println(F("3. Если звуки есть, но нет вращения -"));
  Serial.println(F("   поменяйте провода фаз (MA, MB, MC)\n"));
  Serial.println(F("Нажмите любую клавишу для начала...\n"));
  
  while (Serial.available() == 0) delay(100);
  Serial.read();
  
  Serial.println(F("Начинаем тесты...\n"));
  
  bool rotated = false;
  
  // Тест 1: Вперед
  Serial.println(F("ТЕСТ 1: ВПЕРЕД, скорость 120"));
  digitalWrite(PIN_DIR, HIGH);
  delay(100);
  if (checkMotorRotation(120, 3000)) {
    Serial.println(F("   OK - ВРАЩАЕТСЯ!"));
    rotated = true;
  } else {
    Serial.println(F("   FAIL - не вращается"));
  }
  delay(1000);
  
  // Тест 2: Назад
  Serial.println(F("ТЕСТ 2: НАЗАД, скорость 120"));
  digitalWrite(PIN_DIR, LOW);
  delay(100);
  if (checkMotorRotation(120, 3000)) {
    Serial.println(F("   OK - ВРАЩАЕТСЯ!"));
    rotated = true;
  } else {
    Serial.println(F("   FAIL - не вращается"));
  }
  
  Serial.println(F("\n=== РЕЗУЛЬТАТЫ ==="));
  if (rotated) {
    Serial.println(F("МОТОР ВРАЩАЕТСЯ!"));
    Serial.println(F("Подключение фаз правильное."));
  } else {
    Serial.println(F("МОТОР НЕ ВРАЩАЕТСЯ"));
    Serial.println(F("\nПРОБЛЕМА: Неправильное подключение фаз"));
    Serial.println(F("\nРЕШЕНИЕ:"));
    Serial.println(F("1. Отключите питание"));
    Serial.println(F("2. Поменяйте провода фаз:"));
    Serial.println(F("   A: 1MA <-> 1MB"));
    Serial.println(F("   B: 1MB <-> 1MC"));
    Serial.println(F("   C: 1MA <-> 1MC"));
    Serial.println(F("3. Включите и повторите тест"));
  }
  Serial.println(F("\nКоманды: f=вперед, b=назад, s=стоп, t=тест"));
}

void loop() {
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    
    switch(cmd) {
      case 'f':
      case 'F':
        Serial.println(F("ВПЕРЕД"));
        unlockSafetyStart();
        digitalWrite(PIN_DIR, HIGH);
        delay(100);
        analogWrite(PIN_BRAKE, 0);
        analogWrite(PIN_SPEED, 150);
        break;
        
      case 'b':
      case 'B':
        Serial.println(F("НАЗАД"));
        unlockSafetyStart();
        digitalWrite(PIN_DIR, LOW);
        delay(100);
        analogWrite(PIN_BRAKE, 0);
        analogWrite(PIN_SPEED, 150);
        break;
        
      case 's':
      case 'S':
        Serial.println(F("СТОП"));
        analogWrite(PIN_SPEED, 0);
        analogWrite(PIN_BRAKE, 0);
        break;
        
      case 't':
      case 'T':
        Serial.println(F("ТЕСТ..."));
        unlockSafetyStart();
        digitalWrite(PIN_DIR, HIGH);
        delay(100);
        if (checkMotorRotation(150, 2000)) {
          Serial.println(F("ВРАЩАЕТСЯ!"));
        } else {
          Serial.println(F("НЕ вращается"));
        }
        break;
    }
  }
}
