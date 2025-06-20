from datetime import datetime, time, timedelta
from typing import List, Dict, Any, Optional
from itertools import permutations
import copy
import re

# --- Constants ---
FEEDING_DURATION_MINUTES = 3
DEFAULT_CART_SPEED_MPS = 0.05
DEFAULT_FEED_LOADING_TIME_SECONDS = 120
RETURN_HOME_THRESHOLD_HOURS = 2
# Tasks are considered a 'cluster' if their ideal times are within this window
CLUSTER_WINDOW_MINUTES = 15

# --- Working Hours ---
WORKING_HOURS_START = time(9, 0)  # 9:00
WORKING_HOURS_END = time(18, 0)   # 18:00
WORKING_HOURS_DURATION_MINUTES = (18 - 9) * 60  # 9 hours = 540 minutes

# --- Derived Constants ---
FEEDING_DURATION = timedelta(minutes=FEEDING_DURATION_MINUTES)
RETURN_HOME_THRESHOLD = timedelta(hours=RETURN_HOME_THRESHOLD_HOURS)
CLUSTER_WINDOW = timedelta(minutes=CLUSTER_WINDOW_MINUTES)

def calculate_period_times(period: str) -> List[time]:
    """
    Calculate feeding times based on the period within working hours (9:00-18:00).
    For periods like 'N раза в день', distributes feeding times across working hours:
    - For 1 time: middle of the day
    - For 2 times: beginning of the day and 1 hour before the end
    - For 3+ times: evenly distributed between beginning and 1 hour before the end
    """
    # For specific time format (e.g., "14:30")
    try:
        hour, minute = map(int, period.split(':'))
        return [time(hour, minute)]
    except (ValueError, AttributeError):
        pass
    
    # Try to extract number of feedings per day using regex
    pattern = r'(\d+)\s*раз[а]?\s*в\s*день'
    match = re.search(pattern, period)
    
    if match:
        num_feedings = int(match.group(1))
        if num_feedings <= 0:
            return [time(12, 0)]  # Default to noon for invalid values
        
        feeding_times = []
        
        # Start time is the beginning of working hours
        start_hour, start_minute = WORKING_HOURS_START.hour, WORKING_HOURS_START.minute
        
        # End time is 1 hour before the end of working hours
        end_hour, end_minute = WORKING_HOURS_END.hour - 1, WORKING_HOURS_END.minute
        
        # Calculate total minutes for start and end
        start_minutes = start_hour * 60 + start_minute
        end_minutes = end_hour * 60 + end_minute
        
        # Special cases
        if num_feedings == 1:
            # Middle of the day
            middle_minutes = (start_minutes + end_minutes) // 2
            hour = middle_minutes // 60
            minute = middle_minutes % 60
            feeding_times.append(time(hour, minute))
        
        elif num_feedings == 2:
            # Beginning of the day
            feeding_times.append(time(start_hour, start_minute))
            
            # 1 hour before the end
            feeding_times.append(time(end_hour, end_minute))
        
        else:
            # For 3+ feedings, distribute evenly between start and end (1 hour before end)
            feeding_times.append(time(start_hour, start_minute))  # First feeding at the beginning
            
            # Calculate intermediate feedings
            if num_feedings > 2:
                interval_minutes = (end_minutes - start_minutes) // (num_feedings - 1)
                
                for i in range(1, num_feedings - 1):
                    current_minutes = start_minutes + (i * interval_minutes)
                    hour = current_minutes // 60
                    minute = current_minutes % 60
                    feeding_times.append(time(hour, minute))
            
            feeding_times.append(time(end_hour, end_minute))  # Last feeding 1 hour before end
        
        return feeding_times
    
    # Default case - noon
    return [time(12, 0)]

def parse_period(period: str) -> List[time]:
    return calculate_period_times(period)

def calculate_linear_distance(pool1: str, pool2: str, pool_positions: Dict[str, float]) -> float:
    pos1 = pool_positions.get(pool1, 0.0)
    pos2 = pool_positions.get(pool2, 0.0)
    return abs(pos1 - pos2)

