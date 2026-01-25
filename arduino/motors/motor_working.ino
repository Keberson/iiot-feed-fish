// Рабочий код: длительный импульс + удержание максимальной скорости
// Мотор захватывается, но теряет синхронизацию - нужно дольше держать максимум

#define PIN_SPEED 9
#define PIN_DIR   7
#define PIN_BRAKE 10
#define PIN_OUTPUT 4

void setup() {
  Serial.begin(115200);

  pinMode(PIN_OUTPUT, INPUT);
  pinMode(PIN_DIR, OUTPUT);
  pinMode(PIN_SPEED, OUTPUT);
  pinMode(PIN_BRAKE, OUTPUT);
  
  // Разблокировка Safety Start
  analogWrite(PIN_SPEED, 0);
  analogWrite(PIN_BRAKE, 0);
  delay(100);
  analogWrite(PIN_BRAKE, 128);
  delay(300);
  analogWrite(PIN_BRAKE, 0);
  delay(200);
  
  digitalWrite(PIN_DIR, HIGH);
  delay(100);
  analogWrite(PIN_BRAKE, 0);
  delay(50);
  
  Serial.println("=== СТАРТ МОТОРА ===\n");
  
  // Длительный мощный импульс
  Serial.println("Длительный импульс для захвата...");
  analogWrite(PIN_SPEED, 255);
  delay(2000);  // Увеличен до 2 секунд
  
  // Проверяем захват
  int enc1 = analogRead(PIN_OUTPUT);
  delay(200);
  int enc2 = analogRead(PIN_OUTPUT);
  
  Serial.print("Энкодер: ");
  Serial.print(enc1);
  Serial.print(" -> ");
  Serial.print(enc2);
  Serial.print(" (изменение: ");
  Serial.print(abs(enc2 - enc1));
  Serial.println(")");
  
  if (abs(enc2 - enc1) > 10) {
    Serial.println("✓ МОТОР ЗАХВАТИЛСЯ!");
    Serial.println("Удерживаем максимальную скорость для стабилизации...");
    
    // КРИТИЧНО: Держим максимальную скорость долго
    // Мотор теряет синхронизацию при изменении скорости
    analogWrite(PIN_SPEED, 255);
    
    // Непрерывно проверяем и подстраиваем
    for (int i = 0; i < 20; i++) {
      delay(500);
      
      enc1 = analogRead(PIN_OUTPUT);
      delay(100);
      enc2 = analogRead(PIN_OUTPUT);
      
      int change = abs(enc2 - enc1);
      
      Serial.print("Проверка ");
      Serial.print(i + 1);
      Serial.print("/20: изменение = ");
      Serial.print(change);
      
      if (change > 5) {
        Serial.println(" ✓ ВРАЩАЕТСЯ");
      } else {
        Serial.println(" ✗ Потеря синхронизации - усиливающий импульс");
        // Даем усиливающий импульс
        analogWrite(PIN_SPEED, 0);
        delay(100);
        analogWrite(PIN_SPEED, 255);
        delay(300);
      }
    }
    
    Serial.println("\n✓ МОТОР РАБОТАЕТ!");
  } else {
    Serial.println("✗ Мотор не захватился");
    Serial.println("Пробуем противоположное направление...");
    
    digitalWrite(PIN_DIR, LOW);
    delay(100);
    analogWrite(PIN_SPEED, 255);
    delay(1500);
    digitalWrite(PIN_DIR, HIGH);
    delay(100);
    analogWrite(PIN_SPEED, 255);
  }
}

void loop() {
  // Держим максимальную скорость постоянно
  analogWrite(PIN_SPEED, 255);
  analogWrite(PIN_BRAKE, 0);
  
  // Периодическая проверка и коррекция
  static unsigned long lastCheck = 0;
  if (millis() - lastCheck > 2000) {
    int enc1 = analogRead(PIN_OUTPUT);
    delay(100);
    int enc2 = analogRead(PIN_OUTPUT);
    
    int change = abs(enc2 - enc1);
    
    if (change < 3) {
      // Потеря синхронизации - даем корректирующий импульс
      analogWrite(PIN_SPEED, 0);
      delay(50);
      analogWrite(PIN_SPEED, 255);
    }
    
    lastCheck = millis();
  }
}
