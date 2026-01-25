// Улучшенное управление мотором с плавным стартом
// Решает проблему: мотор не стартует без подталкивания

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

void smoothStart(int targetSpeed, bool direction, int rampTime) {
  // Плавный старт мотора
  unlockSafetyStart();
  
  digitalWrite(PIN_DIR, direction ? HIGH : LOW);
  delay(100);
  analogWrite(PIN_BRAKE, 0);
  delay(50);
  
  // Плавное увеличение скорости
  int steps = 20;
  int stepDelay = rampTime / steps;
  int stepSize = targetSpeed / steps;
  
  for (int i = 1; i <= steps; i++) {
    int currentSpeed = stepSize * i;
    analogWrite(PIN_SPEED, currentSpeed);
    delay(stepDelay);
  }
  
  analogWrite(PIN_SPEED, targetSpeed);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_DIR, OUTPUT);
  pinMode(PIN_ENCODER, INPUT_PULLUP);
  
  Serial.println(F("\n=== УЛУЧШЕННОЕ УПРАВЛЕНИЕ МОТОРОМ ===\n"));
  Serial.println(F("Команды:"));
  Serial.println(F("  f - вперед (плавный старт)"));
  Serial.println(F("  b - назад (плавный старт)"));
  Serial.println(F("  s - стоп"));
  Serial.println(F("  t - тест автостарта"));
  Serial.println(F("  r - резкий старт (для сравнения)\n"));
}

void loop() {
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    
    switch(cmd) {
      case 'f':
      case 'F':
        Serial.println(F("ВПЕРЕД (плавный старт)"));
        smoothStart(180, true, 500); // Плавный разгон за 500мс до скорости 180
        Serial.println(F("Старт выполнен"));
        break;
        
      case 'b':
      case 'B':
        Serial.println(F("НАЗАД (плавный старт)"));
        smoothStart(180, false, 500);
        Serial.println(F("Старт выполнен"));
        break;
        
      case 's':
      case 'S':
        Serial.println(F("СТОП"));
        analogWrite(PIN_SPEED, 0);
        delay(100);
        analogWrite(PIN_BRAKE, 150);
        delay(200);
        analogWrite(PIN_BRAKE, 0);
        break;
        
      case 't':
      case 'T':
        Serial.println(F("ТЕСТ АВТОСТАРТА..."));
        Serial.println(F("Попытка 1: Плавный старт"));
        smoothStart(150, true, 800);
        delay(3000);
        analogWrite(PIN_SPEED, 0);
        delay(1000);
        
        Serial.println(F("Попытка 2: Средний старт"));
        smoothStart(150, true, 400);
        delay(3000);
        analogWrite(PIN_SPEED, 0);
        delay(1000);
        
        Serial.println(F("Попытка 3: Быстрый старт"));
        smoothStart(150, true, 200);
        delay(3000);
        analogWrite(PIN_SPEED, 0);
        Serial.println(F("Тест завершен"));
        break;
        
      case 'r':
      case 'R':
        Serial.println(F("РЕЗКИЙ СТАРТ (для сравнения)"));
        unlockSafetyStart();
        digitalWrite(PIN_DIR, HIGH);
        delay(100);
        analogWrite(PIN_BRAKE, 0);
        analogWrite(PIN_SPEED, 150);
        break;
        
      default:
        Serial.println(F("Неизвестная команда"));
    }
  }
  
  // Автоматический тест при первом запуске
  static bool firstRun = true;
  if (firstRun) {
    firstRun = false;
    delay(2000);
    Serial.println(F("\nАвтоматический тест старта через 3 сек..."));
    delay(3000);
    Serial.println(F("СТАРТ!"));
    smoothStart(150, true, 600);
    delay(5000);
    analogWrite(PIN_SPEED, 0);
    Serial.println(F("Тест завершен. Используйте команды для управления."));
  }
}
