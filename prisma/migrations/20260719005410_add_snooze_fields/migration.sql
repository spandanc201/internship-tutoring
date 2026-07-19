-- Add snooze fields to PrepCalendarEvent
ALTER TABLE "prep_calendar_events" ADD COLUMN "isSnoozed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "prep_calendar_events" ADD COLUMN "snoozeUntil" TIMESTAMP(3);
