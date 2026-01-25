// Автостарт мотора из неподвижного состояния
// Использует несколько стратегий для надежного запуска

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

bool checkIfRotating() {
  // Быстрая проверка, вращается ли мотор
  bool lastState = digitalRead(PIN_ENCODER);
  int changes = 0;
  
  for (int i = 0; i < 50; i++) {
    bool currentState = digitalRead(PIN_ENCODER);
    if (currentState != lastState) {
      changes++;
      lastState = currentState;
    }
    delay(2);
  }
  return (changes > 3);
}

void aggressiveStart(int targetSpeed, bool direction) {
  unlockSafetyStart();
  
  digitalWrite(PIN_DIR, direction ? HIGH : LOW);
  delay(100);
  analogWrite(PIN_BRAKE, 0);
  delay(50);
  
  Serial.print(F("Старт "));
  Serial.println(direction ? F("вперед") : F("назад"));
  
  // Стратегия: Несколько попыток с разной мощностью
  for (int attempt = 1; attempt <= 3; attempt++) {
    Serial.print(F("  Попытка "));
    Serial.print(attempt);
    Serial.print(F(": "));
    
    // Увеличиваем начальный импульс с каждой попыткой
    int startImpulse = 60 + (attempt * 20);  // 80, 100, 120
    
    analogWrite(PIN_SPEED, startImpulse);
    delay(300);  // Держим импульс
    
    // Проверяем, начал ли мотор вращаться
    if (checkIfRotating()) {
      Serial.println(F("УСПЕХ! Мотор вращается"));
      // Плавно переходим к целевой скорости
      int steps = 10;
      int stepSize = (targetSpeed - startImpulse) / steps;
      for (int i = 1; i <= steps; i++) {
        int currentSpeed = startImpulse + (stepSize * i);
        if (currentSpeed > targetSpeed) currentSpeed = targetSpeed;
        analogWrite(PIN_SPEED, currentSpeed);
        delay(40);
      }
      analogWrite(PIN_SPEED, targetSpeed);
      return;  // Успешно стартовали
    }
    
    Serial.println(F("не стартовал"));
    analogWrite(PIN_SPEED, 0);
    delay(200);
    
    // Если не получилось, пробуем в другую сторону (только для первой попытки)
    if (attempt == 1) {
      Serial.println(F("  Пробуем противоположное направление..."));
      digitalWrite(PIN_DIR, !direction ? HIGH : LOW);
      delay(100);
      analogWrite(PIN_SPEED, startImpulse);
      delay(300);
      if (checkIfRotating()) {
        Serial.println(F("УСПЕХ в противоположном направлении!"));
        // Меняем направление обратно и продолжаем
        digitalWrite(PIN_DIR, direction ? HIGH : LOW);
        delay(100);
        analogWrite(PIN_SPEED, targetSpeed);
        return;
      }
      analogWrite(PIN_SPEED, 0);
      delay(200);
      digitalWrite(PIN_DIR, direction ? HIGH : LOW);
      delay(100);
    }
  }
  
  // Если все попытки не удались, просто устанавливаем целевую скорость
  Serial.println(F("  Устанавливаем целевую скорость..."));
  analogWrite(PIN_SPEED, targetSpeed);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_DIR, OUTPUT);
  pinMode(PIN_ENCODER, INPUT_PULLUP);
  
  Serial.println(F("\n=== АВТОСТАРТ МОТОРА ===\n"));
  Serial.println(F("Мотор должен стартовать из неподвижного состояния\n"));
}

void loop() {
  // ВПЕРЕД
  Serial.println(F("\n=== ВПЕРЕД ==="));
  aggressiveStart(60, true);  // Медленная скорость
  delay(5000);
  analogWrite(PIN_SPEED, 0);
  delay(1000);
  
  // СТОП
  Serial.println(F("Стоп"));
  analogWrite(PIN_BRAKE, 100);
  delay(2000);
  analogWrite(PIN_BRAKE, 0);
  delay(2000);  // Пауза перед следующим стартом
  
  // НАЗАД
  Serial.println(F("\n=== НАЗАД ==="));
  aggressiveStart(60, false);
  delay(5000);
  analogWrite(PIN_SPEED, 0);
  delay(1000);
  
  // СТОП
  Serial.println(F("Стоп"));
  analogWrite(PIN_BRAKE, 100);
  delay(2000);
  analogWrite(PIN_BRAKE, 0);
  delay(2000);
  
  Serial.println(F("\n--- Повтор через 3 сек ---\n"));
  delay(3000);
}
