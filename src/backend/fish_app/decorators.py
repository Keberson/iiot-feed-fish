import json
import functools
from .models import Log
from rest_framework.response import Response
from django.http import JsonResponse, HttpResponse
import copy

def log_event(log_type='system', action=None):
    """
    Decorator to log events in the system
    
    Parameters:
    - log_type: Type of log ('cart', 'bunker', 'system')
    - action: Action description (if None, will be determined from the request method)
    
    Usage:
    @log_event(log_type='system', action='custom_action')
    def my_view(request, ...):
        ...
    """
    def decorator(view_func):
        @functools.wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            # Determine the action if not provided
            event_action = action
            if event_action is None:
                if request.method == 'POST':
                    event_action = 'create'
                elif request.method == 'PUT' or request.method == 'PATCH':
                    event_action = 'update'
                elif request.method == 'DELETE':
                    event_action = 'delete'
                else:
                    event_action = request.method.lower()
            
            # For PUT/PATCH/DELETE, get the original object if possible
            original_obj = None
            if request.method in ['PUT', 'PATCH', 'DELETE'] and 'id' in kwargs:
                model = None
                if 'FeedingTask' in view_func.__name__:
                    from .models import FeedingTask
                    model = FeedingTask
                elif 'system_settings' in view_func.__name__:
                    from .models import System
                    model = System
                
                if model:
                    try:
                        original_obj = model.objects.get(pk=kwargs['id'])
                        # Convert model instance to dict for JSON serialization
                        if hasattr(original_obj, '__dict__'):
                            original_obj = copy.deepcopy(original_obj.__dict__)
                            # Remove _state which is not JSON serializable
                            if '_state' in original_obj:
                                del original_obj['_state']
                    except Exception:
                        pass
            
            # Execute the view function
            response = view_func(request, *args, **kwargs)
            
            # Prepare log description
            description_data = {}
            
            # Handle different request methods
            if request.method == 'POST':
                # For creation, log the created object
                if hasattr(request, 'data'):
                    description_data['created'] = request.data
                
                # If the view returns a serialized object, include it
                if isinstance(response, Response) and hasattr(response, 'data'):
                    description_data['result'] = response.data
                
            elif request.method in ['PUT', 'PATCH']:
                # For updates, log before and after
                if original_obj:
                    description_data['before'] = original_obj
                
                if hasattr(request, 'data'):
                    description_data['changes'] = request.data
                
                # If the view returns a serialized object, include it
                if isinstance(response, Response) and hasattr(response, 'data'):
                    description_data['after'] = response.data
                
            elif request.method == 'DELETE':
                # For deletion, log the deleted object
                if original_obj:
                    description_data['deleted'] = original_obj
            
            # Create the log entry
            try:
                if description_data:
                    Log.objects.create(
                        action=event_action,
                        type=log_type,
                        description=json.dumps(description_data, default=str)
                    )
            except Exception as e:
                # Log the error but don't affect the response
                print(f"Error creating log: {e}")
            
            return response
        
        return wrapped_view
    
    return decorator 