// ========== BUNKER_CONTROL.INO ==========
// Файл для работы с модулями управления (шаговый двигатель и другие)

#include <AccelStepper.h>
#include "HX711.h"

// ========== НАСТРОЙКИ ШАГОВОГО ДВИГАТЕЛЯ (CNC Shield V3) ==========
#define motorInterfaceType 1  // Тип драйвера (1 = драйвер с STEP и DIR)
// CNC Shield V3 распиновка:
// X-axis: STEP = D2, DIR = D5  (заняты для Serial связи с ESP8266)
// Y-axis: STEP = D3, DIR = D6  (заняты для Serial связи с ESP8266)
// Z-axis: STEP = D4, DIR = D7  ← Используем эту ось для шагового двигателя!
// A-axis: STEP = D12, DIR = D13
// Enable: D8
// End stops: X- = D9, X+ = D10, Y- = D11, Y+ = D12, Z- = D13
//            ← Используем X- (D9) и X+ (D10) для HX711 весов!
#define stepPinX 4    // Z-axis STEP (CNC Shield) - для шагового двигателя
#define dirPinX 7     // Z-axis DIR (CNC Shield) - для шагового двигателя
// Pin 2 и 3 остаются свободными для аппаратного Serial связи с ESP8266!

// ========== НАСТРОЙКИ ВЕСОВ HX711 ==========
// Используем end stop пины CNC Shield, т.к. основные пины заняты для Serial связи
// X- и X+ подключены к одному пину через перемычку, поэтому используем разные группы
#define DT  9                      // X- end stop пин (CNC Shield) - DT датчика HX711
#define SCK 11                     // Y- end stop пин (CNC Shield) - SCK датчика HX711
#define WEIGHT_ERROR_THRESHOLD 5.0 // Порог погрешности для определения ошибки (граммы) - обновлено на основе диагностики
#define WEIGHT_CHECK_INTERVAL 500  // Интервал проверки веса (мс)
#define WEIGHT_STABLE_TIME 5000    // Время стабильности веса для определения окончания корма (мс) - увеличено до 5 сек
#define FEEDING_START_DELAY 5000   // Время после старта, когда не проверяем стабильность (мс)

float calibration_factor = -35.44;  // Калибровочный коэффициент
float units_coef = 0.035274;       // Коэффициент для перевода из унций в граммы

// ========== ГЛОБАЛЬНЫЕ ОБЪЕКТЫ ==========
AccelStepper stepperX(motorInterfaceType, stepPinX, dirPinX);
HX711 scale;                       // Объект весов

// ========== ПАРАМЕТРЫ ДВИГАТЕЛЯ ==========
int maxSpeed = 150;  // Максимальная скорость (шагов в секунду) - уменьшено в 2-3 раза
int acceleration = 200;  // Ускорение (шагов в секунду²) для плавного старта
long targetPosition = 1000000;  // Большая цель для непрерывного вращения
// Антизаклинивающая технология "Тришагиналево-Двенаправо"
int STEPS_FRW = 19;   // Шагов вперед за один цикл
int STEPS_BKW = 12;   // Шагов назад за один цикл

// ========== СОСТОЯНИЕ ДВИГАТЕЛЯ ==========
bool motorRunning = false;  // Флаг работы двигателя
String serialBuffer = "";   // Буфер для накопления команды из Serial
bool movingForward = true;  // Направление движения (true = вперед, false = назад)
int stepCounter = 0;        // Счетчик шагов в текущем цикле (для антизаклинивания)

// ========== СОСТОЯНИЕ ПОДАЧИ КОРМА ==========
bool feedingActive = false;        // Флаг активной подачи корма
float targetWeight = 0;            // Целевой вес для подачи (граммы)
float initialWeight = 0;           // Начальный вес перед подачей (граммы)
unsigned long lastWeightCheck = 0; // Время последней проверки веса
unsigned long lastWeightLog = 0;  // Время последнего лога веса
float lastWeightValue = 0;         // Последнее значение веса
unsigned long weightStableStart = 0; // Время начала стабильности веса
unsigned long feedingStartTime = 0;  // Время начала подачи корма

// ========== ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ ШАГОВОГО ДВИГАТЕЛЯ ==========
void initStepper() {
  stepperX.setMaxSpeed(maxSpeed);
  stepperX.setAcceleration(acceleration);
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
  stepperX.setCurrentPosition(0);  // Сбрасываем позицию для следующего запуска
  stepCounter = 0;  // Сбрасываем счетчик шагов
  Serial.println("STATUS: Motor stopped");
}

// ========== ФУНКЦИЯ УСТАНОВКИ СКОРОСТИ ==========
void setStepperSpeed(int speed) {
  if (speed > maxSpeed) {
    speed = maxSpeed;
  }
  stepperX.setMaxSpeed(speed);
  Serial.print("STATUS: Speed set to: ");
  Serial.println(speed);
}

