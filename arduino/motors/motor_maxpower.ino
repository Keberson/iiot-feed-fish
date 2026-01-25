// Максимально агрессивный старт с полной мощностью
// Используется когда обычные методы не работают

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

void maxPowerStart(bool direction) {
  unlockSafetyStart();
  
  digitalWrite(PIN_DIR, direction ? HIGH : LOW);
  delay(100);
  analogWrite(PIN_BRAKE, 0);
  delay(50);
  
  Serial.print(F("МАКСИМАЛЬНЫЙ СТАРТ "));
  Serial.println(direction ? F("ВПЕРЕД") : F("НАЗАД"));
  
  // Максимальная мощность на короткое время
  Serial.println(F("  Полная мощность (255)..."));
  analogWrite(PIN_SPEED, 255);
  delay(500);  // Держим максимальную мощность 500мс
  
  // Затем снижаем до рабочей скорости
  Serial.println(F("  Снижение до рабочей скорости..."));
  for (int speed = 255; speed >= 80; speed -= 10) {
    analogWrite(PIN_SPEED, speed);
    delay(50);
  }
  
  analogWrite(PIN_SPEED, 80);
  Serial.println(F("  Рабочая скорость установлена"));
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_DIR, OUTPUT);
  pinMode(PIN_ENCODER, INPUT_PULLUP);
  
  Serial.println(F("\n=== МАКСИМАЛЬНАЯ МОЩНОСТЬ СТАРТА ===\n"));
  Serial.println(F("ВНИМАНИЕ: Используется полная мощность!\n"));
  Serial.println(F("Нажмите любую клавишу для старта...\n"));
  
  while (Serial.available() == 0) delay(100);
  Serial.read();
}

void loop() {
  // ВПЕРЕД с максимальной мощностью
  Serial.println(F("\n=== ВПЕРЕД ==="));
  maxPowerStart(true);
  delay(5000);
  analogWrite(PIN_SPEED, 0);
  delay(2000);
  
  // СТОП
  Serial.println(F("Стоп"));
  analogWrite(PIN_BRAKE, 150);
  delay(2000);
  analogWrite(PIN_BRAKE, 0);
  delay(2000);
  
  // НАЗАД с максимальной мощностью
  Serial.println(F("\n=== НАЗАД ==="));
  maxPowerStart(false);
  delay(5000);
  analogWrite(PIN_SPEED, 0);
  delay(2000);
  
  // СТОП
  Serial.println(F("Стоп"));
  analogWrite(PIN_BRAKE, 150);
  delay(2000);
  analogWrite(PIN_BRAKE, 0);
  delay(2000);
  
  Serial.println(F("\n--- Повтор через 3 сек ---\n"));
  delay(3000);
}
