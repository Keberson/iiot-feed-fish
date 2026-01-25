// Финальный код управления мотором с настраиваемой скоростью
// Использует надежный метод медленного старта

#define PIN_SPEED 9
#define PIN_DIR   7
#define PIN_BRAKE 10
#define PIN_ENCODER 4

// Настройки скорости (измените по необходимости)
#define SLOW_SPEED 60      // Медленная скорость (для тестирования)
#define MEDIUM_SPEED 120   // Средняя скорость
#define FAST_SPEED 180     // Быстрая скорость

void unlockSafetyStart() {
  analogWrite(PIN_SPEED, 0);
  analogWrite(PIN_BRAKE, 0);
  delay(100);
  analogWrite(PIN_BRAKE, 128);
  delay(300);
  analogWrite(PIN_BRAKE, 0);
  delay(200);
}

void reliableStart(int targetSpeed, bool direction) {
  unlockSafetyStart();
  
  digitalWrite(PIN_DIR, direction ? HIGH : LOW);
  delay(100);
  analogWrite(PIN_BRAKE, 0);
  delay(50);
  
  // Очень медленный старт с постепенным увеличением скорости
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
    
    // Если мотор начал вращаться, ускоряемся быстрее
    if (changes > 2) {
      for (int s = speed + 5; s <= targetSpeed; s += 10) {
        analogWrite(PIN_SPEED, s);
        delay(50);
      }
      analogWrite(PIN_SPEED, targetSpeed);
      return;
    }
  }
  
  analogWrite(PIN_SPEED, targetSpeed);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_DIR, OUTPUT);
  pinMode(PIN_ENCODER, INPUT_PULLUP);
  
  Serial.println(F("\n=== УПРАВЛЕНИЕ МОТОРОМ ===\n"));
  Serial.println(F("Команды через Serial Monitor:"));
  Serial.println(F("  f - вперед (медленно)"));
  Serial.println(F("  F - вперед (средне)"));
  Serial.println(F("  b - назад (медленно)"));
  Serial.println(F("  B - назад (средне)"));
  Serial.println(F("  s - стоп\n"));
  
  unlockSafetyStart();
  Serial.println(F("Готов к работе\n"));
}

void loop() {
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    
    switch(cmd) {
      case 'f':
        Serial.println(F("Вперед (медленно)"));
        reliableStart(SLOW_SPEED, true);
        break;
        
      case 'F':
        Serial.println(F("Вперед (средне)"));
        reliableStart(MEDIUM_SPEED, true);
        break;
        
      case 'b':
        Serial.println(F("Назад (медленно)"));
        reliableStart(SLOW_SPEED, false);
        break;
        
      case 'B':
        Serial.println(F("Назад (средне)"));
        reliableStart(MEDIUM_SPEED, false);
        break;
        
      case 's':
      case 'S':
        Serial.println(F("Стоп"));
        analogWrite(PIN_SPEED, 0);
        delay(100);
        analogWrite(PIN_BRAKE, 100);
        delay(200);
        analogWrite(PIN_BRAKE, 0);
        break;
        
      default:
        Serial.println(F("Неизвестная команда"));
    }
  }
}
