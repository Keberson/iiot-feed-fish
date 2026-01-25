// Максимально простой код - мотор едет вперед

#define PIN_SPEED 9
#define PIN_DIR   7
#define PIN_BRAKE 10

void setup() {
  pinMode(PIN_DIR, OUTPUT);
  
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
  
  // Установка скорости (измените значение от 0 до 255)
  analogWrite(PIN_SPEED, 100);  // Средняя скорость
}

void loop() {
  // Мотор едет вперед
  // Ничего не делаем, просто держим скорость
}
