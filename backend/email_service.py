import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body: str):
    """Test email service - logs to console"""
    logger.info(f"""
    ==================== EMAIL ====================
    To: {to_email}
    Subject: {subject}
    Time: {datetime.utcnow().isoformat()}
    
    {body}
    ===============================================
    """)
    return True

def send_accreditation_approved_email(user_email: str, user_name: str):
    subject = "Акредитація схвалена - GrainCompany"
    body = f"""
    Вітаємо, {user_name}!
    
    Ваша заявка на акредитацію була схвалена.
    Тепер ви можете брати участь у торгах зерном.
    
    З повагою,
    Команда GrainCompany
    """
    send_email(user_email, subject, body)

def send_accreditation_rejected_email(user_email: str, user_name: str):
    subject = "Акредитація відхилена - GrainCompany"
    body = f"""
    Шановний {user_name},
    
    На жаль, ваша заявка на акредитацію була відхилена.
    Для отримання додаткової інформації зв'яжіться з нами.
    
    З повагою,
    Команда GrainCompany
    """
    send_email(user_email, subject, body)

def send_auction_winner_email(user_email: str, user_name: str, auction_details: dict):
    subject = "Ви перемогли в аукціоні! - GrainCompany"
    body = f"""
    Вітаємо, {user_name}!
    
    Ви перемогли в аукціоні!
    
    Деталі:
    - Зерно: {auction_details.get('grain_type')} ({auction_details.get('quality')})
    - Кількість: {auction_details.get('quantity')} тонн
    - Ваша ставка: {auction_details.get('winning_bid')} грн
    
    Ми зв'яжемося з вами найближчим часом для узгодження деталей.
    
    З повагою,
    Команда GrainCompany
    """
    send_email(user_email, subject, body)
