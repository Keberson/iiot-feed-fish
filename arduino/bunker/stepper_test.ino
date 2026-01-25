// ========== STEPPER_TEST.INO ==========
// Тестовый скрипт для шагового двигателя
// Простое непрерывное вращение с чтением команд START/STOP из Serial
// С измерением веса через HX711

#include <AccelStepper.h>
#include "HX711.h"

// ========== НАСТРОЙКИ ШАГОВОГО ДВИГАТЕЛЯ (CNC Shield V3) ==========
#define motorInterfaceType 1  // Тип драйвера (1 = драйвер с STEP и DIR)
// CNC Shield V3 распиновка:
// Z-axis: STEP = D4, DIR = D7  ← Используем эту ось для шагового двигателя!
#define stepPinX 4    // Z-axis STEP (CNC Shield) - для шагового двигателя
#define dirPinX 7     // Z-axis DIR (CNC Shield) - для шагового двигателя

// ========== НАСТРОЙКИ ВЕСОВ HX711 ==========
// Используем end stop пины CNC Shield, т.к. основные пины заняты для Serial связи
#define DT  9                      // X- end stop пин (CNC Shield) - DT датчика HX711
#define SCK 11                     // Y- end stop пин (CNC Shield) - SCK датчика HX711
#define WEIGHT_LOG_INTERVAL 500    // Интервал вывода веса в Serial (мс)

float calibration_factor = -35.44;  // Калибровочный коэффициент
float units_coef = 0.035274;       // Коэффициент для перевода из унций в граммы

// ========== ГЛОБАЛЬНЫЕ ОБЪЕКТЫ ==========
AccelStepper stepperX(motorInterfaceType, stepPinX, dirPinX);
HX711 scale;                       // Объект весов

// ========== ПАРАМЕТРЫ ДВИГАТЕЛЯ ==========
int maxSpeed = 150;  // Максимальная скорость (шагов в секунду) - уменьшено в 2-3 раза
int acceleration = 200;  // Ускорение (шагов в секунду²) для плавного старта
// Антизаклинивающая технология "Тришагиналево-Двенаправо"
int STEPS_FRW = 19;   // Шагов вперед за один цикл
int STEPS_BKW = 12;   // Шагов назад за один цикл

// ========== СОСТОЯНИЕ ДВИГАТЕЛЯ ==========
bool motorRunning = false;  // Флаг работы двигателя
String serialBuffer = "";   // Буфер для накопления команды из Serial
bool movingForward = true;  // Направление движения (true = вперед, false = назад)
int stepCounter = 0;        // Счетчик шагов в текущем цикле (для антизаклинивания)

// ========== СОСТОЯНИЕ ВЕСОВ ==========
unsigned long lastWeightLog = 0;  // Время последнего вывода веса

// ========== ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ ШАГОВОГО ДВИГАТЕЛЯ ==========
void initStepper() {
  stepperX.setMaxSpeed(maxSpeed);
  stepperX.setAcceleration(acceleration);
  Serial.println("STATUS: Motor initialized");
}

// ========== ФУНКЦИЯ ОБНОВЛЕНИЯ ДВИГАТЕЛЯ (вызывать в loop) ==========
void updateStepper() {
  // Антизаклинивающая технология "Тришагиналево-Двенаправо"
  // Сначала делаем шаги назад, потом вперед - это предотвращает заклинивание корма
  
  // Вызываем runSpeed() несколько раз для плавности
  for (int i = 0; i < 50; i++) {
    // runSpeed() возвращает true когда делает реальный шаг
    if (stepperX.runSpeed()) {
      stepCounter++;
      
      // Переключаем направление в зависимости от счетчика реальных шагов
      if (movingForward) {
        // Движемся вперед
        if (stepCounter >= STEPS_FRW) {
          // Завершили цикл вперед - переключаемся на назад
          movingForward = false;
          stepCounter = 0;
          stepperX.setSpeed(-maxSpeed);  // Отрицательная скорость = назад
        }
      } else {
        // Движемся назад
        if (stepCounter >= STEPS_BKW) {
          // Завершили цикл назад - переключаемся на вперед
          movingForward = true;
          stepCounter = 0;
          stepperX.setSpeed(maxSpeed);  // Положительная скорость = вперед
        }
      }
    }
  }
}

// ========== ФУНКЦИЯ ОСТАНОВКИ ДВИГАТЕЛЯ ==========
void stopStepper() {
  // Останавливаем двигатель
  stepperX.stop();
  stepperX.setSpeed(0);  // Устанавливаем скорость в 0 для полной остановки
  stepperX.setCurrentPosition(0);
  stepCounter = 0;  // Сбрасываем счетчик шагов
  Serial.println("STATUS: Motor stopped");
}

