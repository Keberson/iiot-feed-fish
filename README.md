# Описание репозитория

IIoT курсовой проект на тему Автоматизированная система управления кормлением рыб (АСУ КР)

# Навигация

1. [Описание продукта](./docs/Описание%20продукта.md)
2. [Техническое задания](./docs/ТЗ.md)
3. [Требования к проекту](./docs/Требования%20АСУ.md)
4. [Программно-методические инструкции (ПМИ)](./docs/ПМИ.md)
5. [UserFlow диаграмма](./docs/userflow/UserFlow.pdf)
6. [Эскизный проект - Дизайн](./docs/sketches/design/DesignSketch.pdf)
7. [Отчетная документация](./docs/reports)
8. [Документация API (Swagger)](./src/backend/SWAGGER_README.md)
9. [Инструкция по развороту](./docs/Инструкция%20по%20развороту.md)

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
