from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit
from weather import fetch_all_airport_data
from datetime import datetime

def start_scheduler():
    """Start the background scheduler for automated data fetching."""
    scheduler = BackgroundScheduler()
    
    # Schedule data fetching every 30 minutes
    scheduler.add_job(
        func=fetch_all_airport_data,
        trigger=IntervalTrigger(minutes=30),
        id='fetch_weather_data',
        name='Fetch airport weather data',
        replace_existing=True
    )
    
    # Also run immediately on startup
    scheduler.add_job(
        func=fetch_all_airport_data,
        trigger='date',
        run_date=datetime.now(),
        id='initial_fetch',
        name='Initial data fetch'
    )
    
    scheduler.start()
    
    # Shut down the scheduler when exiting the app
    atexit.register(lambda: scheduler.shutdown())
    
    print("🕒 Background scheduler started - fetching data every 30 minutes")
    return scheduler

if __name__ == '__main__':
    # Test the scheduler
    scheduler = start_scheduler()
    
    try:
        # Keep the script running
        import time
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Scheduler stopped.")
        scheduler.shutdown()
