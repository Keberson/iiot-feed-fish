// ========== CART_CONTROL.INO ==========
// Файл для управления тележкой (ATMega контроллер)
// Управляет движением через концевы выключатели

#include <Servo.h>

// ========== СОСТОЯНИЯ ТЕЛЕЖКИ ==========
enum CartState {
    IDLE,                  // Ожидание начала работы
    WAITING_FOR_FEED,      // Ожидание загрузки корма
    MOVING_TO_DUMP,        // Движение к месту высыпания
    AT_DUMP_LOCATION,      // Проверка места высыпания
    FEEDING,               // Подача корма
    RETURNING,             // Возврат назад
    ERROR                  // Ошибка
};

// ========== НАСТРОЙКИ КОНЦЕВЫХ ВЫКЛЮЧАТЕЛЕЙ ==========
// Порядок датчиков: при движении тележки сначала нажимается один датчик, потом второй
// Логика: оба датчика нажаты -> оба отпущены = точка
// Порядок не важен: может быть SW1->SW2 или SW2->SW1
#define ENDSTOP_1 8
#define ENDSTOP_2 9
#define TIMEOUT_MS 2000  // Таймаут 2 секунды для ожидания второго датчика

// ========== НАСТРОЙКИ СЕРВОПРИВОДА ==========
#define SERVO_PIN A0
#define SERVO_CLOSED_ANGLE 0    // Закрытое положение
#define SERVO_OPEN_ANGLE 90     // Открытое положение

// ========== ПЕРЕМЕННЫЕ ДЛЯ КОНЦЕВЫХ ВЫКЛЮЧАТЕЛЕЙ ==========
enum EndstopPhase {
  ENDSTOP_IDLE,           // Ожидание первого нажатия
  ENDSTOP_FIRST_PRESSED,  // Нажат первый датчик
  ENDSTOP_BOTH_PRESSED    // Нажаты оба датчика
};

unsigned long firstPressTime = 0;
bool firstWasSw1 = false;
bool prevSw1 = false;
bool prevSw2 = false;
EndstopPhase endstopPhase = ENDSTOP_IDLE;
// Убрано периодическое логирование для экономии памяти

// ========== СОСТОЯНИЕ ТЕЛЕЖКИ ==========
CartState currentState = IDLE;
int pointCount = 0;  // Счетчик срабатываний датчиков

// ========== ПЕРЕМЕННЫЕ ДЛЯ FEEDING ==========
unsigned long feedingStartTime = 0;
unsigned long feedingDuration = 0;
bool feedingActive = false;

// ========== СЕРВОПРИВОД ==========
Servo feedServo;

// ========== БУФЕР ДЛЯ КОМАНД ИЗ SERIAL ==========
String serialBuffer = "";
#define MAX_SERIAL_BUFFER 32  // Максимальный размер буфера для экономии памяти

// ========== ФУНКЦИЯ ОТПРАВКИ ЛОГА ==========
// Перегрузка для строковых литералов (экономия памяти)
void sendLog(const __FlashStringHelper* message) {
  Serial.print(F("LOG:"));
  Serial.println(message);
}
// Перегрузка для динамических строк (минимальное использование)
void sendLog(const char* message) {
  Serial.print(F("LOG:"));
  Serial.println(message);
}

// ========== ФУНКЦИЯ ОТПРАВКИ СОСТОЯНИЯ ==========
void sendState(CartState state) {
  Serial.print(F("STATE:"));
  switch (state) {
    case IDLE:
      Serial.println(F("IDLE"));
      break;
    case WAITING_FOR_FEED:
      Serial.println(F("WAITING_FOR_FEED"));
      break;
    case MOVING_TO_DUMP:
      Serial.println(F("MOVING_TO_DUMP"));
      break;
    case AT_DUMP_LOCATION:
      Serial.println(F("AT_DUMP_LOCATION"));
      break;
    case FEEDING:
      Serial.println(F("FEEDING"));
      break;
    case RETURNING:
      Serial.println(F("RETURNING"));
      break;
    case ERROR:
      Serial.println(F("ERROR"));
      break;
  }
}

