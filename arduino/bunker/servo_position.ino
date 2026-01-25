// ========== SERVO_POSITION.INO ==========
// Скрипт для работы с сервоприводом и получения текущего положения

#include <Servo.h>

// ========== НАСТРОЙКИ СЕРВОПРИВОДА ==========
#define SERVO_PIN A0        // Пин подключения сервопривода (A0)
#define MIN_ANGLE 0         // Минимальный угол поворота (градусы)
#define MAX_ANGLE 180       // Максимальный угол поворота (градусы)

// ========== ГЛОБАЛЬНЫЕ ОБЪЕКТЫ ==========
Servo myServo;              // Объект сервопривода
int currentPosition = 90;   // Текущее положение сервопривода (градусы)
String serialBuffer = "";   // Буфер для накопления команды из Serial

// ========== ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ СЕРВОПРИВОДА ==========
void initServo() {
  myServo.attach(SERVO_PIN);
  myServo.write(currentPosition);
  delay(500);  // Даем время сервоприводу инициализироваться
  Serial.println("STATUS: Servo initialized on pin A0");
}

// ========== ФУНКЦИЯ ПОЛУЧЕНИЯ ТЕКУЩЕГО ПОЛОЖЕНИЯ ==========
int getCurrentPosition() {
  // Метод read() возвращает последний установленный угол
  // Для точного определения реального положения нужен датчик обратной связи (энкодер)
  int position = myServo.read();
  currentPosition = position;
  return position;
}

// ========== ФУНКЦИЯ УСТАНОВКИ ПОЛОЖЕНИЯ ==========
void setPosition(int angle) {
  // Ограничиваем угол в допустимых пределах
  if (angle < MIN_ANGLE) {
    angle = MIN_ANGLE;
  } else if (angle > MAX_ANGLE) {
    angle = MAX_ANGLE;
  }
  
  myServo.write(angle);
  currentPosition = angle;
  
  Serial.print("STATUS: Position set to: ");
  Serial.print(angle);
  Serial.println(" degrees");
  
  delay(15);  // Даем время сервоприводу переместиться (обычно 15-20 мс на градус)
}

// ========== ФУНКЦИЯ ПРОВЕРКИ КОМАНД ИЗ SERIAL ==========
void checkSerialCommands() {
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
      
      // Команда GET_POS - получить текущее положение
      if (serialBuffer.equals("GET_POS") || serialBuffer.equals("POSITION")) {
        int pos = getCurrentPosition();
        Serial.print("STATUS: Current position: ");
        Serial.print(pos);
        Serial.println(" degrees");
      }
      // Команда SET_POS:90 - установить положение
      else if (serialBuffer.startsWith("SET_POS:")) {
        int angle = serialBuffer.substring(8).toInt();
        setPosition(angle);
      }
      // Команда SET:90 - альтернативный формат установки положения
      else if (serialBuffer.startsWith("SET:")) {
        int angle = serialBuffer.substring(4).toInt();
        setPosition(angle);
      }
      // Команда MOVE:45 - переместить на относительное значение
      else if (serialBuffer.startsWith("MOVE:")) {
        int delta = serialBuffer.substring(5).toInt();
        int newPosition = currentPosition + delta;
        setPosition(newPosition);
      }
      // Команда CENTER - установить в центр (90 градусов)
      else if (serialBuffer.equals("CENTER")) {
        setPosition(90);
      }
      // Команда MIN - установить минимальное положение
      else if (serialBuffer.equals("MIN")) {
        setPosition(MIN_ANGLE);
      }
      // Команда MAX - установить максимальное положение
      else if (serialBuffer.equals("MAX")) {
        setPosition(MAX_ANGLE);
      }
      // Команда HELP - показать справку
      else if (serialBuffer.equals("HELP")) {
        Serial.println("STATUS: Available commands:");
        Serial.println("  GET_POS or POSITION - get current position");
        Serial.println("  SET_POS:90 - set position to 90 degrees");
        Serial.println("  SET:90 - set position to 90 degrees (short format)");
        Serial.println("  MOVE:45 - move relative +45 degrees");
        Serial.println("  CENTER - set to center position (90 degrees)");
        Serial.println("  MIN - set to minimum position (0 degrees)");
        Serial.println("  MAX - set to maximum position (180 degrees)");
      }
      else if (serialBuffer.length() > 0) {
        Serial.print("STATUS: Unknown command: ");
        Serial.println(serialBuffer);
        Serial.println("STATUS: Type HELP for available commands");
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
  // Инициализация Serial
  Serial.begin(115200);
  delay(100);
  
  // Очистка Serial буфера от мусора при старте
  while (Serial.available() > 0) {
    Serial.read();
  }
  serialBuffer = "";
  
  // Инициализация LED
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
  
  // Инициализация сервопривода
  initServo();
  
  // Выводим текущее положение при старте
  int pos = getCurrentPosition();
  Serial.print("STATUS: Servo ready on pin A0. Current position: ");
  Serial.print(pos);
  Serial.println(" degrees");
  Serial.println("STATUS: Type HELP for available commands");
}

// ========== ГЛАВНЫЙ ЦИКЛ ==========
void loop() {
  // Проверка команд из Serial
  checkSerialCommands();
  
  // Небольшая задержка для стабильности
  delay(10);
}