// ========== ФУНКЦИЯ ЗАПУСКА ДВИГАТЕЛЯ ==========
void startMotor() {
  if (!motorRunning) {
    motorRunning = true;
    digitalWrite(LED_BUILTIN, HIGH);
    // Начинаем с движения назад (как в оригинале: сначала назад, потом вперед)
    movingForward = false;
    stepCounter = 0;
    stepperX.setSpeed(-maxSpeed);  // Начинаем с движения назад
    Serial.println("STATUS: Motor started (anti-jam mode: back-forward)");
  }
}

// ========== ФУНКЦИЯ ОСТАНОВКИ ДВИГАТЕЛЯ ==========
void stopMotor() {
  if (motorRunning) {
    motorRunning = false;
    digitalWrite(LED_BUILTIN, LOW);
    stopStepper();
    Serial.println("STATUS: Motor stopped");
  }
}

// ========== ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ ВЕСОВ ==========
void initScale() {
  scale.begin(DT, SCK);
  scale.set_scale();
  scale.tare();
  scale.set_scale(calibration_factor);
  Serial.println("STATUS: Scale initialized");
}

// ========== ФУНКЦИЯ ЧТЕНИЯ ВЕСА ==========
// Быстрое чтение без задержек - только если датчик готов
float readWeight() {
  // Быстрое чтение без ожидания - только если датчик готов
  if (scale.is_ready()) {
    float reading = scale.get_units(5);  // Минимальное усреднение
    // Проверяем на валидность (не NaN и не бесконечность)
    if (!isnan(reading) && !isinf(reading)) {
      return reading * units_coef;  // Возвращаем в граммах
    }
  }
  return 0.0;  // Если датчик не готов или ошибка
}

// ========== ФУНКЦИЯ ПРОВЕРКИ КОМАНД ИЗ SERIAL ==========
void checkSerialCommands() {
  // Читаем все доступные символы для быстрой обработки команд
  while (Serial.available() > 0) {
    char c = Serial.read();
    
    // Фильтруем непечатные символы (кроме \n и \r)
    if (c < 32 && c != '\n' && c != '\r') {
      continue;
    }
    
    if (c == '\n' || c == '\r') {
      // Конец команды - обрабатываем
      serialBuffer.trim();
      serialBuffer.toUpperCase();
      
      if (serialBuffer.equals("START")) {
        startMotor();
        Serial.println("STATUS: Command START processed");
      } 
      else if (serialBuffer.equals("STOP")) {
        stopMotor();
        Serial.println("STATUS: Command STOP processed");
      } 
      else if (serialBuffer.length() > 0) {
        Serial.print("STATUS: Unknown command: ");
        Serial.println(serialBuffer);
      }
      
      serialBuffer = "";
    } else {
      // Добавляем только печатные символы в буфер
      if (c >= 32 && c <= 126) {
        serialBuffer += c;
      }
    }
  }
}

// ========== НАЧАЛЬНАЯ НАСТРОЙКА ==========
void setup() {
  Serial.begin(115200);
  delay(100);
  
  // Очистка Serial буфера
  while (Serial.available() > 0) {
    Serial.read();
  }
  serialBuffer = "";
  
  // Инициализация LED
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
  
  Serial.println("STATUS: Stepper test controller starting");
  
  // Инициализация шагового двигателя
  initStepper();
  
  // Инициализация весов
  initScale();
  
  Serial.println("STATUS: Controller ready. Send START to begin, STOP to stop.");
  Serial.println("STATUS: Weight will be logged every 500ms when motor is running.");
}

// ========== ГЛАВНЫЙ ЦИКЛ ==========
void loop() {
  // Обновление шагового двигателя - ВАЖНО: вызывать максимально часто!
  // Мотор имеет приоритет - используем антизаклинивающую технологию
  if (motorRunning) {
    updateStepper();  // Используем функцию с антизаклинивающей логикой
    digitalWrite(LED_BUILTIN, HIGH);
    
    // Выводим вес периодически, когда мотор работает (быстро, без задержек)
    unsigned long now = millis();
    if (now - lastWeightLog >= WEIGHT_LOG_INTERVAL) {
      float weight = readWeight();  // Быстрое чтение без задержек
      Serial.print("STATUS: Weight: ");
      Serial.print(weight);
      Serial.println("g");
      lastWeightLog = now;
    }
  } else {
    digitalWrite(LED_BUILTIN, LOW);
  }
  
  // Проверка команд из Serial (быстро, неблокирующая)
  checkSerialCommands();
  
  // Без задержки - для максимальной частоты вызовов stepperX.runSpeed()
}
