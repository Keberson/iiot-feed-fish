// Альтернативный вариант: несколько импульсов для надежности

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
  
  Serial.println("Импульсная раскачка...");
  
  // Вариант 2: Несколько коротких импульсов
  for (int pulse = 0; pulse < 3; pulse++) {
    Serial.print("Импульс ");
    Serial.println(pulse + 1);
    
    analogWrite(PIN_SPEED, 100);  // Мощность импульса
    delay(200);                   // Длительность
    analogWrite(PIN_SPEED, 40);  // Снижаем
    delay(150);                   // Пауза
  }
  
  // Полная остановка
  analogWrite(PIN_SPEED, 0);
  delay(300);
  
  Serial.println("Плавный разгон...");
  
  // Плавный разгон
  for (int i = 30; i < 255; i++) {
    analogWrite(PIN_SPEED, i);
    analogWrite(PIN_BRAKE, 0);
    Serial.println(i);
    delay(100);
  }

  Serial.println("runrunrunrun");
}

void loop() {
  analogWrite(PIN_SPEED, 255);
  analogWrite(PIN_BRAKE, 0);
  
  Serial.println(analogRead(PIN_OUTPUT));
  delay(500);
}
