from PIL import Image, ImageDraw, ImageFont
import smtplib
from email.message import EmailMessage
import os

# ---------- CONFIGURATION ----------
IMAGE_PATH = "./day1template.png"  # Path to the template image
FONT_PATH = "./font.ttf"  # Update if needed
FONT_COLOR = (194, 200, 210)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = "githubamityofficial@gmail.com"
EMAIL_PASSWORD = "zqzx hzcn nsbp kqry"  # Use App Password if using Gmail
SUBJECT = "Congratulations on successfully completing Day 1"
BODY = "Dear {},\n\nCongratulations on the successful completion of Day 1 of the AI Agents Workshop\n\nWe hope you had a great session with us and enjoyed the learning with live sessions and quiz.\n\nHere is your certificate for actively participating in Day 1. We hope you enjoy this learning throughout the workshop.\n\nPlease join the Discord server(https://discord.gg/Nphhqcbw) for updates, resources, doubts, discussions, bonus activities and many more perks. The inforation regarding the same will be provided on our WhatsApp channel as well: https://whatsapp.com/channel/0029Vb5sVd3GU3BQPqniXW1K \nWe truly appreciate your enthusiasm and dedication throughout the program.\n\nAs \n\nBest regards,\nMindCraft AI Team"
# ----------------------------------

from PIL import Image, ImageDraw, ImageFont

def draw_centered_text(image_path, text):
    image = Image.open(image_path)
    draw = ImageDraw.Draw(image)

    image_width, image_height = image.size
    font_size = 100
    font = ImageFont.truetype(FONT_PATH, font_size)

    # Adjust font size to fit text within image width
    while True:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        if text_width <= image_width * 0.8:
            break
        font_size -= 2
        font = ImageFont.truetype(FONT_PATH, font_size)

    # Center text
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (image_width - text_width) / 2
    y = (image_height - text_height) / 2

    draw.text((x,y), text.title(), font=font, fill=FONT_COLOR)
    return image


def send_email(recipient_email, recipient_name,):
    msg = EmailMessage()
    msg['Subject'] = SUBJECT
    msg['From'] = "Abhishek from MindCraft AI<{EMAIL_ADDRESS}>"
    msg['To'] = recipient_email
    msg.set_content(BODY.format(recipient_name))

    #with open(image_path, 'rb') as img:
    #    msg.add_attachment(img.read(), maintype='image', subtype='jpeg', filename=os.path.basename(image_path))

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)

def main():
    with open("emails.txt", "r") as ef, open("names.txt", "r") as nf:
        emails = [line.strip() for line in ef]
        names = [line.strip() for line in nf]

    for email, name in zip(emails, names):
       #output_image_path = f"./output/{name}.jpg"
       #image = draw_centered_text(IMAGE_PATH, name)
       #image.save(output_image_path)
       send_email(email, name, )
       print(f"Sent to {email}")

if __name__ == "__main__":
    main()
