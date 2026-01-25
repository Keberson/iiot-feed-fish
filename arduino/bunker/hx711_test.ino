#include "HX711.h"                 // Подключаем библиотеку HX711
HX711 scale;                       // Создаём объект scale 

// Используем end stop пины CNC Shield (X_MIN и X_MAX)
#define DT  9                      // X_MIN end stop пин (CNC Shield) - DT датчика HX711
#define SCK 10                     // X_MAX end stop пин (CNC Shield) - SCK датчика HX711

float calibration_factor = -35.44;  // Вводим калибровочный коэффициент
float units_coef = 0.035274;       // Коэффициент для перевода из унций в граммы

void setup()
{
  Serial.begin(57600);             // Инициируем работу последовательного порта на скорости 57600 бод
  scale.begin(DT, SCK);            // Инициируем работу с датчиком
  scale.set_scale();               // Выполняем измерение значения без калибровочного коэффициента
  scale.tare();                    // Сбрасываем значения веса на датчике в 0
  scale.set_scale(calibration_factor); // Устанавливаем калибровочный коэффициент
}

void loop() {
  // Улучшенное усреднение: делаем несколько чтений и усредняем их
  float sum = 0;
  int readings = 5;                 // Количество чтений для усреднения
  
  for (int i = 0; i < readings; i++) {
    sum += scale.get_units(20);    // Каждое чтение усредняет 20 измерений
    delay(50);                      // Небольшая задержка между чтениями
  }
  
  float units = sum / readings;     // Усредняем все чтения
  float grams = units * units_coef; // Переводим в граммы
  
  Serial.print("Reading: ");
  Serial.print(grams, 2);          // Выводим с 2 знаками после запятой
  Serial.println(" grams");
  delay(200);
}
