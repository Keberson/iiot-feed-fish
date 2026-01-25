// Диагностический скетч для проверки подключения драйвера JYQD_YL02D
// Используйте этот код для проверки правильности подключений

#define PIN_SPEED 9    // 1VR - скорость (PWM)
#define PIN_DIR   7    // 1Z/F - направление
#define PIN_BRAKE 10   // 1EL - тормоз (PWM)
#define PIN_ENCODER 4  // 1M - энкодер

void setup() {
  Serial.begin(115200);
  
  pinMode(PIN_DIR, OUTPUT);
  pinMode(PIN_ENCODER, INPUT_PULLUP);
  
  Serial.println("=== ДИАГНОСТИКА ДРАЙВЕРА JYQD_YL02D ===");
  Serial.println();
  
  // Проверка 1: Инициализация
  Serial.println("1. Инициализация...");
  digitalWrite(PIN_DIR, LOW);
  analogWrite(PIN_SPEED, 0);
  analogWrite(PIN_BRAKE, 0);
  delay(500);
  Serial.println("   OK");
  
  // Проверка 2: Разблокировка Safety Start
  Serial.println("2. Разблокировка Safety Start...");
  analogWrite(PIN_BRAKE, 128);
  delay(300);
  analogWrite(PIN_BRAKE, 0);
  delay(300);
  Serial.println("   OK");
  
  // Проверка 3: Проверка направления (вперед)
  Serial.println("3. Тест направления ВПЕРЕД...");
  digitalWrite(PIN_DIR, HIGH);
  delay(100);
  analogWrite(PIN_SPEED, 100);  // Низкая скорость для безопасности
  Serial.println("   Должен вращаться ВПЕРЕД");
  delay(2000);
  analogWrite(PIN_SPEED, 0);
  delay(500);
  
  // Проверка 4: Проверка направления (назад)
  Serial.println("4. Тест направления НАЗАД...");
  digitalWrite(PIN_DIR, LOW);
  delay(100);
  analogWrite(PIN_SPEED, 100);
  Serial.println("   Должен вращаться НАЗАД");
  delay(2000);
  analogWrite(PIN_SPEED, 0);
  delay(500);
  
  // Проверка 5: Проверка тормоза
  Serial.println("5. Тест тормоза...");
  digitalWrite(PIN_DIR, HIGH);
  analogWrite(PIN_SPEED, 150);
  delay(1000);
  Serial.println("   Применение тормоза...");
  analogWrite(PIN_BRAKE, 200);
  delay(2000);
  analogWrite(PIN_BRAKE, 0);
  analogWrite(PIN_SPEED, 0);
  delay(500);
  
  // Проверка 6: Проверка энкодера
  Serial.println("6. Проверка энкодера...");
  Serial.println("   Вращайте мотор вручную и наблюдайте за импульсами");
  digitalWrite(PIN_DIR, HIGH);
  analogWrite(PIN_SPEED, 50);  // Очень низкая скорость
  
  unsigned long startTime = millis();
  int pulseCount = 0;
  bool lastState = digitalRead(PIN_ENCODER);
  
  while (millis() - startTime < 5000) {
    bool currentState = digitalRead(PIN_ENCODER);
    if (currentState != lastState) {
      pulseCount++;
      lastState = currentState;
      Serial.print("   Импульс #");
      Serial.println(pulseCount);
    }
    delay(10);
  }
  
  analogWrite(PIN_SPEED, 0);
  Serial.print("   Всего импульсов за 5 сек: ");
  Serial.println(pulseCount);
  
  Serial.println();
  Serial.println("=== ДИАГНОСТИКА ЗАВЕРШЕНА ===");
  Serial.println();
  Serial.println("РЕКОМЕНДАЦИИ:");
  Serial.println("- Если мотор не вращался, проверьте:");
  Serial.println("  1. Питание драйвера (36V подключено к P+ и P-)");
  Serial.println("  2. Подключение датчиков Холла (1Ha, 1Hb, 1Hc к драйверу)");
  Serial.println("  3. Подключение фаз мотора (1MA, 1MB, 1MC)");
  Serial.println("  4. Общую землю (GND) между Arduino и драйвером");
  Serial.println("  5. Потенциометр на блоке питания - возможно, он регулирует напряжение");
  Serial.println("- Если энкодер не выдает импульсы, проверьте подключение 1M");
}

void loop() {
  // В цикле просто выводим состояние энкодера
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 1000) {
    Serial.print("Энкодер: ");
    Serial.println(digitalRead(PIN_ENCODER));
    lastPrint = millis();
  }
}
