// Проверка работы системы без мультиметра
// Помогает определить, есть ли проблема с питанием

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
  
  Serial.println("\n=== ПРОВЕРКА СИСТЕМЫ ===\n");
  
  // Разблокировка Safety Start
  analogWrite(PIN_SPEED, 0);
  analogWrite(PIN_BRAKE, 0);
  delay(100);
  analogWrite(PIN_BRAKE, 128);
  delay(300);
  analogWrite(PIN_BRAKE, 0);
  delay(200);
  
  Serial.println("1. Safety Start разблокирован");
  
  // Настройка направления
  digitalWrite(PIN_DIR, HIGH);
  delay(100);
  Serial.println("2. Направление установлено: ВПЕРЕД");
  
  // Снятие тормоза
  analogWrite(PIN_BRAKE, 0);
  delay(50);
  Serial.println("3. Тормоз снят");
  
  Serial.println("\n=== ТЕСТ 1: Минимальная мощность ===\n");
  Serial.println("Подаем минимальную мощность (50)...");
  analogWrite(PIN_SPEED, 50);
  delay(2000);
  
  Serial.print("Энкодер: ");
  Serial.println(analogRead(PIN_OUTPUT));
  Serial.println("Мотор должен издавать звуки или слегка дергаться");
  
  delay(2000);
  
  Serial.println("\n=== ТЕСТ 2: Средняя мощность ===\n");
  Serial.println("Подаем среднюю мощность (120)...");
  analogWrite(PIN_SPEED, 120);
  delay(2000);
  
  Serial.print("Энкодер: ");
  Serial.println(analogRead(PIN_OUTPUT));
  Serial.println("Мотор должен пытаться вращаться");
  
  delay(2000);
  
  Serial.println("\n=== ТЕСТ 3: Максимальная мощность ===\n");
  Serial.println("Подаем максимальную мощность (255)...");
  analogWrite(PIN_SPEED, 255);
  delay(3000);
  
  Serial.print("Энкодер: ");
  Serial.println(analogRead(PIN_OUTPUT));
  Serial.println("Мотор должен вращаться или сильно дергаться");
  
  delay(2000);
  
  Serial.println("\n=== РЕЗУЛЬТАТЫ ===\n");
  Serial.println("Если мотор НЕ издает звуков и НЕ дергается:");
  Serial.println("  -> Проблема с питанием (блок питания не работает)");
  Serial.println("  -> Проверьте подключение питания к драйверу");
  Serial.println("  -> Возможно, блок питания поврежден");
  Serial.println("\nЕсли мотор издает звуки, но не вращается:");
  Serial.println("  -> Проблема с фазами или датчиками Холла");
  Serial.println("  -> Питание работает нормально");
  
  analogWrite(PIN_SPEED, 0);
}

void loop() {
  // Непрерывный тест
  Serial.println("\n--- Непрерывный тест ---");
  
  analogWrite(PIN_SPEED, 150);
  delay(1000);
  
  int enc1 = analogRead(PIN_OUTPUT);
  delay(100);
  int enc2 = analogRead(PIN_OUTPUT);
  
  Serial.print("Энкодер: ");
  Serial.print(enc1);
  Serial.print(" -> ");
  Serial.print(enc2);
  Serial.print(" (изменение: ");
  Serial.print(abs(enc2 - enc1));
  Serial.println(")");
  
  if (abs(enc2 - enc1) > 5) {
    Serial.println("✓ МОТОР ВРАЩАЕТСЯ!");
  } else {
    Serial.println("✗ Мотор НЕ вращается");
  }
  
  delay(2000);
}
