import json
from .models import Log

def create_log_entry(log_type, action, data=None, before_data=None, after_data=None):
    """
    Utility function to create a log entry
    
    Parameters:
    - log_type: Type of log ('cart', 'bunker', 'system')
    - action: Action description
    - data: Data to log (for create/delete operations)
    - before_data: Data before change (for update operations)
    - after_data: Data after change (for update operations)
    
    Returns:
    - The created Log instance
    """
    description_data = {}
    
    if data is not None:
        if action == 'create':
            description_data['created'] = data
        elif action == 'delete':
            description_data['deleted'] = data
        else:
            description_data['data'] = data
    
    if before_data is not None:
        description_data['before'] = before_data
        
    if after_data is not None:
        description_data['after'] = after_data
    
    try:
        log = Log.objects.create(
            action=action,
            type=log_type,
            description=json.dumps(description_data, default=str)
        )
        return log
    except Exception as e:
        print(f"Error creating log: {e}")
        return None


def log_arduino_event(action, data):
    """
    Helper function specifically for Arduino events
    
    Parameters:
    - action: Action description
    - data: Data from Arduino
    
    Returns:
    - The created Log instance
    """
    return create_log_entry(log_type='system', action=action, data=data) 