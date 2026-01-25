// ========== CART_WIFI.INO ==========
// Файл для работы с WiFi и MQTT подключением тележки

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

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

// ========== НАСТРОЙКИ WiFi ==========
const char* ssid = "kv_226";
const char* password = "wuxwfbna";

// ========== НАСТРОЙКИ MQTT ==========
const char* mqttServer = "158.160.94.8";
const int mqttPort = 1883;
const char* mqttUser = "user";
const char* mqttPassword = "iiot-mqtt-fish";
const char* cartTopic = "cart";        // Топик для получения команд тележке
const char* bunkerTopic = "bunker";    // Топик для отправки команд бункеру
const char* logsTopic = "logs";        // Топик для логов

// ========== ГЛОБАЛЬНЫЕ ОБЪЕКТЫ ==========
WiFiClient espClient;
PubSubClient client(espClient);

// ========== СОСТОЯНИЕ ТЕЛЕЖКИ ==========
CartState currentState = IDLE;
String currentPoolId = "";
String currentFeedId = "";
float currentWeight = -1;
String currentPoolName = "";
String currentFeedName = "";

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
  
  // Отправляем в топик логов
  if (client.connected()) {
    client.publish(logsTopic, logString.c_str());
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
  
  String topicStr = String(topic);
  
  // Обработка сообщений из топика cart
  if (topicStr == cartTopic) {
    sendLog("INFO", "Получено сообщение из cart: " + message);
    processCartMessage(message);
  }
  // Обработка сообщений из топика bunker
  else if (topicStr == bunkerTopic) {
    sendLog("INFO", "Получено сообщение из bunker: " + message);
    processBunkerMessage(message);
  } else {
    // Неизвестный топик
    sendLog("WARNING", "Получено сообщение из неизвестного топика: " + topicStr + " сообщение: " + message);
  }
}

// ========== ФУНКЦИЯ ОБРАБОТКИ СООБЩЕНИЙ ИЗ CART ==========
void processCartMessage(String jsonString) {
  // Создаём JSON документ
  StaticJsonDocument<512> doc;
  
  // Парсим JSON строку
  DeserializationError error = deserializeJson(doc, jsonString);
  
  // Проверяем на ошибки парсинга
  if (error) {
    sendLog("ERROR", "Ошибка парсинга JSON из cart: " + String(error.c_str()));
    return;
  }
  
  // Получаем данные из нового формата
  String poolId = doc["pool_id"] | "";
  String feedId = doc["feed_id"] | "";
  float weight = doc["weight"] | -1.0;
  String poolName = doc["pool_name"] | "";
  String feedName = doc["feed_name"] | "";
  
  sendLog("INFO", "Получены данные из cart: pool_id=" + poolId + ", feed_id=" + feedId + ", weight=" + String(weight) + ", pool_name=" + poolName + ", feed_name=" + feedName);
  
  // Проверяем, что мы в состоянии IDLE
  if (currentState != IDLE) {
    sendLog("WARNING", "Получено сообщение из cart, но тележка не в состоянии IDLE. Текущее состояние: " + String(currentState));
    return;
  }
  
  // Проверяем наличие обязательных полей
  if (feedId.length() == 0 || weight < 0) {
    sendLog("ERROR", "Неполные данные: feed_id или weight отсутствуют");
    return;
  }
  
  // Сохраняем данные
  currentPoolId = poolId;
  currentFeedId = feedId;
  currentWeight = weight;
  currentPoolName = poolName;
  currentFeedName = feedName;
  
  // Отправляем команду в bunker (формат для bunker: feedId и weight)
  // Преобразуем feed_id (UUID строка) в числовой feedId для bunker
  // Если bunker принимает строку, можно оставить как есть
  StaticJsonDocument<256> bunkerDoc;
  bunkerDoc["feedId"] = feedId;  // Отправляем как строку UUID
  bunkerDoc["weight"] = (int)(weight * 1000);  // Преобразуем в граммы (целое число)
  
  String bunkerMessage;
  serializeJson(bunkerDoc, bunkerMessage);
  
  if (client.connected()) {
    client.publish(bunkerTopic, bunkerMessage.c_str());
    sendLog("INFO", "Отправлено сообщение в bunker: " + bunkerMessage);
  }
  
  // Переходим в состояние WAITING_FOR_FEED
  currentState = WAITING_FOR_FEED;
  sendLog("INFO", "Переход в состояние WAITING_FOR_FEED");
}

