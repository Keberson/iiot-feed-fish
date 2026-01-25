// Улучшенная версия с импульсной раскачкой и увеличенной начальной скоростью
// Для случаев, когда мотор только дергается, но не начинает вращаться

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

void improvedStart(int targetSpeed, bool direction) {
  unlockSafetyStart();
  
  digitalWrite(PIN_DIR, direction ? HIGH : LOW);
  delay(100);
  analogWrite(PIN_BRAKE, 0);
  delay(50);
  
  Serial.print(F("Улучшенный старт "));
  Serial.print(direction ? F("вперед") : F("назад"));
  Serial.print(F(" до "));
  Serial.println(targetSpeed);
  
  // Фаза 1: Импульсная раскачка (3 импульса)
  Serial.println(F("  Фаза 1: Импульсная раскачка"));
  for (int pulse = 0; pulse < 3; pulse++) {
    Serial.print(F("    Импульс "));
    Serial.print(pulse + 1);
    Serial.print(F(": мощность 80"));
    analogWrite(PIN_SPEED, 80);
    delay(200);  // Держим импульс дольше
    analogWrite(PIN_SPEED, 40);
    delay(150);
    Serial.println(F(" OK"));
  }
  analogWrite(PIN_SPEED, 0);
  delay(300);  // Пауза после раскачки
  
  // Фаза 2: Медленный старт с увеличенной начальной скоростью
  Serial.println(F("  Фаза 2: Медленный разгон"));
  int startSpeed = 50;  // Увеличена начальная скорость
  int stepSize = 10;    // Увеличен шаг
  
  for (int speed = startSpeed; speed <= targetSpeed; speed += stepSize) {
    analogWrite(PIN_SPEED, speed);
    delay(200);  // Увеличена задержка для синхронизации
    
    // Проверяем вращение
    bool lastState = digitalRead(PIN_ENCODER);
    int changes = 0;
    unsigned long checkStart = millis();
    
    while (millis() - checkStart < 300) {  // Проверяем 300мс
      bool currentState = digitalRead(PIN_ENCODER);
      if (currentState != lastState) {
        changes++;
        lastState = currentState;
      }
      delay(5);
    }
    
    Serial.print(F("    Скорость "));
    Serial.print(speed);
    Serial.print(F(": "));
    Serial.print(changes);
    Serial.println(F(" импульсов"));
    
    // Если мотор начал вращаться
    if (changes > 4) {
      Serial.print(F("  ✓ ЗАХВАТ на скорости "));
      Serial.println(speed);
      // Быстро доводим до целевой скорости
      for (int s = speed + stepSize; s <= targetSpeed; s += 15) {
        analogWrite(PIN_SPEED, s);
        delay(50);
      }
      analogWrite(PIN_SPEED, targetSpeed);
      Serial.println(F("  Старт успешен!"));
      return;
    }
    
    // Если на скорости 80+ еще не захватило, даем усиленный импульс
    if (speed >= 80 && changes == 0) {
      Serial.println(F("    Усиленный импульс..."));
      analogWrite(PIN_SPEED, speed + 30);
      delay(300);
      analogWrite(PIN_SPEED, speed);
      delay(200);
      
      // Проверяем снова
      lastState = digitalRead(PIN_ENCODER);
      changes = 0;
      checkStart = millis();
      while (millis() - checkStart < 300) {
        bool currentState = digitalRead(PIN_ENCODER);
        if (currentState != lastState) {
          changes++;
          lastState = currentState;
        }
        delay(5);
      }
      
      if (changes > 4) {
        Serial.print(F("  ✓ ЗАХВАТ после усиления на скорости "));
        Serial.println(speed);
        for (int s = speed + stepSize; s <= targetSpeed; s += 15) {
          analogWrite(PIN_SPEED, s);
          delay(50);
        }
        analogWrite(PIN_SPEED, targetSpeed);
        return;
      }
    }
  }
  
  // Если дошли до конца
  Serial.println(F("  Установка целевой скорости..."));
  analogWrite(PIN_SPEED, targetSpeed);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_DIR, OUTPUT);
  pinMode(PIN_ENCODER, INPUT_PULLUP);
  
  Serial.println(F("\n=== УЛУЧШЕННОЕ УПРАВЛЕНИЕ МОТОРОМ V2 ===\n"));
  Serial.println(F("Использует импульсную раскачку и улучшенный алгоритм\n"));
  unlockSafetyStart();
  Serial.println(F("Готов к работе\n"));
}

void loop() {
  // ВПЕРЕД
  Serial.println(F("\n=== ВПЕРЕД ==="));
  improvedStart(80, true);  // Увеличена целевая скорость до 80
  delay(5000);
  analogWrite(PIN_SPEED, 0);
  delay(1000);
  
  // СТОП
  Serial.println(F("Стоп"));
  analogWrite(PIN_BRAKE, 100);
  delay(2000);
  analogWrite(PIN_BRAKE, 0);
  delay(2000);
  
  // НАЗАД
  Serial.println(F("\n=== НАЗАД ==="));
  improvedStart(80, false);
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