// ========== ФУНКЦИЯ ЗАПУСКА ДВИГАТЕЛЯ ==========
void startMotor() {
  if (!motorRunning) {
    motorRunning = true;
    digitalWrite(LED_BUILTIN, HIGH);  // Включаем LED при запуске
    // Устанавливаем скорость для непрерывного вращения
    stepperX.setSpeed(maxSpeed);
    Serial.println("STATUS: Motor started (continuous rotation)");
  }
}

// ========== ФУНКЦИЯ ОСТАНОВКИ ДВИГАТЕЛЯ ==========
void stopMotor() {
  if (motorRunning) {
    motorRunning = false;
    digitalWrite(LED_BUILTIN, LOW);  // Выключаем LED при остановке
    stopStepper();
  }
}

// ========== ФУНКЦИЯ ДИАГНОСТИЧЕСКОГО ВРАЩЕНИЯ ==========
void diagnosticRotation() {
  Serial.println("STATUS: Diagnostic rotation started");
  // Устанавливаем цель для вращения на 3 секунды при текущей скорости
  long stepsFor3Seconds = (long)maxSpeed * 3;  // Примерно 3 секунды вращения
  stepperX.moveTo(stepsFor3Seconds);
  
  unsigned long startTime = millis();
  unsigned long duration = 3000;  // 3 секунды
  
  while (millis() - startTime < duration) {
    stepperX.run();
  }
  
  stepperX.stop();
  stepperX.setCurrentPosition(0);
  Serial.println("STATUS: Diagnostic rotation completed");
}

// ========== ФУНКЦИЯ ДИАГНОСТИКИ ВЕСОВ ==========
void diagnosticWeightCheck() {
  // Быстрая проверка весов без лишних логов
  delay(100);
  float weight = readWeight();
  Serial.print("STATUS: Initial weight: ");
  Serial.print(weight);
  Serial.println("g");
}

