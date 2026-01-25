// Автостарт мотора с начальным импульсом
// Решает проблему старта из неподвижного состояния

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
  
  Serial.println("МОЩНЫЙ начальный импульс для раскачки...");
  
  // КРИТИЧНО: Максимально мощный импульс для сдвига ротора
  // Пробуем максимальную мощность
  Serial.println("Импульс 1: МАКСИМАЛЬНАЯ мощность (255)");
  analogWrite(PIN_SPEED, 255);  // МАКСИМАЛЬНАЯ мощность
  delay(500);                    // Увеличена длительность
  
  // Снижаем
  analogWrite(PIN_SPEED, 150);
  delay(200);
  
  // Еще один мощный импульс
  Serial.println("Импульс 2: Высокая мощность (200)");
  analogWrite(PIN_SPEED, 200);
  delay(400);
  
  // Снижаем до нуля
  analogWrite(PIN_SPEED, 0);
  delay(300);  // Пауза для стабилизации
  
  Serial.println("Плавный разгон...");
  
  // Теперь плавный разгон - мотор должен "захватиться"
  for (int i = 30; i < 255; i++) {  // Начинаем с 30, а не с 0
    analogWrite(PIN_SPEED, i);
    analogWrite(PIN_BRAKE, 0);
    Serial.println(i);
    delay(100);
  }

  Serial.println("runrunrunrun");
}

void loop() {
  // Держим максимальную скорость
  analogWrite(PIN_SPEED, 255);
  analogWrite(PIN_BRAKE, 0);
  
  // Можно читать энкодер для диагностики
  Serial.println(analogRead(PIN_OUTPUT));
  delay(500);
}
