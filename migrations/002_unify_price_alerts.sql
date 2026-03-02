-- =====================================================
-- Phase 2: Unify Price Alert System
-- Run this AFTER taking a database backup/snapshot
-- =====================================================

-- 1) Make departDate nullable + add new columns
ALTER TABLE flightPriceAlerts
  MODIFY COLUMN departDate varchar(10) NULL,
  ADD COLUMN source varchar(20) NOT NULL DEFAULT 'track_button',
  ADD COLUMN routeId varchar(20) NULL;

-- 2) Unique index for dated alerts (TrackPricesButton)
-- Prevents duplicate: same email + same route + same date + active
CREATE UNIQUE INDEX uq_alert_dated
  ON flightPriceAlerts (email, origin, destination, departDate, isActive);

-- 3) Unique index for watchlist alerts (SignInModal)
-- routeId is NULL for track_button rows, so this won't conflict
CREATE UNIQUE INDEX uq_alert_watchlist
  ON flightPriceAlerts (email, routeId, isActive);