def sort_tasks_by_distance(tasks: List[Dict[str, Any]], pool_positions: Dict[str, float], reference_point: str = 'feeder') -> List[Dict[str, Any]]:
    """
    Sort tasks by distance from the reference point in descending order (farthest first).
    This helps prioritize distant pools when there's idle time available.
    """
    return sorted(tasks, key=lambda x: calculate_linear_distance(reference_point, x['pool'], pool_positions), reverse=True)

def generate_feeding_route(
    feeding_schedule: List[Dict[str, Any]],
    pool_positions: Dict[str, float],
    cart_speed: float,
    start_position: str = "home",
    start_time: Optional[datetime] = None,
    feed_loading_time_seconds: int = DEFAULT_FEED_LOADING_TIME_SECONDS
) -> List[Dict[str, Any]]:
    """
    Generates an optimized feeding route. It clusters tasks that are close in time
    and finds the optimal order of execution within each cluster to minimize travel time.
    When there's idle time available, it prioritizes distant pools first.
    """
    if start_time is None:
        start_time = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    planning_date = start_time.date()
    loading_duration = timedelta(seconds=feed_loading_time_seconds)

    # 1. Generate all individual tasks for the day
    all_tasks = []
    for entry in feeding_schedule:
        feeding_times = parse_period(entry['period'])
        for feed_time in feeding_times:
            ideal_datetime = datetime.combine(planning_date, feed_time)
            if ideal_datetime < start_time:
                ideal_datetime += timedelta(days=1)
            
            all_tasks.append({
                'pool': entry['pool'], 'feed': entry['feed'], 'weight': entry['weight'],
                'original_period': entry['period'], 'ideal_scheduled_time': ideal_datetime,
            })
    
    all_tasks.sort(key=lambda x: x['ideal_scheduled_time'])

    # 2. Group tasks into clusters
    task_clusters = []
    if all_tasks:
        current_cluster = [all_tasks[0]]
        for i in range(1, len(all_tasks)):
            # If the next task is within the time window of the first task in the cluster
            if all_tasks[i]['ideal_scheduled_time'] - current_cluster[0]['ideal_scheduled_time'] <= CLUSTER_WINDOW:
                current_cluster.append(all_tasks[i])
            else:
                task_clusters.append(current_cluster)
                current_cluster = [all_tasks[i]]
        task_clusters.append(current_cluster)

    # 3. Process each cluster to find the optimal internal route
    final_route = []
    cart_current_time = start_time
    cart_current_pos = start_position

    for cluster in task_clusters:
        best_route_for_cluster = []
        best_finish_time = None
        best_idle_time = None
        
        # Pre-sort cluster tasks by distance (farthest first) to influence permutation order
        # This helps prioritize distant pools when there's idle time available
        sorted_cluster = sort_tasks_by_distance(cluster, pool_positions)
        
        # Generate permutations with priority to distance-sorted order
        permutation_candidates = list(permutations(cluster))
        
        # Move distance-prioritized permutation to the front if it exists in candidates
        distance_prioritized = tuple(sorted_cluster)
        if distance_prioritized in permutation_candidates:
            permutation_candidates.remove(distance_prioritized)
            permutation_candidates.insert(0, distance_prioritized)

        # Find the best permutation (order) of tasks within the cluster
        for task_order_tuple in permutation_candidates:
            task_order = list(task_order_tuple)
            temp_route = []
            temp_cart_time = cart_current_time
            temp_cart_pos = cart_current_pos
            total_idle_time = timedelta(0)

            # Simulate the route for this specific task order
            for task in task_order:
                # --- JIT Calculation for a single task ---
                travel_feeder_pool_secs = calculate_linear_distance('feeder', task['pool'], pool_positions) / cart_speed
                travel_feeder_pool_duration = timedelta(seconds=travel_feeder_pool_secs)
                ideal_arrival_at_pool = task['ideal_scheduled_time']
                ideal_departure_from_feeder = ideal_arrival_at_pool - travel_feeder_pool_duration
                ideal_loading_start = ideal_departure_from_feeder - loading_duration
                travel_current_to_feeder_secs = calculate_linear_distance(temp_cart_pos, 'feeder', pool_positions) / cart_speed
                travel_current_to_feeder_duration = timedelta(seconds=travel_current_to_feeder_secs)
                ideal_departure_from_current_pos = ideal_loading_start - travel_current_to_feeder_duration
                
                # Calculate idle time before this task
                if temp_cart_time < ideal_departure_from_current_pos:
                    idle_time = ideal_departure_from_current_pos - temp_cart_time
                    total_idle_time += idle_time
                
                actual_departure_time = max(temp_cart_time, ideal_departure_from_current_pos)
                
                actual_arrival_at_feeder = actual_departure_time + travel_current_to_feeder_duration
                actual_loading_start = actual_arrival_at_feeder
                actual_loading_finish = actual_loading_start + loading_duration
                actual_arrival_at_pool = actual_loading_finish + travel_feeder_pool_duration
                actual_feeding_start = actual_arrival_at_pool
                actual_feeding_finish = actual_feeding_start + FEEDING_DURATION

                # Add loading and feeding tasks to the temporary route for this permutation
                loading_task = copy.deepcopy(task)
                loading_task.update({
                    'pool': 'feeder', 'arrival_time': actual_arrival_at_feeder, 'actual_start_time': actual_loading_start,
                    'finish_time': actual_loading_finish, 'task_type': 'loading'
                })
                feeding_task = copy.deepcopy(task)
                feeding_task.update({
                     'arrival_time': actual_arrival_at_pool, 'actual_start_time': actual_feeding_start,
                    'finish_time': actual_feeding_finish, 'task_type': 'feeding'
                })
                temp_route.extend([loading_task, feeding_task])
                
                temp_cart_time = actual_feeding_finish
                temp_cart_pos = task['pool']

            # After trying one permutation, check if it's the best so far
            # First priority: minimize finish time
            # Second priority: when finish times are equal, prefer the route with distant pools first
            if (best_finish_time is None or 
                temp_cart_time < best_finish_time or 
                (temp_cart_time == best_finish_time and 
                 (best_idle_time is None or total_idle_time < best_idle_time))):
                best_finish_time = temp_cart_time
                best_idle_time = total_idle_time
                best_route_for_cluster = temp_route

        # Add the best found route for this cluster to the final route
        final_route.extend(best_route_for_cluster)
        
        # Update the cart's state for the next cluster
        # The finish time and position are taken from the last task of the *best* route
        if best_route_for_cluster:
            last_task_in_cluster = best_route_for_cluster[-1]
            cart_current_time = last_task_in_cluster['finish_time']
            cart_current_pos = last_task_in_cluster['pool']

        # --- Return home logic (applied AFTER each cluster) ---
        next_cluster_start_time = None
        if task_clusters.index(cluster) < len(task_clusters) - 1:
            next_cluster_start_time = task_clusters[task_clusters.index(cluster) + 1][0]['ideal_scheduled_time']
        
        if next_cluster_start_time and (next_cluster_start_time - cart_current_time) > RETURN_HOME_THRESHOLD:
            travel_to_home_time_secs = calculate_linear_distance(cart_current_pos, 'home', pool_positions) / cart_speed
            arrival_at_home = cart_current_time + timedelta(seconds=travel_to_home_time_secs)
            final_route.append({
                'pool': 'home', 'feed': None, 'weight': 0, 'original_period': 'return',
                'ideal_scheduled_time': cart_current_time, 'arrival_time': arrival_at_home,
                'actual_start_time': arrival_at_home, 'finish_time': arrival_at_home,
                'task_type': 'return', 'status': 'planned'
            })
            cart_current_time = arrival_at_home
            cart_current_pos = 'home'

    # After all clusters are processed, send the cart home
    if cart_current_pos != 'home':
        travel_to_home_time_secs = calculate_linear_distance(cart_current_pos, 'home', pool_positions) / cart_speed
        arrival_at_home = cart_current_time + timedelta(seconds=travel_to_home_time_secs)
        final_route.append({
            'pool': 'home', 'feed': None, 'weight': 0, 'original_period': 'return',
            'ideal_scheduled_time': cart_current_time, 'arrival_time': arrival_at_home,
            'actual_start_time': arrival_at_home, 'finish_time': arrival_at_home,
            'task_type': 'return', 'status': 'planned'
        })

    return final_route


