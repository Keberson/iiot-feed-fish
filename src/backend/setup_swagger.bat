@echo off
echo Installing dependencies...
pip install -r requirements.txt

echo Applying migrations...
python manage.py migrate

rem Create a superuser (optional)
rem python manage.py createsuperuser

echo Starting development server...
python manage.py runserver 0.0.0.0:8000

echo Swagger UI is available at http://localhost:8000/swagger/
echo ReDoc is available at http://localhost:8000/redoc/ 