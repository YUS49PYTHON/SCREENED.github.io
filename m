import datetime
import requests
import pygame
import arabic_reshaper
from bidi.algorithm import get_display
import time
#ONLY CHANGE JAMAAT TIMES BY EDITING THE TIMES IN SPEECH MARKS
##########################
Fajr_Jamaah = "05:00"
Shurooq_Jamaah = " - -"
Dhuhr_Jamaah = "13:30"
Asr_Jamaah = "16:50"
Maghrib_Jamaah = "18:19"
Isha_Jamaah = "20:15"
##########################

#DO NOT CHANGE ANYTHING BELOW THIS LINE

# Initialize all imported pygame modules
pygame.init()

# Set the dimensions of the screen
screen_width = 1525
screen_height = 800
screen = pygame.display.set_mode((screen_width, screen_height))

# Set the title of the window
pygame.display.set_caption("My Pygame Screen")

# Define colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
ORANGE = (255, 165, 0)
GREYWHITE = (240, 240, 240)
TURQUOISE = (0,153,255)  # Changed to #0099ff

# Define font using Good Water Sans 1 (make sure the TTF file is in your folder)
font_path = "Quicksand-VariableFont_wght.ttf"  # Update with the correct filename if needed
font = pygame.font.Font(font_path, 60)
small_font = pygame.font.Font(font_path, 36)
font_path2 = "BOVEN 1.ttf"  # Update with the correct filename if needed
font2 = pygame.font.Font(font_path, 60)
small_font2 = pygame.font.Font(font_path, 36)

# Game loop variable
running = True

# Function to get salah times from Aladhan API
def get_salah_times():
    url = "http://api.aladhan.com/v1/timingsByCity"
    params = {
        "city": "Leicester",
        "country": "UK",
        "method": 2
    }
    try:
        response = requests.get(url, params=params)
        data = response.json()
        timings = data["data"]["timings"]
        return {
            "Fajr": timings["Fajr"][:5],
            "Shurooq": timings["Sunrise"][:5],  # <-- Correct key for Shurooq
            "Dhuhr": timings["Dhuhr"][:5],
            "Asr": timings["Asr"][:5],
            "Maghrib": timings["Maghrib"][:5],
            "Isha": timings["Isha"][:5]
        }
    except Exception as e:
        return {
            "Fajr": "N/A",
            "Shurooq": "N/A",
            "Dhuhr": "N/A",
            "Asr": "N/A",
            "Maghrib": "N/A",
            "Isha": "N/A"
        }

# Get salah times once at start
salah_times = get_salah_times()
last_salah_update_date = datetime.date.today()

# Add this before the main loop to track salah in progress
salah_in_progress_until = None
current_salah_idx = None

