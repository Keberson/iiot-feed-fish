// Финальный рабочий код управления мотором
// Использует очень медленный старт (метод 1) для надежного автостарта

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

void reliableStart(int targetSpeed, bool direction) {
  // Улучшенный старт с импульсной раскачкой
  unlockSafetyStart();
  
  digitalWrite(PIN_DIR, direction ? HIGH : LOW);
  delay(100);
  analogWrite(PIN_BRAKE, 0);
  delay(50);
  
  Serial.print(F("Старт "));
  Serial.print(direction ? F("вперед") : F("назад"));
  Serial.print(F(" до скорости "));
  Serial.println(targetSpeed);
  
  // Шаг 1: Несколько коротких импульсов для "раскачки"
  Serial.println(F("  Импульсная раскачка..."));
  for (int i = 0; i < 3; i++) {
    analogWrite(PIN_SPEED, 60);  // Средняя мощность для импульса
    delay(150);
    analogWrite(PIN_SPEED, 30);  // Снижаем
    delay(100);
  }
  analogWrite(PIN_SPEED, 0);
  delay(200);
  
  // Шаг 2: Медленный старт с увеличенной начальной скоростью
  Serial.println(F("  Медленный разгон..."));
  for (int speed = 40; speed <= targetSpeed; speed += 8) {
    analogWrite(PIN_SPEED, speed);
    delay(150);  // Увеличена задержка для лучшей синхронизации
    
    // Проверяем вращение более тщательно
    bool lastState = digitalRead(PIN_ENCODER);
    int changes = 0;
    for (int i = 0; i < 30; i++) {  // Увеличено время проверки
      bool currentState = digitalRead(PIN_ENCODER);
      if (currentState != lastState) {
        changes++;
        lastState = currentState;
      }
      delay(5);
    }
    
    Serial.print(F("    Скорость "));
    Serial.print(speed);
    Serial.print(F(", импульсов: "));
    Serial.println(changes);
    
    // Если мотор начал вращаться, ускоряемся
    if (changes > 3) {
      Serial.print(F("  ✓ Захват на скорости "));
      Serial.println(speed);
      // Плавно доводим до целевой скорости
      for (int s = speed + 8; s <= targetSpeed; s += 10) {
        analogWrite(PIN_SPEED, s);
        delay(60);
      }
      analogWrite(PIN_SPEED, targetSpeed);
      return;
    }
    
    // Если на этой скорости не захватило, пробуем чуть больше
    if (speed >= 80 && changes == 0) {
      // Даем более сильный импульс
      analogWrite(PIN_SPEED, speed + 20);
      delay(200);
      analogWrite(PIN_SPEED, speed);
    }
  }
  
  // Если дошли до конца, устанавливаем целевую скорость
  Serial.println(F("  Установка целевой скорости..."));
  analogWrite(PIN_SPEED, targetSpeed);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_DIR, OUTPUT);
  pinMode(PIN_ENCODER, INPUT_PULLUP);
  
  Serial.println(F("\n=== УПРАВЛЕНИЕ МОТОРОМ (НАДЕЖНЫЙ СТАРТ) ===\n"));
  Serial.println(F("Используется метод медленного старта для автостарта\n"));
  unlockSafetyStart();
  Serial.println(F("Готов к работе\n"));
}

void loop() {
  // ВПЕРЕД - медленно
  Serial.println(F("=== ВПЕРЕД (медленно) ==="));
  reliableStart(60, true);  // Медленная скорость для тестирования
  delay(5000);
  analogWrite(PIN_SPEED, 0);
  delay(1000);
  
  // СТОП
  Serial.println(F("Стоп"));
  analogWrite(PIN_BRAKE, 100);
  delay(2000);
  analogWrite(PIN_BRAKE, 0);
  delay(2000);
  
  // НАЗАД - медленно
  Serial.println(F("\n=== НАЗАД (медленно) ==="));
  reliableStart(60, false);
  delay(5000);
  analogWrite(PIN_SPEED, 0);
  delay(1000);
  
  // СТОП
  Serial.println(F("Стоп"));
  analogWrite(PIN_BRAKE, 100);
  delay(2000);
  analogWrite(PIN_BRAKE, 0);
  delay(2000);
  
  Serial.println(F("\n--- Цикл завершен, повтор через 3 сек ---\n"));
  delay(3000);
}
