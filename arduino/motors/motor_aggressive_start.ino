// Агрессивный старт с максимальной мощностью
// Для случаев, когда обычные импульсы не работают

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
  
  Serial.println("=== АГРЕССИВНЫЙ СТАРТ ===");
  
  // Стратегия: Несколько очень мощных импульсов
  for (int attempt = 1; attempt <= 5; attempt++) {
    Serial.print("Попытка ");
    Serial.print(attempt);
    Serial.println(": МАКСИМАЛЬНАЯ мощность");
    
    // Максимальная мощность
    analogWrite(PIN_SPEED, 255);
    delay(600);  // Держим дольше
    
    // Проверяем, начал ли мотор вращаться (читаем энкодер)
    int encoderValue1 = analogRead(PIN_OUTPUT);
    delay(100);
    int encoderValue2 = analogRead(PIN_OUTPUT);
    
    Serial.print("  Энкодер: ");
    Serial.print(encoderValue1);
    Serial.print(" -> ");
    Serial.println(encoderValue2);
    
    // Если значения изменились - мотор начал вращаться
    if (abs(encoderValue2 - encoderValue1) > 5) {
      Serial.println("  ✓ МОТОР ЗАХВАТИЛСЯ!");
      // Продолжаем на высокой скорости
      analogWrite(PIN_SPEED, 200);
      delay(500);
      break;
    }
    
    // Если не захватило - снижаем и пробуем снова
    analogWrite(PIN_SPEED, 0);
    delay(300);
    
    // Пробуем в противоположном направлении (только для первой попытки)
    if (attempt == 1) {
      Serial.println("  Пробуем противоположное направление...");
      digitalWrite(PIN_DIR, LOW);
      delay(100);
      analogWrite(PIN_SPEED, 255);
      delay(400);
      analogWrite(PIN_SPEED, 0);
      delay(200);
      digitalWrite(PIN_DIR, HIGH);
      delay(100);
    }
  }
  
  Serial.println("Плавный разгон...");
  
  // Плавный разгон начиная с высокой скорости
  for (int i = 100; i < 255; i += 5) {
    analogWrite(PIN_SPEED, i);
    analogWrite(PIN_BRAKE, 0);
    Serial.println(i);
    delay(80);
  }

  Serial.println("runrunrunrun");
}

void loop() {
  analogWrite(PIN_SPEED, 255);
  analogWrite(PIN_BRAKE, 0);
  
  Serial.println(analogRead(PIN_OUTPUT));
  delay(500);
}