// ========== ФУНКЦИЯ ОБРАБОТКИ СООБЩЕНИЙ ИЗ BUNKER ==========
void processBunkerMessage(String jsonString) {
  // Создаём JSON документ
  StaticJsonDocument<256> doc;
  
  // Парсим JSON строку
  DeserializationError error = deserializeJson(doc, jsonString);
  
  // Проверяем на ошибки парсинга
  if (error) {
    sendLog("ERROR", "Ошибка парсинга JSON из bunker: " + String(error.c_str()));
    return;
  }
  
  // Проверяем action
  String action = doc["action"] | "";
  
  if (action == "End") {
    sendLog("INFO", "Получено сообщение End из bunker");
    
    // Проверяем, что мы в состоянии WAITING_FOR_FEED
    if (currentState != WAITING_FOR_FEED) {
      sendLog("WARNING", "Получено End из bunker, но тележка не в состоянии WAITING_FOR_FEED. Текущее состояние: " + String(currentState));
      return;
    }
    
    // Переходим в состояние MOVING_TO_DUMP
    currentState = MOVING_TO_DUMP;
    sendLog("INFO", "Насыпание закончено, начинаем движение. Переход в состояние MOVING_TO_DUMP");
    
    // Отправляем команду START в Serial для ATMega (начать движение)
    Serial.println("START");
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
    // Используем фиксированный уникальный client ID для cart
    const char* clientId = "ESP8266_Cart";
    if (client.connect(clientId, mqttUser, mqttPassword)) {
      // Подписываемся на топики
      bool sub1 = client.subscribe(cartTopic);
      bool sub2 = client.subscribe(bunkerTopic);
      // Логируем только один раз при успешном подключении
      if (sub1 && sub2) {
        sendLog("INFO", "MQTT подключен. Подписан на топики: " + String(cartTopic) + ", " + String(bunkerTopic));
      } else {
        sendLog("ERROR", "Ошибка подписки на топики. cart=" + String(sub1) + " bunker=" + String(sub2));
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
  
  // Логируем успешную инициализацию один раз
  sendLog("INFO", "WiFi подключен. IP: " + WiFi.localIP().toString());
}

// ========== ФУНКЦИЯ ОБНОВЛЕНИЯ MQTT (вызывать в loop) ==========
void updateMQTT() {
  if (!client.connected()) {
    reconnectMQTT();
  } else {
    // Важно: вызывать loop() для обработки входящих сообщений
    client.loop();
  }
}

// ========== ФУНКЦИЯ ОБРАБОТКИ СОСТОЯНИЙ ==========
void processState() {
  // Читаем ответы от ATMega из Serial
  while (Serial.available() > 0) {
    String response = "";
    unsigned long startTime = millis();
    
    // Читаем с таймаутом (ждем до 200мс для получения полного сообщения)
    while (millis() - startTime < 200) {
      if (Serial.available() > 0) {
        char c = Serial.read();
        if (c == '\n' || c == '\r') {
          // Конец строки - обрабатываем сообщение
          break;
        }
        // Добавляем только печатные символы
        if (c >= 32 && c <= 126) {
          response += c;
        }
      } else {
        // Если нет данных, небольшая задержка
        delay(2);
      }
    }
    
    response.trim();
    
    // Пропускаем пустые сообщения
    if (response.length() == 0) {
      continue;
    }
    
    // Обработка ответов от ATMega
    if (response.startsWith("STATE:")) {
      // Получено изменение состояния от ATMega
      String stateStr = response.substring(6);
      stateStr.trim();
      if (stateStr == "AT_DUMP_LOCATION") {
        currentState = AT_DUMP_LOCATION;
        sendLog("INFO", "Достигли точки высыпания. Переход в состояние AT_DUMP_LOCATION");
        
        // Переходим в FEEDING через 10 секунд
        sendLog("INFO", "Начинаем подачу корма (10 секунд)");
        Serial.println("FEEDING:10000");
      }
      else if (stateStr == "FEEDING_DONE") {
        currentState = RETURNING;
        sendLog("INFO", "Подача корма завершена. Переход в состояние RETURNING");
        Serial.println("RETURNING");
      }
      else if (stateStr == "RETURNED") {
        currentState = IDLE;
        sendLog("INFO", "Вернулись к бункеру. Переход в состояние IDLE");
        // Сбрасываем данные
        currentPoolId = "";
        currentFeedId = "";
        currentWeight = -1;
        currentPoolName = "";
        currentFeedName = "";
      }
    }
    else if (response.startsWith("LOG:")) {
      // Лог от ATMega - просто пересылаем в MQTT
      String logMsg = response.substring(4);
      logMsg.trim();
      sendLog("INFO", "ATMega: " + logMsg);
    }
  }
}

// ========== НАЧАЛЬНАЯ НАСТРОЙКА ==========
void setup() {
  // Инициализация Serial для связи с ATMega
  Serial.begin(115200);
  delay(100);
  
  // Инициализация WiFi и MQTT
  initWiFiMQTT();
  
  // Логируем после подключения к MQTT
  sendLog("INFO", "Система cart готова к работе. Состояние: IDLE");
}

// ========== ГЛАВНЫЙ ЦИКЛ ==========
void loop() {
  // Обновление MQTT (проверка подключения и обработка сообщений)
  updateMQTT();
  
  // Обработка состояний и ответов от ATMega
  processState();
  
  // Небольшая задержка для стабильности
  delay(10);
}
