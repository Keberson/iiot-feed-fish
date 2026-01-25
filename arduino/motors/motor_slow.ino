// Медленное управление мотором для тестирования
// Скорость настроена на медленное движение

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

void forceStart(int targetSpeed, bool direction) {
  // Агрессивный старт для запуска из неподвижного состояния
  unlockSafetyStart();
  
  digitalWrite(PIN_DIR, direction ? HIGH : LOW);
  delay(100);
  analogWrite(PIN_BRAKE, 0);
  delay(50);
  
  // Стратегия 1: Начальный импульс для "раскачки"
  Serial.println(F("  Начальный импульс..."));
  analogWrite(PIN_SPEED, 80);  // Средняя скорость для старта
  delay(200);  // Держим 200мс
  
  // Стратегия 2: Небольшая пауза для синхронизации
  analogWrite(PIN_SPEED, 40);  // Снижаем до минимума
  delay(100);
  
  // Стратегия 3: Плавное увеличение до целевой скорости
  Serial.println(F("  Плавный разгон..."));
  int steps = 15;
  int stepSize = (targetSpeed - 40) / steps;
  
  for (int i = 1; i <= steps; i++) {
    int currentSpeed = 40 + (stepSize * i);
    analogWrite(PIN_SPEED, currentSpeed);
    delay(30);
  }
  
  analogWrite(PIN_SPEED, targetSpeed);
  Serial.println(F("  Старт завершен"));
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_DIR, OUTPUT);
  pinMode(PIN_ENCODER, INPUT_PULLUP);
  
  Serial.println(F("\n=== МЕДЛЕННОЕ УПРАВЛЕНИЕ МОТОРОМ ===\n"));
  Serial.println(F("Скорость: МЕДЛЕННАЯ (для тестирования)\n"));
  unlockSafetyStart();
  Serial.println(F("Готов к работе\n"));
}

void loop() {
  // ВПЕРЕД - с принудительным стартом
  Serial.println(F("\n=== ВПЕРЕД (медленно) ==="));
  forceStart(60, true);  // Медленная скорость 60 из 255
  delay(5000);  // Движение 5 секунд
  analogWrite(PIN_SPEED, 0);
  delay(1000);
  
  // СТОП
  Serial.println(F("Стоп"));
  analogWrite(PIN_BRAKE, 100);
  delay(2000);
  analogWrite(PIN_BRAKE, 0);
  delay(1000);
  
  // НАЗАД - с принудительным стартом
  Serial.println(F("\n=== НАЗАД (медленно) ==="));
  forceStart(60, false);
  delay(5000);
  analogWrite(PIN_SPEED, 0);
  delay(1000);
  
  // СТОП
  Serial.println(F("Стоп"));
  analogWrite(PIN_BRAKE, 100);
  delay(2000);
  analogWrite(PIN_BRAKE, 0);
  delay(1000);
  
  Serial.println(F("\n--- Цикл завершен, повтор через 3 сек ---\n"));
  delay(3000);
}