// ========== ФУНКЦИЯ ОБРАБОТКИ КОМАНД ИЗ SERIAL ==========
void processSerialCommand(String command) {
  command.trim();
  command.toLowerCase();
  
  if (command == "start") {
    if (currentState == IDLE || currentState == WAITING_FOR_FEED) {
      // Начинаем движение - сбрасываем все переменные отслеживания
      currentState = MOVING_TO_DUMP;
      pointCount = 0;
      endstopPhase = ENDSTOP_IDLE;
      firstPressTime = 0;
      firstWasSw1 = false;
      sendLog("Начинаем движение к точке высыпания");
      sendState(currentState);
    }
  }
  else if (command.startsWith("feeding:")) {
    // Команда начала подачи корма
    // Извлекаем число напрямую из строки (экономия памяти)
    feedingDuration = 0;
    for (int i = 8; i < command.length() && i < 15; i++) {
      char c = command[i];
      if (c >= '0' && c <= '9') {
        feedingDuration = feedingDuration * 10 + (c - '0');
      } else {
        break;
      }
    }
    if (feedingDuration > 0 && currentState == AT_DUMP_LOCATION) {
      currentState = FEEDING;
      feedingStartTime = millis();
      feedingActive = true;
      
      // Открываем сервопривод
      feedServo.write(SERVO_OPEN_ANGLE);
      sendLog(F("FEED_START"));
      sendState(currentState);
    }
  }
  else if (command == "returning") {
    // Команда возврата
    if (currentState == FEEDING || currentState == AT_DUMP_LOCATION) {
      // Закрываем сервопривод на всякий случай
      feedServo.write(SERVO_CLOSED_ANGLE);
      currentState = RETURNING;
      pointCount = 0;
      endstopPhase = ENDSTOP_IDLE;
      firstPressTime = 0;
      firstWasSw1 = false;
      feedingActive = false;
      sendLog("Начинаем возврат к бункеру. Сервопривод закрыт");
      sendState(currentState);
    }
  }
}

// ========== ФУНКЦИЯ ОБРАБОТКИ КОНЦЕВЫХ ВЫКЛЮЧАТЕЛЕЙ ==========
void processEndstops() {
  bool sw1 = digitalRead(ENDSTOP_1) == HIGH;
  bool sw2 = digitalRead(ENDSTOP_2) == HIGH;
  
  // Проверяем переходы состояний
  bool sw1Pressed = !prevSw1 && sw1;
  bool sw2Pressed = !prevSw2 && sw2;
  
  // Логика отслеживания последовательности
  // Обрабатываем только если мы в состоянии движения
  if (currentState != MOVING_TO_DUMP && currentState != RETURNING) {
    // Не в состоянии движения - просто обновляем предыдущие состояния
    prevSw1 = sw1;
    prevSw2 = sw2;
    return;
  }
  
  if (endstopPhase == ENDSTOP_IDLE) {
    // Если уже на датчике/датчиках - считаем это началом точки
    if (sw1 && sw2) {
      endstopPhase = ENDSTOP_BOTH_PRESSED;
    } else if (sw1 || sw2) {
      endstopPhase = ENDSTOP_FIRST_PRESSED;
      firstWasSw1 = sw1;
      firstPressTime = millis();
    } else if (sw1Pressed || sw2Pressed) {
      endstopPhase = ENDSTOP_FIRST_PRESSED;
      firstWasSw1 = sw1Pressed;
      firstPressTime = millis();
    }
  } else if (endstopPhase == ENDSTOP_FIRST_PRESSED) {
    unsigned long waitTime = millis() - firstPressTime;
    if (waitTime > TIMEOUT_MS) {
      // Таймаут истек - сбрасываем (без логирования)
      endstopPhase = ENDSTOP_IDLE;
      firstPressTime = 0;
    } else {
      bool secondPressed = false;
      if (firstWasSw1) {
        secondPressed = sw2Pressed;
      } else {
        secondPressed = sw1Pressed;
      }
      
      if (secondPressed || (sw1 && sw2)) {
        endstopPhase = ENDSTOP_BOTH_PRESSED;
      }
    }
  } else if (endstopPhase == ENDSTOP_BOTH_PRESSED) {
    if (!sw1 && !sw2) {
      // Полный проход точки: оба датчика были нажаты и затем отпущены
      pointCount++;
      sendLog(F("POINT"));
      endstopPhase = ENDSTOP_IDLE;
      firstPressTime = 0;
      
      // Обработка в зависимости от состояния
      if (currentState == MOVING_TO_DUMP) {
        if (pointCount == 1) {
          // Первое срабатывание - выехали с прошлой точки, продолжаем движение
          sendLog(F("LEFT"));
        } else if (pointCount == 2) {
          // Второе срабатывание - достигли новой точки
          currentState = AT_DUMP_LOCATION;
          sendLog(F("AT_DUMP"));
          sendState(currentState);
          pointCount = 0;
          // Обновляем предыдущие состояния и выходим
          prevSw1 = sw1;
          prevSw2 = sw2;
          return;
        }
      }
      else if (currentState == RETURNING) {
        if (pointCount == 1) {
          // Первое срабатывание - выехали с точки высыпания
          sendLog(F("LEFT_DUMP"));
        } else if (pointCount == 2) {
          // Второе срабатывание - вернулись к бункеру
          currentState = IDLE;
          sendLog(F("RETURNED"));
          sendState(currentState);
          // Отправляем сообщение о возврате
          Serial.println(F("STATE:RETURNED"));
          pointCount = 0;
          // Обновляем предыдущие состояния и выходим
          prevSw1 = sw1;
          prevSw2 = sw2;
          return;
        }
      }
    }
  }
  
  // Сохраняем текущие состояния для следующей итерации
  prevSw1 = sw1;
  prevSw2 = sw2;
}

