// Управление мотор-колесом через драйвер JYQD_YL02D
// Важно: Драйвер имеет функцию Safety Start, которая блокирует управление
// после включения питания до выполнения процедуры разблокировки

#define PIN_SPEED 9    // 1VR - скорость (PWM, 0-255 = 0-5V)
#define PIN_DIR   7    // 1Z/F - направление (HIGH/5V или float = вперед, LOW/GND = назад)
#define PIN_BRAKE 10   // 1EL - тормоз (PWM, 0-255 = 0-5V)
#define PIN_ENCODER 4  // 1M - энкодер (выход частоты вращения)

void unlockSafetyStart() {
  analogWrite(PIN_SPEED, 0);
  analogWrite(PIN_BRAKE, 0);
  delay(100);
  analogWrite(PIN_BRAKE, 128);
  delay(300);
  analogWrite(PIN_BRAKE, 0);
  delay(200);
}

void smoothStart(int targetSpeed, bool direction, int rampTime) {
  // Плавный старт для решения проблемы автостарта
  unlockSafetyStart();
  
  digitalWrite(PIN_DIR, direction ? HIGH : LOW);
  delay(100);
  analogWrite(PIN_BRAKE, 0);
  delay(50);
  
  // Плавное увеличение скорости
  int steps = 15;
  int stepDelay = rampTime / steps;
  int stepSize = targetSpeed / steps;
  
  for (int i = 1; i <= steps; i++) {
    int currentSpeed = stepSize * i;
    analogWrite(PIN_SPEED, currentSpeed);
    delay(stepDelay);
  }
  
  analogWrite(PIN_SPEED, targetSpeed);
}

void setup() {
  Serial.begin(115200);
  
  pinMode(PIN_DIR, OUTPUT);
  pinMode(PIN_ENCODER, INPUT_PULLUP);
  
  Serial.println(F("Инициализация драйвера..."));
  unlockSafetyStart();
  Serial.println(F("Драйвер разблокирован и готов к работе"));
}

void loop() {
  // 1. ВПЕРЕД с плавным стартом
  Serial.println(F("Вперед (плавный старт)"));
  smoothStart(200, true, 600);  // Плавный разгон до 200 за 600мс
  
  delay(2000);
  
  // 2. Плавная остановка
  Serial.println(F("Плавная остановка"));
  analogWrite(PIN_SPEED, 0);
  delay(100);
  analogWrite(PIN_BRAKE, 150);
  
  delay(2000);
  
  // 3. НАЗАД с плавным стартом
  Serial.println(F("Назад (плавный старт)"));
  smoothStart(200, false, 600);
  
  delay(2000);
  
  // 4. Плавная остановка
  Serial.println(F("Плавная остановка"));
  analogWrite(PIN_SPEED, 0);
  delay(100);
  analogWrite(PIN_BRAKE, 150);
  
  delay(2000);
}
