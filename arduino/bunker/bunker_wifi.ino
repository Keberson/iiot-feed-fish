// ========== BUNKER_WIFI.INO ==========
// Файл для работы с WiFi и MQTT подключением

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ========== НАСТРОЙКИ WiFi ==========
const char* ssid = "kv_226";
const char* password = "wuxwfbna";

// ========== НАСТРОЙКИ MQTT ==========
const char* mqttServer = "158.160.94.8";
const int mqttPort = 1883;
const char* mqttUser = "user";
const char* mqttPassword = "iiot-mqtt-fish";
const char* requestsTopic = "bunker";
const char* logsTopic = "logs";
const char* errorTopic = "error";

// ========== ГЛОБАЛЬНЫЕ ОБЪЕКТЫ ==========
WiFiClient espClient;
PubSubClient client(espClient);

// ========== ФУНКЦИЯ ОТПРАВКИ ЛОГОВ В MQTT ==========
void sendLog(String level, String message) {
  // Создаём JSON для лога
  StaticJsonDocument<256> logDoc;
  logDoc["level"] = level;
  logDoc["message"] = message;
  logDoc["timestamp"] = millis();
  
  // Сериализуем JSON в строку
  String logString;
  serializeJson(logDoc, logString);
  
  // Отправляем в соответствующий топик
  if (client.connected()) {
    if (level == "ERROR") {
      // Ошибки отправляем в топик error
      client.publish(errorTopic, logString.c_str());
    } else {
      // Остальные логи отправляем в топик logs
      client.publish(logsTopic, logString.c_str());
    }
  }
  
  // Логи отправляются только в MQTT, так как Serial используется для связи с ATMega
}

// ========== ФУНКЦИЯ ОБРАБОТКИ MQTT СООБЩЕНИЙ ==========
void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  message.reserve(length);
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  sendLog("INFO", "MQTT message received: " + message);
  
  // Обработка JSON сообщения
  processJSON(message);
}

// ========== ФУНКЦИЯ ОБРАБОТКИ JSON ==========
void processJSON(String jsonString) {
  // Создаём JSON документ
  StaticJsonDocument<256> doc;
  
  // Парсим JSON строку
  DeserializationError error = deserializeJson(doc, jsonString);
  
  // Проверяем на ошибки парсинга
  if (error) {
    sendLog("ERROR", "Ошибка парсинга JSON: " + String(error.c_str()));
    return;
  }
  
  // Получаем feedId (строка) и weight
  String feedId = doc["feedId"] | "";  // Пустая строка если поле отсутствует
  int weight = doc["weight"] | -1;     // -1 если поле отсутствует
  
  sendLog("INFO", "Получены данные: feedId=" + feedId + ", weight=" + String(weight));
  
  // Отправляем команду запуска двигателя в Serial (для ATMega)
  if (feedId.length() > 0 && weight != -1) {
    // Отправляем команду в формате FEED:100 для подачи указанного веса в граммах
    String command = "FEED:" + String(weight);
    Serial.println(command);  // Serial для связи с ATMega
    sendLog("INFO", "Отправлена команда " + command + " в Serial для контроллера");
  } else {
    sendLog("WARNING", "Неполные данные: feedId или weight отсутствуют");
  }
}

// ========== ФУНКЦИЯ ПОДКЛЮЧЕНИЯ К WiFi ==========
void connectWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  // Логирование после подключения к MQTT
}

// ========== ФУНКЦИЯ ПОДКЛЮЧЕНИЯ К MQTT ==========
void reconnectMQTT() {
  // Убеждаемся, что callback установлен
  client.setCallback(callback);
  
  while (!client.connected()) {
    // Используем фиксированный уникальный client ID для bunker
    const char* clientId = "ESP8266_Bunker";
    if (client.connect(clientId, mqttUser, mqttPassword)) {
      bool sub = client.subscribe(requestsTopic);
      // Логируем только один раз при успешном подключении
      if (sub) {
        sendLog("INFO", "MQTT подключен. Подписан на топик: " + String(requestsTopic));
      } else {
        sendLog("ERROR", "Ошибка подписки на топик: " + String(requestsTopic));
      }
    } else {
      delay(5000);
    }
  }
}

// ========== ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ WiFi И MQTT ==========
void initWiFiMQTT() {
  // Настройка MQTT
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);
  
  // Подключение к WiFi
  connectWiFi();
  
  // Подключение к MQTT
  reconnectMQTT();
}

// ========== ФУНКЦИЯ ОБНОВЛЕНИЯ MQTT (вызывать в loop) ==========
void updateMQTT() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();
}

// ========== НАЧАЛЬНАЯ НАСТРОЙКА ==========
void setup() {
  // Инициализация Serial для связи с ATMega (контроллером двигателя)
  // При правильной настройке переключателей Serial ESP8266 подключен к Serial ATMega
  Serial.begin(115200);
  delay(100);
  
  // Инициализация WiFi и MQTT
  initWiFiMQTT();
  
  // Логируем после подключения к MQTT
  sendLog("INFO", "Система bunker готова к работе");
}

// ========== ФУНКЦИЯ ОТПРАВКИ СООБЩЕНИЯ END В BUNKER ==========
void sendEndMessage() {
  // Создаём JSON сообщение End
  StaticJsonDocument<128> endDoc;
  endDoc["action"] = "End";
  endDoc["timestamp"] = millis();
  
  String endMessage;
  serializeJson(endDoc, endMessage);
  
  if (client.connected()) {
    client.publish(requestsTopic, endMessage.c_str());
    sendLog("INFO", "Отправлено сообщение End в топик bunker: " + endMessage);
  }
}

// ========== ФУНКЦИЯ ЧТЕНИЯ ОТВЕТОВ ОТ ATMEGA ==========
void checkATMegaResponses() {
  // Читаем ответы от ATMega из Serial (как в callback - собираем все байты)
  if (Serial.available() > 0) {
    String response = "";
    unsigned int availableBytes = Serial.available();
    response.reserve(availableBytes);
    
    // Читаем все доступные байты до символа новой строки
    while (Serial.available() > 0) {
      char c = Serial.read();
      if (c == '\n' || c == '\r') {
        break;  // Конец ответа
      }
      response += c;  // Добавляем все символы
    }
    
    response.trim();
    
    // Отправляем ответ от ATMega в MQTT логи
    if (response.length() > 0) {
      sendLog("INFO", "ATMega: " + response);
      
      // Проверяем, завершена ли подача корма
      if (response.indexOf("STATUS: Feeding completed") >= 0 || 
          response.indexOf("ERROR: Feeding stopped") >= 0) {
        // Подача корма завершена (успешно или с ошибкой) - отправляем End
        sendEndMessage();
      }
    }
  }
}

// ========== ГЛАВНЫЙ ЦИКЛ ==========
void loop() {
  // Обновление MQTT (проверка подключения и обработка сообщений)
  updateMQTT();
  
  // Проверка ответов от ATMega
  checkATMegaResponses();
  
  // Небольшая задержка для стабильности
  delay(10);
}