# Main game loop
while running:
    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    now = datetime.datetime.now()

    # --- Update salah times if the day has changed ---
    if now.date() != last_salah_update_date:
        salah_times = get_salah_times()
        last_salah_update_date = now.date()


    # --- Salah in progress logic ---
    if salah_in_progress_until and now < salah_in_progress_until:
        screen.fill(TURQUOISE)  # Blue color
        arabic_font_path = "Amiri-Regular.ttf"
        progress_font = pygame.font.Font(arabic_font_path, 60)
        # Arabic and translation text
        progress_text = "إِنَّ الصَّلاَةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَاباً مَّوْقُوتاً"
        trans_text = "Indeed, prayer has been decreed upon the believers a decree of specified times"
        # Alternate every 15 seconds
        if (int(time.time()) // 15) % 2 == 0:
            # Show Arabic
            reshaped_text = arabic_reshaper.reshape(progress_text)
            bidi_text = get_display(reshaped_text)
            display_text = bidi_text
            display_font = progress_font
        else:
            # Show translation (use a Latin font)
            display_text = trans_text
            display_font = pygame.font.Font(font_path, 40)
        progress_surface = display_font.render(display_text, True, WHITE)
        progress_rect = progress_surface.get_rect(center=(screen_width // 2, screen_height // 2))
        screen.blit(progress_surface, progress_rect)
        pygame.display.flip()
        continue  # Skip rest of drawing until salah is done

    # --- Game logic should go here ---

    screen.fill(WHITE)

    # Calculate rectangle heights and widths
    rect2_width = screen_width * 1 // 3.5
    rect2_height = screen_height // 6
    rect3_width = rect2_width
    rect3_height = screen_height - rect2_height
    rect1_width = screen_width - rect2_width
    rect1_height = screen_height

    # Draw the rectangles
    # Rectangle 2 (1/16 of the screen width, top left)
    pygame.draw.rect(screen, GREYWHITE, (0, 0, rect2_width, rect2_height))
    # Rectangle 3 (same width, under rectangle 2)
    pygame.draw.rect(screen, WHITE, (0, rect2_height, rect3_width, rect3_height))
    # Rectangle 1 (rest of the screen, right side)
    pygame.draw.rect(screen, TURQUOISE, (rect2_width, 0, rect1_width, rect1_height))

    now = datetime.datetime.now()
    time_str = now.strftime("%H:%M:%S")
    time_surface = font.render(time_str, True, TURQUOISE)
    # Center the time in rectangle 2
    time_rect = time_surface.get_rect(center=(rect2_width // 2, rect2_height // 3))
    screen.blit(time_surface, time_rect)

    # --- Display salah times in rectangle 2 ---
    # Add heading above salah times
    heading_font = pygame.font.Font(font_path, 42)
    heading_text = "Begin"
    heading_text2 = "Jamat"
    heading_surface = heading_font.render(heading_text, True, TURQUOISE)
    heading_surface2 = heading_font.render(heading_text2, True, TURQUOISE)
    heading_rect = heading_surface.get_rect(left=20, top=int(rect2_height // 0.70) - 50)
    heading_rect2 = heading_surface2.get_rect(left=270, top=int(rect2_height // 0.70) - 50)
    screen.blit(heading_surface, heading_rect)
    screen.blit(heading_surface2, heading_rect2)

    small_font = pygame.font.Font(font_path2, 30) 
    salah_names = ["Fajr", "Shurooq", "Dhuhr", "Asr", "Maghrib", "Isha"]
    for idx, name in enumerate(salah_names):
        salah_time = salah_times.get(name, "- -")
        text = f"{name} {salah_time}"
        text_surface = small_font.render(text, True, TURQUOISE)
        # Position salah times below the clock
        text_rect = text_surface.get_rect(left=20, top=int(rect2_height // 0.62 + idx * 90))
        screen.blit(text_surface, text_rect)

    # --- Display Jamaah times in rectangle 2 ---
    jamaah_times = [Fajr_Jamaah, Shurooq_Jamaah, Dhuhr_Jamaah, Asr_Jamaah, Maghrib_Jamaah, Isha_Jamaah]
    for idx, (name, jamaah_time) in enumerate(zip(salah_names, jamaah_times)):
        text = f" {jamaah_time}"
        text_surface = small_font.render(text, True, TURQUOISE)
        # Position jamaah times to the right of salah times
        text_rect = text_surface.get_rect(left=rect2_width // 2 + 80, top=int(rect2_height // 0.62 + idx * 90))
        screen.blit(text_surface, text_rect)

    # --- Red rectangle warning for <10 min to Jamaat ---
    salah_started = False
    for idx, jamaah_time in enumerate(jamaah_times):
        try:
            # Skip if jamaah_time is not a valid time
            if jamaah_time.strip() in ["- -", "--", "", None]:
                continue
            jamaah_dt = datetime.datetime.combine(now.date(), datetime.datetime.strptime(jamaah_time, "%H:%M").time())
            if jamaah_dt < now:
                jamaah_dt += datetime.timedelta(days=1)
            time_diff = (jamaah_dt - now).total_seconds()
            # Salah in progress logic: check if just after Jamaat
            salah_start_dt = jamaah_dt - datetime.timedelta(days=1) if jamaah_dt.date() > now.date() else jamaah_dt
            if 0 <= (now - salah_start_dt).total_seconds() < 480:  # 8 minutes = 480 seconds
                salah_in_progress_until = salah_start_dt + datetime.timedelta(minutes=8)
                current_salah_idx = idx
                salah_started = True
                break  # Start salah in progress screen
            if 0 < time_diff <= 600:  # less than 10 minutes
                rect_height = 80
                pygame.draw.rect(screen, (255, 0, 0), (0, screen_height - rect_height, screen_width, rect_height))
                mins, secs = divmod(int(time_diff), 60)
                warning_text = f"{salah_names[idx]} Jamaat in {mins:02d}:{secs:02d} minutes"
                warning_surface = font.render(warning_text, True, WHITE)
                warning_rect = warning_surface.get_rect(center=(screen_width // 2, screen_height - rect_height // 2.1))
                screen.blit(warning_surface, warning_rect)
                break
        except Exception:
            continue

    # --- Update the display ---
    pygame.display.flip()