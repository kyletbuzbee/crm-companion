# Implementation Plan

## Overview
Implement additional automation features for the K&L Recycling CRM system including free geocoding, real-time priority updates, automated reporting, email workflows, data validation, and task escalation. The system uses Google Apps Script with Google Sheets data storage and a sidebar UI.

## Types
- GeocodingResult: {lat: number, lng: number, formatted_address: string, status: string}
- EmailTemplate: {subject: string, body: string, recipient: string}
- ValidationResult: {isValid: boolean, standardized: any, errors: string[], warnings: string[]}

## Files
- code.gs.txt: Add geocoding with Nominatim API, onEdit priority triggers, time-based sync triggers, email auto-send, data validation, overdue task escalation
- Sidebar.html: Add geocoding status indicators, email approval UI, validation feedback

## Functions
- New: geocodeWithNominatim(address: string): Promise<GeocodingResult>
- New: autoSendFollowUpEmail(cid: string, subject: string): boolean
- New: validateAndStandardizeContactData(data: any): ValidationResult
- New: escalateOverdueTasks(): number
- Modified: setupDailyReportTrigger() - call in onInstall/onOpen
- Modified: logVisit() - add geocoding on prospect creation
- Modified: onEdit() - add priority recalculation triggers

## Classes
No new classes; functional enhancements to existing GAS structure.

## Dependencies
- OpenStreetMap Nominatim API (free, no key required)
- Enhanced Gmail permissions for auto-send
- Time-based triggers for daily automation

## Testing
- Unit tests for geocoding, validation, escalation functions
- Integration tests for trigger automations
- Manual testing of email and priority workflows
- Regression testing of existing functionality

## Implementation Order
1. Implement Nominatim geocoding integration
2. Add onEdit priority recalculation triggers
3. Set up daily sync and reporting triggers in onInstall/onOpen
4. Enhance email automation with auto-send capability
5. Add data validation and standardization
6. Implement overdue task escalation
7. Update UI for automation feedback
8. Testing and deployment
