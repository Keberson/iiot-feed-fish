#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Apply migrations
echo "Applying migrations..."
python manage.py migrate

# Create a superuser (optional)
# python manage.py createsuperuser

# Run the development server
echo "Starting development server..."
python manage.py runserver 0.0.0.0:8000

echo "Swagger UI is available at http://localhost:8000/swagger/"
echo "ReDoc is available at http://localhost:8000/redoc/" 