def get_daily_feeding_schedule(
    feeding_schedule: List[Dict[str, Any]],
    pool_positions: Dict[str, float],
    cart_speed: float,
    date: Optional[datetime] = None
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Get a complete daily feeding schedule organized by time slots.
    """
    if date is None:
        date = datetime.now()

    start_time_for_schedule = date.replace(hour=0, minute=0, second=0, microsecond=0)
    route = generate_feeding_route(feeding_schedule, pool_positions, cart_speed, start_time=start_time_for_schedule)

    time_slots = {}
    feeding_tasks = [task for task in route if task.get('task_type') == 'feeding']
    
    for task in feeding_tasks:
        time_key = task['ideal_scheduled_time'].strftime('%H:%M')
        if time_key not in time_slots:
            time_slots[time_key] = []
        time_slots[time_key].append(task)

    return dict(sorted(time_slots.items()))

# Example usage:
if __name__ == "__main__":
    example_schedule = [
        {'pool': 'Бассейн 1', 'feed': 'Корм №1', 'weight': 500, 'period': '2 раза в день'},
        {'pool': 'Бассейн 2', 'feed': 'Корм №2', 'weight': 300, 'period': '3 раза в день'},
        {'pool': 'Бассейн 3', 'feed': 'Корм №1', 'weight': 400, 'period': '4 раза в день'},
        {'pool': 'Бассейн 4', 'feed': 'Корм №3', 'weight': 200, 'period': '18:00'},
        {'pool': 'Бассейн 4', 'feed': 'Корм №1', 'weight': 400, 'period': '5 раз в день'},
    ]
    
    example_positions = { 'home': 0, 'feeder': 5, 'Бассейн 1': 10, 'Бассейн 2': 40, 'Бассейн 3': 65, 'Бассейн 4': 100 }
    
    start_time = datetime.now().replace(hour=7, minute=0, second=0, microsecond=0)
    
    print(f"Generating feeding route with cart speed: {DEFAULT_CART_SPEED_MPS} m/s\n")
    
    route = generate_feeding_route(
        example_schedule, 
        example_positions, 
        DEFAULT_CART_SPEED_MPS,
        start_time=start_time,
        feed_loading_time_seconds=DEFAULT_FEED_LOADING_TIME_SECONDS
    )
    
    # --- Print static route details ---
    print("--- Optimized Feeding Route ---")
    print("-------------------------------")
    for i, task in enumerate(route):
        task_type = task.get('task_type', 'unknown')
        if task_type == 'loading':
            start_time_str = task['actual_start_time'].strftime('%H:%M:%S')
            finish_time_str = task['finish_time'].strftime('%H:%M:%S')
            print(f"{i+1}. Загрузка корма: {task['feed']} ({task['weight']}г) -> {start_time_str}-{finish_time_str}")
        elif task_type == 'feeding':
            ideal_time = task['ideal_scheduled_time'].strftime('%H:%M:%S')
            start_time_str = task['actual_start_time'].strftime('%H:%M:%S')
            finish_time_str = task['finish_time'].strftime('%H:%M:%S')
            print(f"{i+1}. Кормление: {task['pool']} (Идеальное: {ideal_time}) -> Начало: {start_time_str}, Конец: {finish_time_str}")
        elif task_type == 'return':
            arrive_time_str = task['arrival_time'].strftime('%H:%M:%S')
            print(f"{i+1}. Возвращение домой: {arrive_time_str}")