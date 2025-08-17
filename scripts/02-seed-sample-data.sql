-- Seed sample data for GenPharamos VectorNet

-- Insert sample diseases
INSERT INTO diseases (id, name, category, description, symptoms, transmission_mode, climate_factors) VALUES
(uuid_generate_v4(), 'Malaria', 'Vector-borne', 'Mosquito-borne infectious disease caused by Plasmodium parasites', ARRAY['fever', 'chills', 'headache', 'nausea'], 'mosquito_vector', ARRAY['temperature', 'humidity', 'precipitation']),
(uuid_generate_v4(), 'Dengue Fever', 'Vector-borne', 'Viral infection transmitted by Aedes mosquitoes', ARRAY['high_fever', 'severe_headache', 'muscle_pain', 'rash'], 'mosquito_vector', ARRAY['temperature', 'humidity', 'standing_water']),
(uuid_generate_v4(), 'Zika Virus', 'Vector-borne', 'Viral disease primarily transmitted by Aedes aegypti mosquitoes', ARRAY['fever', 'rash', 'joint_pain', 'red_eyes'], 'mosquito_vector', ARRAY['temperature', 'humidity', 'urbanization']),
(uuid_generate_v4(), 'Cholera', 'Water-borne', 'Bacterial infection causing severe diarrheal disease', ARRAY['severe_diarrhea', 'vomiting', 'dehydration'], 'contaminated_water', ARRAY['temperature', 'precipitation', 'flooding']),
(uuid_generate_v4(), 'Lyme Disease', 'Vector-borne', 'Bacterial infection transmitted by infected ticks', ARRAY['fever', 'headache', 'fatigue', 'skin_rash'], 'tick_vector', ARRAY['temperature', 'humidity', 'vegetation']);

-- Insert sample climate data
INSERT INTO climate_data (location, latitude, longitude, temperature, humidity, precipitation, wind_speed, recorded_at, data_source) VALUES
('Mumbai, India', 19.0760, 72.8777, 32.5, 78.2, 15.3, 12.4, '2024-01-15 12:00:00+00', 'weather_api'),
('Lagos, Nigeria', 6.5244, 3.3792, 29.8, 82.1, 8.7, 9.2, '2024-01-15 12:00:00+00', 'weather_api'),
('Bangkok, Thailand', 13.7563, 100.5018, 34.2, 75.6, 22.1, 8.7, '2024-01-15 12:00:00+00', 'weather_api'),
('São Paulo, Brazil', -23.5505, -46.6333, 26.3, 68.4, 5.2, 11.8, '2024-01-15 12:00:00+00', 'weather_api'),
('Nairobi, Kenya', -1.2921, 36.8219, 22.1, 65.3, 12.8, 14.2, '2024-01-15 12:00:00+00', 'weather_api');

-- Insert sample disease forecasts
INSERT INTO disease_forecasts (disease_id, location, latitude, longitude, risk_level, confidence_score, predicted_cases, forecast_date, climate_factors, model_version) 
SELECT 
    d.id,
    'Mumbai, India',
    19.0760,
    72.8777,
    'high',
    0.87,
    1250,
    '2024-02-01',
    '{"temperature": 32.5, "humidity": 78.2, "precipitation": 15.3}',
    'v2.1.0'
FROM diseases d WHERE d.name = 'Malaria';

INSERT INTO disease_forecasts (disease_id, location, latitude, longitude, risk_level, confidence_score, predicted_cases, forecast_date, climate_factors, model_version) 
SELECT 
    d.id,
    'Bangkok, Thailand',
    13.7563,
    100.5018,
    'critical',
    0.92,
    2100,
    '2024-02-01',
    '{"temperature": 34.2, "humidity": 75.6, "precipitation": 22.1}',
    'v2.1.0'
FROM diseases d WHERE d.name = 'Dengue Fever';

-- Insert sample molecules
INSERT INTO molecules (name, smiles, molecular_formula, molecular_weight, target_disease_id, discovery_method, source, properties)
SELECT 
    'Artemisinin',
    'C[C@H]1CC[C@H]2[C@@H](C)C(=O)O[C@H]3O[C@]4(C)CC[C@@H]1[C@]23OO4',
    'C15H22O5',
    282.33,
    d.id,
    'natural_product',
    'Artemisia annua',
    '{"solubility": "low", "bioavailability": "moderate", "toxicity": "low"}'
FROM diseases d WHERE d.name = 'Malaria';

INSERT INTO molecules (name, smiles, molecular_formula, molecular_weight, target_disease_id, discovery_method, source, properties)
SELECT 
    'Chloroquine',
    'CCN(CC)CCCC(C)Nc1ccnc2cc(Cl)ccc12',
    'C18H26ClN3',
    319.87,
    d.id,
    'synthetic',
    'pharmaceutical_synthesis',
    '{"solubility": "high", "bioavailability": "high", "toxicity": "moderate"}'
FROM diseases d WHERE d.name = 'Malaria';
