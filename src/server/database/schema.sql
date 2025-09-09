-- 🏄‍♂️ Kitebuddy Database Schema
-- Gebruikersprofielen en SMS notificaties

-- Gebruikers tabel
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gebruikersvoorkeuren voor wind windows
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    min_wind_speed DECIMAL(4,1) DEFAULT 12.0, -- Minimum wind snelheid in kn
    max_wind_speed DECIMAL(4,1) DEFAULT 35.0, -- Maximum wind snelheid in kn
    preferred_directions INTEGER[], -- Array van voorkeur richtingen (0-360)
    min_wave_height DECIMAL(3,1) DEFAULT 0.0, -- Minimum golf hoogte
    max_wave_height DECIMAL(3,1) DEFAULT 5.0, -- Maximum golf hoogte
    preferred_hours INTEGER[] DEFAULT '{6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22}', -- Voorkeur uren
    notification_48h BOOLEAN DEFAULT true, -- 48 uur notificatie
    notification_24h BOOLEAN DEFAULT true, -- 24 uur notificatie
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favoriete spots per gebruiker
CREATE TABLE user_favorite_spots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    spot_id VARCHAR(100) NOT NULL, -- Bijv. 'wijk_aan_zee'
    spot_name VARCHAR(100) NOT NULL, -- Bijv. 'Wijk aan Zee'
    latitude DECIMAL(8,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    priority INTEGER DEFAULT 1, -- Prioriteit (1=hoogste)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, spot_id)
);

-- SMS notificatie geschiedenis
CREATE TABLE sms_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    spot_id VARCHAR(100) NOT NULL,
    forecast_date DATE NOT NULL,
    wind_speed DECIMAL(4,1) NOT NULL,
    wind_direction INTEGER NOT NULL,
    window_start TIME NOT NULL,
    window_end TIME NOT NULL,
    notification_type VARCHAR(10) NOT NULL, -- '48h' of '24h'
    sms_sent BOOLEAN DEFAULT false,
    sms_sent_at TIMESTAMP,
    sms_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wind window voorspellingen (voor notificaties)
CREATE TABLE wind_window_forecasts (
    id SERIAL PRIMARY KEY,
    spot_id VARCHAR(100) NOT NULL,
    forecast_date DATE NOT NULL,
    window_start TIME NOT NULL,
    window_end TIME NOT NULL,
    avg_wind_speed DECIMAL(4,1) NOT NULL,
    wind_direction INTEGER NOT NULL,
    wave_height DECIMAL(3,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(spot_id, forecast_date, window_start)
);

-- Indexen voor performance
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_favorite_spots_user_id ON user_favorite_spots(user_id);
CREATE INDEX idx_sms_notifications_user_id ON sms_notifications(user_id);
CREATE INDEX idx_sms_notifications_date ON sms_notifications(forecast_date);
CREATE INDEX idx_wind_window_forecasts_spot_date ON wind_window_forecasts(spot_id, forecast_date);

-- Triggers voor updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
