// Альтернативный вариант: несколько длительных импульсов
// Если один длительный импульс не помогает

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
  
  Serial.println("=== СТАРТ С НЕСКОЛЬКИМИ ДЛИТЕЛЬНЫМИ ИМПУЛЬСАМИ ===\n");
  
  // Стратегия: Несколько длительных импульсов с проверкой
  for (int attempt = 1; attempt <= 3; attempt++) {
    Serial.print("Попытка ");
    Serial.print(attempt);
    Serial.println(": Длительный мощный импульс");
    
    int encBefore = analogRead(PIN_OUTPUT);
    
    // Длительный мощный импульс
    analogWrite(PIN_SPEED, 255);
    delay(2000);  // Еще более длительный импульс
    
    int encAfter = analogRead(PIN_OUTPUT);
    
    Serial.print("  Энкодер: ");
    Serial.print(encBefore);
    Serial.print(" -> ");
    Serial.print(encAfter);
    Serial.print(" (изменение: ");
    Serial.print(abs(encAfter - encBefore));
    Serial.println(")");
    
    // Проверяем, начал ли мотор вращаться
    if (abs(encAfter - encBefore) > 10) {
      Serial.println("  ✓ МОТОР ЗАХВАТИЛСЯ!");
      // Продолжаем на высокой скорости
      analogWrite(PIN_SPEED, 200);
      delay(500);
      break;
    }
    
    // Если не захватило - пауза и пробуем снова
    if (attempt < 3) {
      Serial.println("  Не захватило, пауза и повтор...");
      analogWrite(PIN_SPEED, 0);
      delay(500);
      
      // Пробуем в противоположном направлении
      Serial.println("  Пробуем противоположное направление...");
      digitalWrite(PIN_DIR, LOW);
      delay(100);
      analogWrite(PIN_SPEED, 255);
      delay(1000);
      analogWrite(PIN_SPEED, 0);
      delay(300);
      digitalWrite(PIN_DIR, HIGH);
      delay(100);
    }
  }
  
  Serial.println("\nПлавный разгон...");
  
  // Плавный разгон
  for (int i = 150; i < 255; i += 5) {
    analogWrite(PIN_SPEED, i);
    delay(80);
  }
  
  Serial.println("✓ Готово!");
}

void loop() {
  analogWrite(PIN_SPEED, 255);
  analogWrite(PIN_BRAKE, 0);
  
  delay(1000);
}
