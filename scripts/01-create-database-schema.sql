-- GenPharamos VectorNet Database Schema
-- Create tables for the climate-driven AI drug discovery platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with role-based access
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'researcher' CHECK (role IN ('researcher', 'public_health', 'pharma', 'admin')),
    organization VARCHAR(255),
    specialization VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diseases table for tracking various diseases
CREATE TABLE diseases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    symptoms TEXT[],
    transmission_mode VARCHAR(100),
    climate_factors TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Climate data table
CREATE TABLE climate_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    temperature DECIMAL(5, 2),
    humidity DECIMAL(5, 2),
    precipitation DECIMAL(8, 2),
    wind_speed DECIMAL(5, 2),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    data_source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disease forecasts table
CREATE TABLE disease_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disease_id UUID REFERENCES diseases(id) ON DELETE CASCADE,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    predicted_cases INTEGER,
    forecast_date DATE NOT NULL,
    climate_factors JSONB,
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug molecules table
CREATE TABLE molecules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    smiles VARCHAR(1000),
    molecular_formula VARCHAR(255),
    molecular_weight DECIMAL(10, 4),
    target_disease_id UUID REFERENCES diseases(id),
    discovery_method VARCHAR(100),
    source VARCHAR(255),
    properties JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug evaluations table
CREATE TABLE drug_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    molecule_id UUID REFERENCES molecules(id) ON DELETE CASCADE,
    evaluation_type VARCHAR(100) NOT NULL,
    score DECIMAL(5, 4),
    confidence DECIMAL(3, 2),
    methodology VARCHAR(255),
    results JSONB,
    evaluated_by UUID REFERENCES users(id),
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Research projects table
CREATE TABLE research_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    lead_researcher_id UUID REFERENCES users(id),
    target_disease_id UUID REFERENCES diseases(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12, 2),
    funding_source VARCHAR(255),
    collaborators UUID[],
    milestones JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table for real-time notifications
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(100),
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_disease_forecasts_location ON disease_forecasts(location);
CREATE INDEX idx_disease_forecasts_date ON disease_forecasts(forecast_date);
CREATE INDEX idx_disease_forecasts_risk ON disease_forecasts(risk_level);
CREATE INDEX idx_climate_data_location ON climate_data(location);
CREATE INDEX idx_climate_data_recorded_at ON climate_data(recorded_at);
CREATE INDEX idx_molecules_target_disease ON molecules(target_disease_id);
CREATE INDEX idx_drug_evaluations_molecule ON drug_evaluations(molecule_id);
CREATE INDEX idx_alerts_user_unread ON alerts(user_id, is_read);
CREATE INDEX idx_research_projects_status ON research_projects(status);
CREATE INDEX idx_users_role ON users(role);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diseases_updated_at BEFORE UPDATE ON diseases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disease_forecasts_updated_at BEFORE UPDATE ON disease_forecasts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_molecules_updated_at BEFORE UPDATE ON molecules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_research_projects_updated_at BEFORE UPDATE ON research_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
