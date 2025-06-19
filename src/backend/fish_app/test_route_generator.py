from route_generator import generate_feeding_route, get_daily_feeding_schedule
import json
from datetime import datetime, timedelta, time as dt_time
import time
import os
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.patches import Rectangle, Circle, FancyArrowPatch
from matplotlib.lines import Line2D
from matplotlib import gridspec

# --- Configurable Constants ---
# Speed of the cart in meters per second.
CART_SPEED_MPS = 0.05  # 0.05 m/s
# Time required to load feed at the feeding station, in seconds
FEED_LOADING_TIME = 120  # 2 minutes to load feed
# Name for the output animation file.
OUTPUT_ANIMATION_FILE = 'feeding_route_animation.mp4'
# Default time range for animation if user input is skipped.
DEFAULT_ANIMATION_START_HOUR = 8
DEFAULT_ANIMATION_END_HOUR = 19
# Time threshold for returning to feeder after feeding (in hours)
RETURN_TO_FEEDER_THRESHOLD_HOURS = 2


class RouteAnimator:
    """
    Creates an animation of the cart's movement along the rail.
    """
    def __init__(self, route, pool_positions, cart_speed, **kwargs):
        self.route = route
        self.pool_positions = pool_positions
        self.cart_speed = cart_speed
        self.fps = kwargs.get('fps', 15)
        self.dpi = kwargs.get('dpi', 100)
        self.start_hour = kwargs.get('start_hour', DEFAULT_ANIMATION_START_HOUR)
        self.start_minute = kwargs.get('start_minute', 0)
        self.end_hour = kwargs.get('end_hour', DEFAULT_ANIMATION_END_HOUR)
        self.end_minute = kwargs.get('end_minute', 0)

        self.fig = None
        self.axes = {}
        self.artists = {}
        self.timeline_events = []
        self.frame_times = []
        self.start_time = None
        self.end_time = None
        self.total_duration = 0
        self.trail_length = 10

    def create_animation(self, output_file='feeding_route_animation.mp4'):
        """
        Generates and saves the feeding route animation.
        """
        print(f"\nСоздание анимации маршрута кормления ({self.start_hour:02d}:{self.start_minute:02d}-{self.end_hour:02d}:{self.end_minute:02d})...")

        if not self._prepare_data():
            return

        self._setup_figure()
        self._draw_static_elements()
        self._create_animated_artists()
        self._build_timeline()
        self._interpolate_initial_state()
        self._generate_frames()

        if not self.frame_times:
            print("Нет кадров для создания анимации.")
            if self.fig:
                plt.close(self.fig)
            return

        anim = animation.FuncAnimation(
            self.fig,
            self._update_frame,
            frames=len(self.frame_times),
            interval=1000 / self.fps,
            blit=True
        )

        writer = animation.FFMpegWriter(fps=self.fps)
        anim.save(output_file, writer=writer, dpi=self.dpi)

        print(f"Анимация сохранена в файл: {output_file}")
        print(f"Длительность видео: ~{len(self.frame_times) / self.fps:.1f} секунд")
        plt.close(self.fig)

    def _prepare_data(self):
        """
        Initializes time objects and filters tasks.
        """
        if not self.route:
            print("Маршрут пуст, анимация не будет создана.")
            return False

        first_task_time = datetime.strptime(self.route[0]['arrival_time'], '%Y-%m-%d %H:%M:%S')
        base_date = first_task_time.date()

        self.start_time = datetime.combine(base_date, dt_time(hour=self.start_hour, minute=self.start_minute))
        self.end_time = datetime.combine(base_date, dt_time(hour=self.end_hour, minute=self.end_minute))
        self.total_duration = (self.end_time - self.start_time).total_seconds()
        
        if self.total_duration <= 0:
            print("Некорректный временной интервал.")
            return False

        return True

    def _setup_figure(self):
        """
        Sets up the matplotlib figure and axes.
        """
        self.fig = plt.figure(figsize=(12, 8))
        gs = gridspec.GridSpec(3, 1, height_ratios=[1, 3, 1])
        self.axes = {
            'timeline': plt.subplot(gs[0]),
            'main': plt.subplot(gs[1]),
            'info': plt.subplot(gs[2])
        }

    def _draw_static_elements(self):
        """
        Draws static elements like the rail and pools onto the main axes.
        """
        ax_main = self.axes['main']
        ax_main.set_xlim(0, max(self.pool_positions.values()) * 1.1)
        ax_main.set_ylim(-1.5, 1.5)
        ax_main.set_yticks([])
        ax_main.set_title(f'Симуляция маршрута кормления ({self.start_hour:02d}:{self.start_minute:02d}-{self.end_hour:02d}:{self.end_minute:02d})', fontsize=16)

        rail_line = Line2D([0, max(self.pool_positions.values())], [0, 0], color='gray', linewidth=5, zorder=1)
        ax_main.add_line(rail_line)

        for name, pos in self.pool_positions.items():
            color = 'blue'
            label = f'Бассейн {name.split(" ")[-1]}'
            if name == 'home':
                color, label = 'green', 'Дом'
            elif name == 'feeder':
                color, label = 'orange', 'Кормушка'
            
            circle = Circle((pos, 0), 0.7, color=color, zorder=2, alpha=0.7)
            ax_main.add_patch(circle)
            ax_main.text(pos, -0.9, label, ha='center', fontsize=12, fontweight='bold')

    def _create_animated_artists(self):
        """
        Creates all the animated artists for the plot.
        """
        ax_main, ax_timeline, ax_info = self.axes['main'], self.axes['timeline'], self.axes['info']

        cart_width, cart_height = 1.5, 1.0
        self.artists = {
            'cart': Rectangle((-cart_width / 2, -cart_height / 2), cart_width, cart_height, color='red', zorder=3, alpha=0.9),
            'cart_direction': FancyArrowPatch((0, 0), (0.8, 0), color='white', zorder=4, arrowstyle='-|>', mutation_scale=15),
            'trail_dots': [Circle((-10, 0), 0.2, color='red', alpha=(self.trail_length - i) / self.trail_length * 0.5, zorder=2) for i in range(self.trail_length)],
            'time_text': ax_timeline.text(0.02, 0.5, '', transform=ax_timeline.transAxes, fontsize=14),
            'status_text': ax_info.text(0.02, 0.7, '', transform=ax_info.transAxes, fontsize=14),
            'task_text': ax_info.text(0.02, 0.3, '', transform=ax_info.transAxes, fontsize=14),
            'feed_text': ax_info.text(0.02, 0.1, '', transform=ax_info.transAxes, fontsize=14),
            'speed_text': ax_info.text(0.7, 0.5, '', transform=ax_info.transAxes, fontsize=12),
            'time_marker': ax_timeline.axvline(x=0, color='red', linewidth=2)
        }

        ax_main.add_patch(self.artists['cart'])
        ax_main.add_patch(self.artists['cart_direction'])
        for dot in self.artists['trail_dots']:
            ax_main.add_patch(dot)

        ax_timeline.set_xlim(0, self.total_duration)
        ax_timeline.set_ylim(0, 1)
        ax_timeline.set_yticks([])
        ax_timeline.set_title(f'Временная шкала ({self.start_hour:02d}:{self.start_minute:02d}-{self.end_hour:02d}:{self.end_minute:02d})', fontsize=14)
        
        for minutes in range(0, int(self.total_duration / 60) + 1, 15):
            marker_time = self.start_time + timedelta(minutes=minutes)
            seconds_from_start = minutes * 60
            if seconds_from_start <= self.total_duration:
                ax_timeline.axvline(x=seconds_from_start, color='gray', linestyle='--', alpha=0.7)
                ax_timeline.text(seconds_from_start, 0.1, marker_time.strftime('%H:%M'), ha='center', va='bottom', fontsize=10)

        ax_info.set_xlim(0, 1)
        ax_info.set_ylim(0, 1)
        ax_info.set_xticks([])
        ax_info.set_yticks([])
        ax_info.set_title('Информация о текущей задаче', fontsize=14)

    def _build_timeline(self):
            """
            Builds a timeline of events, calculating departure times based on fixed speed
            to ensure the cart waits and then travels, rather than traveling slowly.
            """
            cart_initial_pos = self.pool_positions['home']
            self.timeline_events.append({'time': self.start_time, 'event_type': 'initial', 'position': cart_initial_pos})

            last_position_m = cart_initial_pos
            last_time = self.start_time
            
            pos_to_name = {v: k for k, v in self.pool_positions.items()}

            sorted_route = sorted(self.route, key=lambda x: datetime.strptime(x['arrival_time'], '%Y-%m-%d %H:%M:%S'))

            for i, task in enumerate(sorted_route):
                arrival = datetime.strptime(task['arrival_time'], '%Y-%m-%d %H:%M:%S')
                start = datetime.strptime(task['actual_start_time'], '%Y-%m-%d %H:%M:%S')
                finish = datetime.strptime(task['finish_time'], '%Y-%m-%d %H:%M:%S')
                target_position_m = self.pool_positions[task['pool']]
                task_type = task.get('task_type', 'feeding')

                # --- CRITICAL FIX: Calculate when the cart MUST depart ---
                distance = abs(target_position_m - last_position_m)
                travel_seconds = (distance / self.cart_speed) if self.cart_speed > 0 else 0
                departure_time = arrival - timedelta(seconds=travel_seconds)

                # 1. Idle Period: If the cart has time, it waits at its last location.
                if last_time < departure_time:
                    location_name = pos_to_name.get(last_position_m, "неизвестно")
                    if location_name == 'home':
                        location_name = 'Дом'
                    elif location_name == 'feeder':
                        location_name = 'Кормушка'
                    self.timeline_events.append({
                        'time': last_time,
                        'event_type': 'idle_start',
                        'position': last_position_m, # Position is consistent
                        'location_name': location_name
                    })
                    self.timeline_events.append({
                        'time': departure_time,
                        'event_type': 'idle_end',
                        'position': last_position_m, # FIX: Ensure idle_end has a position
                    })

                # 2. Travel Period: The cart moves at a fixed speed.
                self.timeline_events.append({
                    'time': departure_time,
                    'event_type': 'travel_start',
                    'position': last_position_m, # Starting position of travel
                    'from_position': last_position_m,
                    'to_position': target_position_m,
                    'task': task
                })
                self.timeline_events.append({
                    'time': arrival,
                    'event_type': 'arrival',
                    'position': target_position_m, # Position at arrival
                    'task': task
                })

                # 3. Waiting at Destination (if any)
                if arrival < start:
                    self.timeline_events.extend([
                        {'time': arrival, 'event_type': 'waiting_start', 'position': target_position_m, 'task': task},
                        {'time': start, 'event_type': 'waiting_end', 'position': target_position_m, 'task': task}
                    ])

                # 4. Performing the Task
                if task_type != 'return':
                    self.timeline_events.extend([
                        {'time': start, 'event_type': f'{task_type}_start', 'position': target_position_m, 'task': task},
                        {'time': finish, 'event_type': f'{task_type}_end', 'position': target_position_m, 'task': task}
                    ])

                # 5. NEW: Return to feeder after feeding if the next task is within 2 hours
                if task_type == 'feeding' and i < len(sorted_route) - 1:
                    next_task = sorted_route[i + 1]
                    next_task_time = datetime.strptime(next_task['arrival_time'], '%Y-%m-%d %H:%M:%S')
                    time_until_next_task = next_task_time - finish
                    
                    # If the next task is within the threshold but not immediate, return to feeder
                    if timedelta(minutes=5) < time_until_next_task <= timedelta(hours=RETURN_TO_FEEDER_THRESHOLD_HOURS):
                        # Calculate travel time to feeder
                        feeder_position_m = self.pool_positions['feeder']
                        distance_to_feeder = abs(target_position_m - feeder_position_m)
                        travel_to_feeder_seconds = (distance_to_feeder / self.cart_speed) if self.cart_speed > 0 else 0
                        
                        # Add travel to feeder events
                        feeder_departure_time = finish
                        feeder_arrival_time = finish + timedelta(seconds=travel_to_feeder_seconds)
                        
                        self.timeline_events.extend([
                            {
                                'time': feeder_departure_time,
                                'event_type': 'travel_start',
                                'position': target_position_m,
                                'from_position': target_position_m,
                                'to_position': feeder_position_m,
                                'task': {'pool': 'feeder', 'task_type': 'return_to_feeder'}
                            },
                            {
                                'time': feeder_arrival_time,
                                'event_type': 'arrival',
                                'position': feeder_position_m,
                                'task': {'pool': 'feeder', 'task_type': 'return_to_feeder'}
                            }
                        ])
                        
                        # Add idle events for waiting at the feeder until next task
                        next_task_departure_time = next_task_time - timedelta(seconds=travel_to_feeder_seconds)
                        if feeder_arrival_time < next_task_departure_time:
                            self.timeline_events.extend([
                                {
                                    'time': feeder_arrival_time,
                                    'event_type': 'idle_start',
                                    'position': feeder_position_m,
                                    'location_name': 'Кормушка'
                                },
                                {
                                    'time': next_task_departure_time,
                                    'event_type': 'idle_end',
                                    'position': feeder_position_m
                                }
                            ])
                        
                        # Update last position and time for the next iteration
                        last_position_m = feeder_position_m
                        last_time = feeder_arrival_time
                        continue

                # Update state for the next iteration
                last_position_m = target_position_m
                last_time = finish

            self.timeline_events.append({'time': self.end_time, 'event_type': 'end', 'position': last_position_m})
            self.timeline_events.sort(key=lambda x: x['time'])
            self.timeline_events = [event for event in self.timeline_events if self.start_time <= event['time'] <= self.end_time]


    def _get_current_state(self, frame_data):
        start_event, end_event = frame_data['start_event'], frame_data['end_event']
        segment_progress, sim_time = frame_data['segment_progress'], frame_data['sim_time']
        event_type = start_event['event_type']

        # FIX: Robustly determine the starting position for the frame
        cart_current_pos = start_event.get('position')
        if cart_current_pos is None:
            # Fallback for events that might not have a position (should not happen with the fix above, but safe to have)
            cart_current_pos = end_event.get('position', self.pool_positions['home'])
            
        # --- Default state for the frame ---
        state = {'cart_pos': cart_current_pos, 'status': 'Ожидание', 'task_info': 'Нет текущих задач',
                 'cart_feed': None, 'moving_right': True,
                 'feeding_animation': False, 'loading_animation': False}
        
        # Safely get the task if it exists for the current event
        task = start_event.get('task')
        
        # Определим последнюю операцию с кормом для правильного отслеживания
        # Для этого просмотрим события до текущего момента и найдем последнюю операцию загрузки/выгрузки
        current_feed = None
        
        # Найдем индекс текущего события в timeline_events
        current_time = start_event['time']
        
        # Ищем последнюю операцию с кормом до текущего момента
        for event in reversed(self.timeline_events):
            if event['time'] > current_time:
                continue
                
            if event.get('task'):
                event_task = event.get('task')
                event_type_str = event.get('event_type', '')
                
                # Если это загрузка корма, запоминаем тип корма
                if 'loading_start' in event_type_str:
                    current_feed = event_task.get('feed')
                    break
                    
                # Если это кормление и оно завершено, тележка пуста
                elif 'feeding_end' in event_type_str:
                    current_feed = None
                    break

        # --- Update state based on event type ---
        if event_type == 'idle_start':
            state['status'] = f"Ожидание ({start_event.get('location_name', 'Дом')})"
            # Используем определенный ранее корм
            state['cart_feed'] = current_feed

        elif 'travel' in event_type or 'return' in event_type or 'arrival' in event_type or 'interpolated' in event_type:
            from_pos = start_event.get('from_position', state['cart_pos'])
            to_pos = end_event.get('position', from_pos)
            progress = segment_progress
            if event_type == 'interpolated' and 'progress' in start_event:
                progress = start_event['progress'] + segment_progress * (1.0 - start_event['progress'])

            task_pool_name = task.get('pool', '') if task else ''
            task_type = task.get('task_type', '') if task else ''
            
            if task_type == 'return_to_feeder':
                status_text = "Возвращение к кормушке"
            elif 'return' in event_type or task_pool_name == 'home':
                status_text = "Возвращение домой"
            elif task_pool_name == 'feeder':
                status_text = "В пути к Кормушке"
            else:
                status_text = f"В пути к Бассейну {task_pool_name.split(' ')[-1]}"

            state.update({
                'cart_pos': from_pos + (to_pos - from_pos) * progress,
                'moving_right': to_pos > from_pos,
                'status': status_text,
                'cart_feed': current_feed
            })
        elif 'waiting' in event_type:
            if task: # CRITICAL FIX: Only process if a task is associated with the event
                task_pool_name = task.get('pool', 'неизвестно')
                if task_pool_name == 'feeder':
                    location_text = "в Кормушке"
                else:
                    location_text = f"в Бассейне {task_pool_name.split(' ')[-1]}"

                wait_end_time = datetime.strptime(task['actual_start_time'], '%Y-%m-%d %H:%M:%S')
                time_to_wait = (wait_end_time - sim_time).total_seconds()
                wait_status = f"еще {int(time_to_wait // 60)} мин." if time_to_wait > 60 else "начало скоро"
                state.update({
                    'status': f"Ожидание {location_text} ({wait_status})",
                    'task_info': f"Пункт: {task.get('pool')}, Запланировано: {task.get('actual_start_time', '').split(' ')[1]}, Корм: {task.get('feed')}, Масса: {task.get('weight')}г",
                    'cart_feed': current_feed
                })
        elif '_start' in event_type:
            if task: # CRITICAL FIX: Only process if a task is associated with the event
                state['feeding_animation'] = 'feeding' in event_type
                state['loading_animation'] = 'loading' in event_type
                
                action_text = 'Кормление' if state['feeding_animation'] else 'Загрузка'
                if task.get('pool') == 'feeder':
                    location_text = "в Кормушке"
                else:
                    location_text = f"в {task.get('pool')}"
                
                # Обновляем информацию о корме в тележке в зависимости от типа операции
                if state['loading_animation']:
                    current_feed = task.get('feed')
                elif state['feeding_animation']:
                    # Корм остается в тележке до окончания кормления
                    pass

                state.update({
                    'status': f"{action_text} {location_text}",
                    'task_info': f"Пункт: {task.get('pool')}, Корм: {task.get('feed')}, Масса: {task.get('weight')}г",
                    'cart_feed': current_feed
                })
        elif '_end' in event_type:
            # После окончания кормления корм в тележке исчезает
            if 'feeding_end' in event_type and task:
                current_feed = None
                state['cart_feed'] = None
        elif event_type in ('initial', 'return_end', 'idle_end'): 
             state['status'] = "Ожидание (Дом)"
             state['cart_feed'] = current_feed
        elif event_type == 'end': 
             state['status'] = "Конец симуляции"
             state['cart_feed'] = current_feed
        
        return state
    
    def _interpolate_initial_state(self):
        """
        Interpolates the initial state if the animation starts mid-event.
        """
        if not self.timeline_events or self.timeline_events[0]['time'] > self.start_time:
            cart_initial_pos = self.pool_positions['home']
            sorted_by_finish = sorted(self.route, key=lambda x: datetime.strptime(x['finish_time'], '%Y-%m-%d %H:%M:%S'))
            prev_events = [e for e in sorted_by_finish if datetime.strptime(e['finish_time'], '%Y-%m-%d %H:%M:%S') < self.start_time]
            
            initial_event = {'time': self.start_time, 'event_type': 'initial', 'position': cart_initial_pos}

            if prev_events:
                prev_event_task = prev_events[-1]
                prev_pos = self.pool_positions[prev_event_task['pool']]
                
                if self.timeline_events:
                    next_event = self.timeline_events[0]
                    next_pos = next_event['position']
                    
                    if prev_pos != next_pos:
                        prev_finish_time = datetime.strptime(prev_event_task['finish_time'], '%Y-%m-%d %H:%M:%S')
                        total_travel_time = (next_event['time'] - prev_finish_time).total_seconds()
                        elapsed_time = (self.start_time - prev_finish_time).total_seconds()
                        
                        if total_travel_time > 0:
                            progress = elapsed_time / total_travel_time
                            interpolated_pos = prev_pos + (next_pos - prev_pos) * progress
                            initial_event = {
                                'time': self.start_time, 'event_type': 'interpolated', 'position': interpolated_pos,
                                'from_position': prev_pos, 'to_position': next_pos, 'progress': progress
                            }
            
            self.timeline_events.insert(0, initial_event)

    def _generate_frames(self):
        """
        Generates time points for each animation frame.
        """
        target_frames = self.fps * 30

        for i in range(len(self.timeline_events) - 1):
            start_event, end_event = self.timeline_events[i], self.timeline_events[i+1]
            segment_duration = (end_event['time'] - start_event['time']).total_seconds()

            if segment_duration <= 0: continue

            speed_factor = 1.0
            segment_frame_count = max(5, int(target_frames * segment_duration / self.total_duration / speed_factor))
            
            for j in range(segment_frame_count):
                progress = j / segment_frame_count
                sim_time = start_event['time'] + timedelta(seconds=progress * segment_duration)
                self.frame_times.append({
                    'sim_seconds': (sim_time - self.start_time).total_seconds(), 'sim_time': sim_time,
                    'speed_factor': speed_factor, 'start_event': start_event, 'end_event': end_event,
                    'segment_progress': progress
                })

    def _update_frame(self, frame_idx):
        frame_data = self.frame_times[frame_idx]
        state = self._get_current_state(frame_data)
        self._update_artists_from_state(frame_data, state)
        
        # The list of artists must be flattened for blitting.
        artists_list = []
        for artist in self.artists.values():
            if isinstance(artist, list):
                artists_list.extend(artist)
            else:
                artists_list.append(artist)
        return artists_list

    def _update_artists_from_state(self, frame_data, state):
        cart = self.artists['cart']
        cart_width, cart_height = cart.get_width(), cart.get_height()
        cart.set_xy((state['cart_pos'] - cart_width / 2, -cart_height / 2))

        if not hasattr(self, 'previous_positions'): self.previous_positions = [state['cart_pos']] * self.trail_length
        self.previous_positions.append(state['cart_pos'])
        if len(self.previous_positions) > self.trail_length: self.previous_positions.pop(0)
        
        for i, dot in enumerate(self.artists['trail_dots']):
            if i < len(self.previous_positions) -1:
                trail_pos = self.previous_positions[i]
                dot.set_center((trail_pos, 0))
                dot.set_alpha((self.trail_length - i) / self.trail_length * 0.5 if abs(state['cart_pos'] - trail_pos) > 0.1 else 0)

        cart_direction = self.artists['cart_direction']
        direction_offset = 0.4
        cart_direction.set_positions(
            (state['cart_pos'] - direction_offset, 0), (state['cart_pos'] + direction_offset, 0)
        ) if state['moving_right'] else cart_direction.set_positions(
            (state['cart_pos'] + direction_offset, 0), (state['cart_pos'] - direction_offset, 0)
        )
        
        scale = 1.0 + (0.2 * np.sin(frame_data['sim_seconds'] * self.fps * 0.1)) if state['feeding_animation'] else \
                1.0 + (0.3 * np.sin(frame_data['sim_seconds'] * self.fps * 0.15)) if state['loading_animation'] else 1.0
        
        cart.set_height(getattr(self, 'base_cart_height', cart_height) * scale)
        cart.set_width(getattr(self, 'base_cart_width', cart_width) * scale)
        if not hasattr(self, 'base_cart_height'): self.base_cart_height = cart_height
        if not hasattr(self, 'base_cart_width'): self.base_cart_width = cart_width

        cart.set_color('orange' if state['feeding_animation'] else 'yellow' if state['loading_animation'] else 'red')
        cart_direction.set_visible(not (state['feeding_animation'] or state['loading_animation']))
        
        self.artists['time_marker'].set_xdata([frame_data['sim_seconds'], frame_data['sim_seconds']])
        self.artists['time_text'].set_text(f'Время: {frame_data["sim_time"].strftime("%H:%M:%S")}')
        self.artists['status_text'].set_text(f"Статус: {state['status']}")
        self.artists['task_text'].set_text(f"Задача: {state['task_info']}")
        self.artists['feed_text'].set_text(f"Корм в тележке: {state['cart_feed']}" if state['cart_feed'] else "Тележка пуста")
        
        speed_factor = frame_data['speed_factor']
        speed_color = 'black'
        speed_desc = 'нормально'
        if speed_factor > 1.0: speed_color, speed_desc = 'red', 'ускорение'
        elif speed_factor < 1.0: speed_color, speed_desc = 'blue', 'замедление'
        self.artists['speed_text'].set_text(f'Скорость: x{speed_factor:.1f} ({speed_desc})')
        self.artists['speed_text'].set_color(speed_color)


