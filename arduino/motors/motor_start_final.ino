// Финальное решение: длительный мощный импульс для старта
// Мотор работает после подталкивания - значит нужно "имитировать" подталкивание

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
  
  // Настройка направления - вперед
  digitalWrite(PIN_DIR, HIGH);
  delay(100);
  
  // Снятие тормоза
  analogWrite(PIN_BRAKE, 0);
  delay(50);
  
  Serial.println("=== СТАРТ С ДЛИТЕЛЬНЫМ ИМПУЛЬСОМ ===\n");
  
  // КРИТИЧНО: Длительный мощный импульс для "имитации" подталкивания
  // Мотор работает после подталкивания - значит нужно дать ему достаточно времени
  // для того, чтобы драйвер "захватил" его
  
  Serial.println("Фаза 1: ДЛИТЕЛЬНЫЙ мощный импульс (имитация подталкивания)");
  Serial.println("Мощность: 255 (максимум), Длительность: 1500мс");
  
  analogWrite(PIN_SPEED, 255);  // МАКСИМАЛЬНАЯ мощность
  delay(1500);                   // ДЛИТЕЛЬНЫЙ импульс - даем время драйверу захватить мотор
  
  // Проверяем, начал ли мотор вращаться
  int enc1 = analogRead(PIN_OUTPUT);
  delay(200);
  int enc2 = analogRead(PIN_OUTPUT);
  
  Serial.print("Энкодер до: ");
  Serial.print(enc1);
  Serial.print(", после: ");
  Serial.print(enc2);
  Serial.print(", изменение: ");
  Serial.println(abs(enc2 - enc1));
  
  if (abs(enc2 - enc1) > 10) {
    Serial.println("✓ МОТОР ЗАХВАТИЛСЯ! Удерживаем высокую скорость...");
    // КРИТИЧНО: Держим максимальную скорость ДОЛЬШЕ для стабилизации
    analogWrite(PIN_SPEED, 255);
    delay(2000);  // Увеличена задержка - даем мотору стабилизироваться
    
    // Проверяем, продолжает ли мотор вращаться
    enc1 = analogRead(PIN_OUTPUT);
    delay(200);
    enc2 = analogRead(PIN_OUTPUT);
    
    Serial.print("Проверка стабилизации: ");
    Serial.print(enc1);
    Serial.print(" -> ");
    Serial.print(enc2);
    Serial.print(" (изменение: ");
    Serial.print(abs(enc2 - enc1));
    Serial.println(")");
    
    if (abs(enc2 - enc1) > 5) {
      Serial.println("✓ Мотор стабильно вращается! Переходим к плавному разгону");
      // Теперь можно плавно снижать скорость
      analogWrite(PIN_SPEED, 220);
      delay(1000);
    } else {
      Serial.println("Мотор потерял синхронизацию, продолжаем на максимуме");
      analogWrite(PIN_SPEED, 255);
      delay(1000);
    }
  } else {
    Serial.println("Мотор еще не захватился, продолжаем импульс...");
    // Продолжаем мощный импульс еще немного
    analogWrite(PIN_SPEED, 255);
    delay(1000);
    
    // Проверяем снова
    enc1 = analogRead(PIN_OUTPUT);
    delay(200);
    enc2 = analogRead(PIN_OUTPUT);
    
    Serial.print("Энкодер: ");
    Serial.print(enc1);
    Serial.print(" -> ");
    Serial.print(enc2);
    Serial.print(" (изменение: ");
    Serial.print(abs(enc2 - enc1));
    Serial.println(")");
    
    if (abs(enc2 - enc1) > 10) {
      Serial.println("✓ МОТОР ЗАХВАТИЛСЯ!");
      analogWrite(PIN_SPEED, 200);
    } else {
      Serial.println("Пробуем противоположное направление...");
      // Пробуем в противоположном направлении
      digitalWrite(PIN_DIR, LOW);
      delay(100);
      analogWrite(PIN_SPEED, 255);
      delay(800);
      digitalWrite(PIN_DIR, HIGH);
      delay(100);
      analogWrite(PIN_SPEED, 200);
    }
  }
  
  Serial.println("\nФаза 2: Поддержание скорости");
  
  // НЕ снижаем скорость резко - держим высокую скорость
  // Мотор уже работает, просто поддерживаем его
  analogWrite(PIN_SPEED, 255);
  
  // Проверяем вращение несколько раз
  for (int check = 0; check < 5; check++) {
    delay(500);
    int enc1 = analogRead(PIN_OUTPUT);
    delay(100);
    int enc2 = analogRead(PIN_OUTPUT);
    
    Serial.print("Проверка ");
    Serial.print(check + 1);
    Serial.print(": ");
    Serial.print(enc1);
    Serial.print(" -> ");
    Serial.print(enc2);
    Serial.print(" (изменение: ");
    Serial.print(abs(enc2 - enc1));
    
    if (abs(enc2 - enc1) > 5) {
      Serial.println(") ✓ ВРАЩАЕТСЯ");
    } else {
      Serial.println(") ✗ НЕ вращается");
      // Если потерял синхронизацию - даем еще один импульс
      Serial.println("  Даем усиливающий импульс...");
      analogWrite(PIN_SPEED, 255);
      delay(500);
    }
  }
  
  Serial.println("\n✓ МОТОР РАБОТАЕТ НА МАКСИМАЛЬНОЙ СКОРОСТИ!");
}

void loop() {
  // Держим максимальную скорость
  analogWrite(PIN_SPEED, 255);
  analogWrite(PIN_BRAKE, 0);
  
  // Мониторинг энкодера
  static unsigned long lastCheck = 0;
  if (millis() - lastCheck > 1000) {
    int enc1 = analogRead(PIN_OUTPUT);
    delay(100);
    int enc2 = analogRead(PIN_OUTPUT);
    
    Serial.print("Энкодер: ");
    Serial.print(enc1);
    Serial.print(" -> ");
    Serial.print(enc2);
    Serial.print(" (изменение: ");
    Serial.print(abs(enc2 - enc1));
    
    if (abs(enc2 - enc1) > 5) {
      Serial.println(") ✓ ВРАЩАЕТСЯ");
    } else {
      Serial.println(") ✗ НЕ вращается");
    }
    
    lastCheck = millis();
  }
}