// ========== ФУНКЦИЯ ОБРАБОТКИ СОСТОЯНИЯ FEEDING ==========
void processFeeding() {
  if (feedingActive) {
    unsigned long elapsed = millis() - feedingStartTime;
    
    if (elapsed >= feedingDuration) {
      // Подача корма завершена - закрываем сервопривод
      feedServo.write(SERVO_CLOSED_ANGLE);
      feedingActive = false;
      sendLog(F("FEED_DONE"));
      Serial.println(F("STATE:FEEDING_DONE"));
    }
  }
}

// ========== ФУНКЦИЯ ЧТЕНИЯ КОМАНД ИЗ SERIAL ==========
void readSerialCommands() {
  while (Serial.available() > 0) {
    char c = Serial.read();
     
    if (c == '\n' || c == '\r') {
      if (serialBuffer.length() > 0) {
        processSerialCommand(serialBuffer);
        serialBuffer = "";
      }
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
  serialBuffer = "";
  
  // Инициализация концевых выключателей
  pinMode(ENDSTOP_1, INPUT);
  pinMode(ENDSTOP_2, INPUT);
  delay(100);
  
  // Инициализация сервопривода
  feedServo.attach(SERVO_PIN);
  feedServo.write(SERVO_CLOSED_ANGLE);  // Изначально закрыт
  delay(500);  // Даем время сервоприводу установиться
  
  // Инициализация предыдущих состояний
  prevSw1 = digitalRead(ENDSTOP_1) == HIGH;
  prevSw2 = digitalRead(ENDSTOP_2) == HIGH;
  
  // Начальное состояние
  currentState = IDLE;
  sendLog(F("READY"));
  sendState(currentState);
}

// ========== ГЛАВНЫЙ ЦИКЛ ==========
void loop() {
  // Чтение команд из Serial
  readSerialCommands();
  
  // Обработка состояний
  switch (currentState) {
    case IDLE:
      // Ожидание команды START
      break;
      
    case WAITING_FOR_FEED:
      // Ожидание команды от ESP о завершении загрузки
      break;
      
    case MOVING_TO_DUMP:
      // Движение к точке высыпания
      processEndstops();
      break;
      
    case AT_DUMP_LOCATION:
      // На месте высыпания, ожидание команды FEEDING
      break;
      
    case FEEDING:
      // Подача корма
      processFeeding();
      break;
      
    case RETURNING:
      // Возврат к бункеру
      processEndstops();
      break;
      
    case ERROR:
      // Ошибка
      break;
  }
  
  delay(10);  // Небольшая задержка для стабильности
}
