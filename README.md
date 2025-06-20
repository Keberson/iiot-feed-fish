# Описание репозитория

IIoT курсовой проект на тему Автоматизированная система управления кормлением рыб (АСУ КР)

# Навигация

1. [Техническое задания](./docs/ТЗ.md)
2. [Требования к проекту](./docs/Требования.md)
3. [UserFlow диаграмма](./docs/userflow/UserFlow.pdf)
4. [Эксизный проект - Дизайн](./docs/sketches/design/DesignSketch.pdf)
5. [Отчетная докуменатция](./docs/reports)
6. [Документация API (Swagger)](./src/backend/SWAGGER_README.md)

# API документация

Проект включает в себя Swagger документацию для API. После запуска сервера документация доступна по адресам:

- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/

Для запуска сервера с документацией выполните:

```bash
cd src/backend
# На Windows
setup_swagger.bat
# На Linux/Mac
bash setup_swagger.sh
```

Подробная информация о документации API доступна в [SWAGGER_README.md](./src/backend/SWAGGER_README.md).
