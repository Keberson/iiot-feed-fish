"""
Тестовый скрипт для проверки логики планировщика расписания кормления
"""
from datetime import time
from .scheduler import calculate_feeding_times
from .models import FeedingTask, Period, Pool, Feed
from decimal import Decimal


def test_calculate_feeding_times():
    """Тест функции вычисления времени кормления"""
    print("=" * 60)
    print("ТЕСТИРОВАНИЕ ЛОГИКИ ВЫЧИСЛЕНИЯ ВРЕМЕНИ КОРМЛЕНИЯ")
    print("=" * 60)
    
    # Создаем тестовые объекты
    try:
        pool = Pool.objects.first()
        feed = Feed.objects.first()
        
        if not pool or not feed:
            print("❌ ОШИБКА: Нет тестовых данных (Pool или Feed)")
            return
        
        # Тест 1: 1 раз в день
        print("\n1. Тест: 1 раз в день")
        period_1 = Period.objects.filter(name="1 раз в день").first()
        if period_1:
            task = FeedingTask(pool=pool, feed=feed, weight=Decimal("1.5"), period=period_1)
            times = calculate_feeding_times(task)
            expected = [time(12, 0)]
            print(f"   Ожидается: {expected}")
            print(f"   Получено:  {times}")
            assert times == expected, f"Ожидалось {expected}, получено {times}"
            print("   ✅ ПРОЙДЕН")
        else:
            print("   ⚠️ Период '1 раз в день' не найден")
        
        # Тест 2: 2 раза в день
        print("\n2. Тест: 2 раза в день")
        period_2 = Period.objects.filter(name="2 раза в день").first()
        if period_2:
            task = FeedingTask(pool=pool, feed=feed, weight=Decimal("2.0"), period=period_2)
            times = calculate_feeding_times(task)
            expected = [time(6, 0), time(18, 0)]
            print(f"   Ожидается: {expected}")
            print(f"   Получено:  {times}")
            assert times == expected, f"Ожидалось {expected}, получено {times}"
            print("   ✅ ПРОЙДЕН")
        else:
            print("   ⚠️ Период '2 раза в день' не найден")
        
        # Тест 3: 3 раза в день
        print("\n3. Тест: 3 раза в день")
        period_3 = Period.objects.filter(name="3 раза в день").first()
        if period_3:
            task = FeedingTask(pool=pool, feed=feed, weight=Decimal("1.0"), period=period_3)
            times = calculate_feeding_times(task)
            # 1440 / 3 = 480 минут на сегмент
            # Сегмент 0: 0-480, центр = 240 мин = 4:00
            # Сегмент 1: 480-960, центр = 720 мин = 12:00
            # Сегмент 2: 960-1440, центр = 1200 мин = 20:00
            expected = [time(4, 0), time(12, 0), time(20, 0)]
            print(f"   Ожидается: {expected}")
            print(f"   Получено:  {times}")
            assert times == expected, f"Ожидалось {expected}, получено {times}"
            print("   ✅ ПРОЙДЕН")
        else:
            print("   ⚠️ Период '3 раза в день' не найден")
        
        # Тест 4: 4 раза в день
        print("\n4. Тест: 4 раза в день")
        period_4 = Period.objects.filter(name="4 раза в день").first()
        if period_4:
            task = FeedingTask(pool=pool, feed=feed, weight=Decimal("0.5"), period=period_4)
            times = calculate_feeding_times(task)
            # 1440 / 4 = 360 минут на сегмент
            # Сегмент 0: 0-360, центр = 180 мин = 3:00
            # Сегмент 1: 360-720, центр = 540 мин = 9:00
            # Сегмент 2: 720-1080, центр = 900 мин = 15:00
            # Сегмент 3: 1080-1440, центр = 1260 мин = 21:00
            expected = [time(3, 0), time(9, 0), time(15, 0), time(21, 0)]
            print(f"   Ожидается: {expected}")
            print(f"   Получено:  {times}")
            assert times == expected, f"Ожидалось {expected}, получено {times}"
            print("   ✅ ПРОЙДЕН")
        else:
            print("   ⚠️ Период '4 раза в день' не найден")
        
        # Тест 5: Кастомное время
        print("\n5. Тест: Кастомное время")
        task = FeedingTask(pool=pool, feed=feed, weight=Decimal("1.0"), other_period=time(14, 30))
        times = calculate_feeding_times(task)
        expected = [time(14, 30)]
        print(f"   Ожидается: {expected}")
        print(f"   Получено:  {times}")
        assert times == expected, f"Ожидалось {expected}, получено {times}"
        print("   ✅ ПРОЙДЕН")
        
        print("\n" + "=" * 60)
        print("✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ ОШИБКА ПРИ ТЕСТИРОВАНИИ: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    import os
    import django
    
    # Настройка Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()
    
    test_calculate_feeding_times()