def create_route_animation(route, pool_positions, cart_speed,
                      output_file='feeding_route_animation.mp4', 
                      fps=15, dpi=100,
                      start_hour=8, start_minute=0,
                      end_hour=10, end_minute=0):
    """
    Creates an animation of the cart's movement along the rail and saves it as a video file.
    """
    animator = RouteAnimator(
        route=route,
        pool_positions=pool_positions,
        cart_speed=cart_speed,
        fps=fps,
        dpi=dpi,
        start_hour=start_hour,
        start_minute=start_minute,
        end_hour=end_hour,
        end_minute=end_minute
    )
    animator.create_animation(output_file)


def main():
    """
    Test the route generator functionality with example data.
    """
    print("Testing Fish Feeding Route Generator (Linear Track)")
    print("================================================\n")

    # Example feeding schedule
    feeding_schedule = [
        {'pool': 'Бассейн 1', 'feed': 'Корм №1', 'weight': 500, 'period': '2 раза в день'},
        {'pool': 'Бассейн 2', 'feed': 'Корм №2', 'weight': 300, 'period': '3 раза в день'},
        {'pool': 'Бассейн 3', 'feed': 'Корм №1', 'weight': 400, 'period': '1 раз в день'},
        {'pool': 'Бассейн 4', 'feed': 'Корм №3', 'weight': 200, 'period': '12:00'},
        {'pool': 'Бассейн 4', 'feed': 'Корм №1', 'weight': 400, 'period': '2 раза в день'},
    ]

    # Example pool positions (distance in meters from 'home')
    pool_positions = {
        'home': 0,
        'feeder': 10,  # Feeding station located between home and the first pool
        'Бассейн 1': 20,
        'Бассейн 2': 45,
        'Бассейн 3': 70,
        'Бассейн 4': 110,
    }

    print(f"Generating feeding route with cart speed: {CART_SPEED_MPS} m/s\n")
    start_time = datetime.now().replace(hour=7, minute=0, second=0, microsecond=0)
    
    # Use the new route generator that includes feeder visits and just-in-time logic
    route = generate_feeding_route(
        feeding_schedule, 
        pool_positions, 
        CART_SPEED_MPS,
        start_time=start_time,
        feed_loading_time_seconds=FEED_LOADING_TIME
    )

    # --- Print static route details ---
    print("Optimized Feeding Route:")
    print("----------------------")
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
        else:
            # Fallback for tasks without type
            ideal_time = task['ideal_scheduled_time'].strftime('%H:%M:%S')
            start_time_str = task['actual_start_time'].strftime('%H:%M:%S')
            finish_time_str = task['finish_time'].strftime('%H:%M:%S')
            print(f"{i+1}. Пул: {task['pool']} (Идеальное: {ideal_time}) -> Начало: {start_time_str}, Конец: {finish_time_str}")

    # --- Serialize and save route ---
    route_for_json = []
    for task in route:
        task_copy = task.copy()
        for key, value in task_copy.items():
            if isinstance(value, datetime):
                task_copy[key] = value.strftime('%Y-%m-%d %H:%M:%S')
        route_for_json.append(task_copy)

    # Save route data for inspection
    with open('feeding_route_linear_for_inspection.json', 'w', encoding='utf-8') as f:
        json.dump(route_for_json, f, ensure_ascii=False, indent=2)
    print("\nRoute saved to feeding_route_linear_for_inspection.json")

    # Ask user for time range
    print("\nУкажите временной интервал для анимации")
    try:
        start_hour = int(input(f"Начальный час (0-23) [default: {DEFAULT_ANIMATION_START_HOUR}]: ") or str(DEFAULT_ANIMATION_START_HOUR))
        start_minute = int(input("Начальная минута (0-59) [default: 0]: ") or "0")
        end_hour = int(input(f"Конечный час (0-23) [default: {DEFAULT_ANIMATION_END_HOUR}]: ") or str(DEFAULT_ANIMATION_END_HOUR))
        end_minute = int(input("Конечная минута (0-59) [default: 0]: ") or "0")
    except ValueError:
        print(f"Введены некорректные значения, используются значения по умолчанию ({DEFAULT_ANIMATION_START_HOUR}:00-{DEFAULT_ANIMATION_END_HOUR}:00)")
        start_hour, start_minute = DEFAULT_ANIMATION_START_HOUR, 0
        end_hour, end_minute = DEFAULT_ANIMATION_END_HOUR, 0

    # --- Create animation video ---
    print("\nСоздание видео-анимации маршрута...")
    if not route_for_json:
        print("Маршрут пуст, анимация не будет создана.")
    else:
        create_route_animation(
            route_for_json, 
            pool_positions,
            CART_SPEED_MPS,
            output_file=OUTPUT_ANIMATION_FILE,
            start_hour=start_hour,
            start_minute=start_minute,
            end_hour=end_hour,
            end_minute=end_minute
        )
    print(f"\nАнимация создана. Проверьте файл {OUTPUT_ANIMATION_FILE}")


if __name__ == "__main__":
    main()