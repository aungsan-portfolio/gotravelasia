-- =====================================================
-- Phase 3: Email Queue System
-- Run this to create the queue table for sending alerts
-- =====================================================

CREATE TABLE IF NOT EXISTS emailQueue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  toEmail VARCHAR(320) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  htmlContent TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  lastError TEXT NULL,
  scheduledAt TIMESTAMP NULL,
  sentAt TIMESTAMP NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index for picking up pending emails efficiently
CREATE INDEX idx_emailQueue_status_scheduled ON emailQueue (status, scheduledAt);