// ========== ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ ВЕСОВ ==========
void initScale() {
  scale.begin(DT, SCK);
  scale.set_scale();
  scale.tare();
  scale.set_scale(calibration_factor);
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

// ========== ФУНКЦИЯ НАЧАЛА ПОДАЧИ КОРМА ==========
void startFeeding(float targetGrams) {
  if (feedingActive) {
    Serial.println("STATUS: Feeding already in progress");
    return;
  }
  
  feedingActive = true;
  targetWeight = targetGrams;
  initialWeight = readWeight();
  
  lastWeightCheck = millis();
  lastWeightLog = millis();
  lastWeightValue = initialWeight;
  weightStableStart = 0;
  feedingStartTime = millis();  // Запоминаем время начала подачи
  
  Serial.print("STATUS: Feeding started. Target: ");
  Serial.print(targetWeight);
  Serial.print("g, Initial weight: ");
  Serial.print(initialWeight);
  Serial.println("g");
  
  startMotor();
}

// ========== ФУНКЦИЯ ОСТАНОВКИ ПОДАЧИ КОРМА ==========
void stopFeeding(bool success) {
  if (!feedingActive) return;
  
  feedingActive = false;
  stopMotor();
  
  // Делаем несколько попыток чтения финального веса для точности
  float weightSum = 0;
  int validReadings = 0;
  for (int i = 0; i < 3; i++) {
    float w = readWeight();
    if (!isnan(w) && !isinf(w) && w >= 0) {
      weightSum += w;
      validReadings++;
    }
  }
  float finalWeight = (validReadings > 0) ? (weightSum / validReadings) : readWeight();
  float dispensedAmount = initialWeight - finalWeight;  // Количество высыпанного корма
  
  if (success) {
    Serial.print("STATUS: Feeding completed. Dispensed: ");
    Serial.print(dispensedAmount);
    Serial.print("g, Final weight: ");
    Serial.print(finalWeight);
    Serial.println("g");
  } else {
    Serial.print("ERROR: Feeding stopped - Feed empty or stuck. Dispensed: ");
    Serial.print(dispensedAmount);
    Serial.print("g, Final weight: ");
    Serial.print(finalWeight);
    Serial.println("g");
  }
}

// ========== ФУНКЦИЯ КОНТРОЛЯ ПОДАЧИ КОРМА ==========
void checkFeeding() {
  if (!feedingActive) return;
  
  unsigned long now = millis();
  unsigned long feedingDuration = now - feedingStartTime;
  
  // Первые 5 секунд просто крутим мотор без проверки веса
  // Это дает время на стабилизацию весов и начало подачи корма
  if (feedingDuration < 5000) {
    return;  // Не проверяем вес первые 5 секунд
  }
  
  // После 5 секунд начинаем проверять вес с заданным интервалом
  if (now - lastWeightCheck >= WEIGHT_CHECK_INTERVAL) {
    float currentWeight = readWeight();
    float dispensedAmount = initialWeight - currentWeight;  // Количество высыпанного корма
    
    // Логируем вес во время подачи для отладки
    Serial.print("STATUS: Weight check - Current: ");
    Serial.print(currentWeight);
    Serial.print("g, Dispensed: ");
    Serial.print(dispensedAmount);
    Serial.print("g, Target: ");
    Serial.print(targetWeight);
    Serial.println("g");
    
    // Проверка достижения целевого веса (с учетом погрешности)
    if (dispensedAmount >= targetWeight - WEIGHT_ERROR_THRESHOLD) {
      stopFeeding(true);
      return;
    }
    
    // Проверка на окончание корма
    float weightChange = lastWeightValue - currentWeight;
    
    if (feedingDuration < FEEDING_START_DELAY) {
      weightStableStart = 0;
    } else {
      if (abs(weightChange) <= WEIGHT_ERROR_THRESHOLD) {
        if (weightStableStart == 0) {
          weightStableStart = now;
        } else if (now - weightStableStart >= WEIGHT_STABLE_TIME) {
          // Вес стабилен достаточно долго - проверяем условия остановки
          if (dispensedAmount < targetWeight * 0.5) {
            stopFeeding(false);
            return;
          }
        }
      } else if (weightChange > WEIGHT_ERROR_THRESHOLD) {
        // Вес продолжает уменьшаться - корм еще сыпется, сбрасываем счетчик стабильности
        weightStableStart = 0;
      }
    }
    
    lastWeightValue = currentWeight;
    lastWeightCheck = now;
  }
}

// ========== ФУНКЦИЯ ПРОВЕРКИ КОМАНД ИЗ SERIAL ==========
void checkSerialCommands() {
  // Читаем все доступные символы для быстрой обработки команд
  while (Serial.available() > 0) {
    char c = Serial.read();
    
    // Фильтруем непечатные символы (кроме \n и \r)
    if (c < 32 && c != '\n' && c != '\r') {
      continue;  // Пропускаем мусор
    }
    
    if (c == '\n' || c == '\r') {
      // Конец команды - обрабатываем
      serialBuffer.trim();
      
      // Очищаем от непечатных символов
      String cleanBuffer = "";
      for (int i = 0; i < serialBuffer.length(); i++) {
        char ch = serialBuffer.charAt(i);
        if (ch >= 32 && ch <= 126) {  // Только печатные ASCII символы
          cleanBuffer += ch;
        }
      }
      serialBuffer = cleanBuffer;
      serialBuffer.toUpperCase();
      
      // Если команда содержит FEED:, извлекаем только часть после FEED:
      int feedIndex = serialBuffer.indexOf("FEED:");
      if (feedIndex >= 0) {
        serialBuffer = serialBuffer.substring(feedIndex);
      }
      
      // Команда FEED:100 (подать 100 грамм)
      if (serialBuffer.startsWith("FEED:")) {
        float weight = serialBuffer.substring(5).toFloat();
        if (weight > 0) {
          startFeeding(weight);
        } else {
          Serial.println("STATUS: ERROR: Invalid weight value");
        }
      }
      else if (serialBuffer.equals("START")) {
        startMotor();
        Serial.println("STATUS: Command START processed");
      } 
      else if (serialBuffer.equals("STOP")) {
        if (feedingActive) {
          stopFeeding(false);
        } else {
          stopMotor();
        }
        Serial.println("STATUS: Command STOP processed");
      } 
      else if (serialBuffer.length() > 0) {
        Serial.print("STATUS: Unknown command: ");
        Serial.println(serialBuffer);
      }
      
      serialBuffer = "";  // Очищаем буфер
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
  // Инициализация Serial для связи с WiFi модулем (ESP8266)
  Serial.begin(115200);
  delay(100);
  
  // Очистка Serial буфера от мусора при старте
  while (Serial.available() > 0) {
    Serial.read();
  }
  serialBuffer = "";  // Очищаем буфер команд
  
  // Инициализация LED
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
  
  // Инициализация шагового двигателя
  initStepper();
  
  // Инициализация весов
  initScale();
  
  // Быстрая диагностика весов
  diagnosticWeightCheck();
  
  Serial.println("STATUS: Controller ready");
}

// ========== ГЛАВНЫЙ ЦИКЛ ==========
void loop() {
  // Обновление шагового двигателя - ВАЖНО: вызывать максимально часто!
  // Мотор имеет приоритет - используем антизаклинивающую технологию
  if (motorRunning) {
    updateStepper();  // Используем функцию с антизаклинивающей логикой
    // LED горит постоянно, пока двигатель работает
    digitalWrite(LED_BUILTIN, HIGH);
  } else {
    // LED выключен, когда двигатель не работает
    digitalWrite(LED_BUILTIN, LOW);
  }
  
  // Контроль подачи корма - проверка веса и автоматическая остановка
  if (feedingActive) {
    checkFeeding();
  }
  
  // Проверка команд из Serial (быстро, неблокирующая)
  checkSerialCommands();
  
  // Без задержки - для максимальной частоты вызовов stepperX.runSpeed()
}
