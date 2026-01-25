// Мотор: только наращивание скорости
// JYQD_YL02D — D9=SPEED, D7=DIR, D10=BRAKE

#define PIN_SPEED 9
#define PIN_DIR   7
#define PIN_BRAKE 10

void setup() {
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
  analogWrite(PIN_BRAKE, 0);
  delay(50);

  // Плавное наращивание скорости: 0 → 255
  for (int s = 0; s <= 255; s++) {
    analogWrite(PIN_SPEED, s);
    delay(25);
  }
}

void loop() {
  analogWrite(PIN_SPEED, 255);
  analogWrite(PIN_BRAKE, 0);
}
