#!/bin/sh
set -e

# Путь к файлу паролей
PASSWORD_FILE="/mosquitto/config/passwordfile"

# Создаем директорию, если её нет
mkdir -p /mosquitto/config

# Создаем пользователя, если файл паролей не существует
if [ ! -f "$PASSWORD_FILE" ]; then
    echo "Создание файла паролей и пользователя..."
    mosquitto_passwd -c -b "$PASSWORD_FILE" user iiot-mqtt-fish
    echo "Пользователь 'user' создан с паролем 'iiot-mqtt-fish'"
else
    # Проверяем, существует ли пользователь в файле
    if grep -q "^user:" "$PASSWORD_FILE" 2>/dev/null; then
        echo "Пользователь 'user' уже существует, обновляем пароль..."
        mosquitto_passwd -b "$PASSWORD_FILE" user iiot-mqtt-fish
    else
        echo "Добавляем пользователя 'user'..."
        mosquitto_passwd -b "$PASSWORD_FILE" user iiot-mqtt-fish
    fi
fi

# Устанавливаем правильные права доступа
chmod 644 "$PASSWORD_FILE"
chown mosquitto:mosquitto "$PASSWORD_FILE" 2>/dev/null || true

# Запускаем mosquitto с переданными аргументами
exec /usr/sbin/mosquitto "$@"
