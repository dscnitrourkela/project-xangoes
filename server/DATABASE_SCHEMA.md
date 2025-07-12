# Database Schema Documentation

## Overview

The Project Xangoes database consists of **8 core entities** that manage college fests, events, and user interactions. Each entity serves a specific purpose in the fest management ecosystem.

---

## Entity Summary

| Entity                | Purpose                            | Key Relationship                     | Real-world Analogy                        |
| --------------------- | ---------------------------------- | ------------------------------------ | ----------------------------------------- |
| **User**              | Participants, organizers, students | Central hub - connects to everything | Digital ID card for fest participants     |
| **Fest**              | Main festival/event                | Contains events, has users           | The umbrella event (like "TechFest 2024") |
| **Club**              | Organizing bodies                  | Organizes events, has team members   | Different departments organizing events   |
| **Event**             | Individual competitions            | Belongs to clubs, has registrations  | Specific competitions within the fest     |
| **Institute**         | Educational institutions           | Has users as students                | Colleges/universities students come from  |
| **Transaction**       | Payment records                    | Tracks user payments                 | Digital receipts for all payments         |
| **EventRegistration** | User-event participation           | Links users to events                | Registration list for each event          |
| **Team**              | User-club membership               | Links users to clubs                 | Club membership records                   |

---

## Detailed Entity Specifications

### 1. 👤 User Entity

| Field           | Type     | Required | Description               | Example                |
| --------------- | -------- | -------- | ------------------------- | ---------------------- |
| `id`            | string   | ✅       | Unique identifier         | `user_12345`           |
| `email`         | string   | ✅       | Primary contact (unique)  | `john@example.com`     |
| `name`          | string   | ❌       | Display name              | `John Doe`             |
| `photo`         | string   | ❌       | Profile picture URL       | `https://...`          |
| `gender`        | enum     | ❌       | MALE, FEMALE, OTHERS      | `MALE`                 |
| `dob`           | datetime | ❌       | Date of birth             | `1999-05-15`           |
| `state`         | string   | ❌       | State/region              | `California`           |
| `city`          | string   | ❌       | City                      | `San Francisco`        |
| `college`       | string   | ❌       | Institute ID reference    | `inst_nit_rkl`         |
| `idCard`        | string   | ❌       | Student ID card URL       | `https://...`          |
| `stream`        | string   | ❌       | Academic stream           | `Computer Science`     |
| `mobile`        | string   | ✅       | Phone number (unique)     | `+1234567890`          |
| `selfID`        | string   | ❌       | Self-uploaded ID          | `https://...`          |
| `festID`        | list     | ❌       | Array of fest IDs         | `[fest_1, fest_2]`     |
| `ca`            | list     | ❌       | Campus ambassador IDs     | `[ca_1, ca_2]`         |
| `referredBy`    | string   | ❌       | Referrer user ID          | `user_67890`           |
| `rollNumber`    | string   | ❌       | College roll number       | `20CS001`              |
| `uid`           | string   | ✅       | Firebase auth ID (unique) | `firebase_uid_123`     |
| `hasPaid`       | boolean  | ❌       | Payment status            | `true`                 |
| `receipt`       | string   | ❌       | Payment receipt URL       | `https://...`          |
| `transactionID` | string   | ❌       | Payment transaction ID    | `txn_123456`           |
| `hall`          | string   | ❌       | Hostel/hall assignment    | `Hall A`               |
| `createdAt`     | datetime | ✅       | Record creation time      | `2024-01-15T10:30:00Z` |
| `updatedAt`     | datetime | ✅       | Last update time          | `2024-01-16T14:20:00Z` |

### 2. 🎪 Fest Entity

| Field             | Type     | Required | Description                  | Example                        |
| ----------------- | -------- | -------- | ---------------------------- | ------------------------------ |
| `id`              | string   | ✅       | Unique identifier            | `fest_techfest2024`            |
| `name`            | string   | ✅       | Festival name                | `TechFest 2024`                |
| `tagline`         | string   | ❌       | Festival motto               | `Innovation Unleashed`         |
| `logo`            | string   | ❌       | Festival logo URL            | `https://...`                  |
| `theme`           | string   | ❌       | Festival theme               | `Future Tech`                  |
| `description`     | string   | ❌       | Festival description         | `Annual technical festival...` |
| `startDate`       | datetime | ✅       | Festival start date          | `2024-03-15T09:00:00Z`         |
| `endDate`         | datetime | ✅       | Festival end date            | `2024-03-18T18:00:00Z`         |
| `status`          | enum     | ❌       | ACTIVE, DRAFT, EXPIRED       | `ACTIVE`                       |
| `registrationFee` | integer  | ❌       | Participation fee            | `500`                          |
| `collegeStatus`   | enum     | ❌       | BLACKLISTED, ALLOWED, OTHER  | `ALLOWED`                      |
| `society`         | list     | ❌       | Array of organizing club IDs | `[club_1, club_2]`             |
| `createdAt`       | datetime | ✅       | Record creation time         | `2024-01-01T00:00:00Z`         |
| `updatedAt`       | datetime | ✅       | Last update time             | `2024-01-10T12:00:00Z`         |

### 3. 🏛️ Club Entity

| Field         | Type     | Required | Description                                           | Example                  |
| ------------- | -------- | -------- | ----------------------------------------------------- | ------------------------ |
| `id`          | string   | ✅       | Unique identifier                                     | `club_robotics`          |
| `name`        | string   | ✅       | Club name                                             | `Robotics Club`          |
| `subType`     | enum     | ✅       | TECHNICAL, CULTURAL, SPORTS, HACKATHON, LITERARY, FMS | `TECHNICAL`              |
| `description` | string   | ❌       | Club description                                      | `We build robots and...` |
| `logo`        | string   | ❌       | Club logo URL                                         | `https://...`            |
| `events`      | list     | ❌       | Array of event objects                                | `[event_1, event_2]`     |
| `createdAt`   | datetime | ✅       | Record creation time                                  | `2024-01-01T00:00:00Z`   |
| `updatedAt`   | datetime | ✅       | Last update time                                      | `2024-01-05T10:00:00Z`   |

### 4. 📅 Event Entity

| Field         | Type     | Required | Description               | Example                         |
| ------------- | -------- | -------- | ------------------------- | ------------------------------- |
| `id`          | string   | ✅       | Unique identifier         | `event_robowar`                 |
| `name`        | string   | ✅       | Event name                | `Robo War Championship`         |
| `subHeading`  | string   | ❌       | Event subtitle            | `Battle of the Bots`            |
| `prizeMoney`  | JSON     | ❌       | Prize structure           | `{"1st": 10000, "2nd": 5000}`   |
| `type`        | string   | ❌       | Event category            | `Competition`                   |
| `description` | string   | ✅       | Event description         | `Build fighting robots...`      |
| `poster`      | string   | ✅       | Event poster URL          | `https://...`                   |
| `rules`       | list     | ✅       | Array of rule strings     | `["Max weight 2kg", "No fire"]` |
| `location`    | string   | ❌       | Event venue               | `Main Auditorium`               |
| `startDate`   | datetime | ✅       | Event start time          | `2024-03-16T14:00:00Z`          |
| `endDate`     | datetime | ❌       | Event end time            | `2024-03-16T18:00:00Z`          |
| `clubId`      | string   | ❌       | Organizing club ID        | `club_robotics`                 |
| `contact`     | list     | ✅       | Contact phone numbers     | `["+1234567890"]`               |
| `pocID`       | list     | ✅       | Point of contact user IDs | `[user_123, user_456]`          |
| `weekly`      | boolean  | ❌       | Recurring weekly          | `false`                         |
| `repeatDay`   | enum     | ❌       | Day of week for recurring | `MONDAY`                        |
| `priority`    | integer  | ❌       | Display priority          | `5`                             |
| `status`      | enum     | ❌       | ACTIVE, DRAFT, EXPIRED    | `ACTIVE`                        |
| `createdAt`   | datetime | ✅       | Record creation time      | `2024-01-10T00:00:00Z`          |
| `updatedAt`   | datetime | ✅       | Last update time          | `2024-01-15T10:00:00Z`          |

### 5. 🏠 Institute Entity

| Field           | Type     | Required | Description                     | Example                          |
| --------------- | -------- | -------- | ------------------------------- | -------------------------------- |
| `id`            | string   | ✅       | Unique identifier               | `inst_nit_rkl`                   |
| `name`          | string   | ✅       | Institution name                | `NIT Rourkela`                   |
| `description`   | string   | ✅       | Institution description         | `Premier technical institute...` |
| `address`       | string   | ✅       | Institution address             | `Rourkela, Odisha, India`        |
| `logo`          | string   | ❌       | Institution logo URL            | `https://...`                    |
| `registrations` | integer  | ❌       | Number of student registrations | `1250`                           |
| `collegeStatus` | enum     | ❌       | BLACKLISTED, ALLOWED, OTHER     | `ALLOWED`                        |
| `createdAt`     | datetime | ✅       | Record creation time            | `2024-01-01T00:00:00Z`           |
| `updatedAt`     | datetime | ✅       | Last update time                | `2024-01-01T00:00:00Z`           |

### 6. 💰 Transaction Entity

| Field           | Type     | Required | Description                | Example                |
| --------------- | -------- | -------- | -------------------------- | ---------------------- |
| `id`            | string   | ✅       | Unique identifier          | `txn_123456`           |
| `amount`        | integer  | ❌       | Transaction amount         | `500`                  |
| `userID`        | string   | ✅       | User making payment        | `user_12345`           |
| `transactionID` | string   | ❌       | External transaction ID    | `razorpay_123`         |
| `type`          | enum     | ✅       | REGISTRATION, MERCH, EVENT | `REGISTRATION`         |
| `timestamp`     | datetime | ✅       | Transaction time           | `2024-01-15T10:30:00Z` |
| `festID`        | string   | ❌       | Related fest ID            | `fest_techfest2024`    |
| `comment`       | string   | ❌       | Additional notes           | `Early bird discount`  |
| `screenshot`    | string   | ❌       | Payment proof URL          | `https://...`          |
| `isVerified`    | boolean  | ❌       | Verification status        | `true`                 |
| `createdAt`     | datetime | ✅       | Record creation time       | `2024-01-15T10:30:00Z` |
| `updatedAt`     | datetime | ✅       | Last update time           | `2024-01-15T11:00:00Z` |

### 7. 📝 EventRegistration Entity

| Field       | Type     | Required | Description                | Example                |
| ----------- | -------- | -------- | -------------------------- | ---------------------- |
| `id`        | string   | ✅       | Unique identifier          | `reg_12345`            |
| `eventID`   | string   | ✅       | Event being registered for | `event_robowar`        |
| `userID`    | string   | ✅       | User registering           | `user_12345`           |
| `createdAt` | datetime | ✅       | Registration time          | `2024-01-16T09:00:00Z` |
| `updatedAt` | datetime | ✅       | Last update time           | `2024-01-16T09:00:00Z` |

### 8. 👥 Team Entity

| Field       | Type     | Required | Description          | Example                |
| ----------- | -------- | -------- | -------------------- | ---------------------- |
| `id`        | string   | ✅       | Unique identifier    | `team_12345`           |
| `team`      | string   | ❌       | Team/role name       | `Core Team`            |
| `userID`    | string   | ✅       | User ID              | `user_12345`           |
| `clubID`    | string   | ✅       | Club ID              | `club_robotics`        |
| `createdAt` | datetime | ✅       | Record creation time | `2024-01-01T00:00:00Z` |
| `updatedAt` | datetime | ✅       | Last update time     | `2024-01-01T00:00:00Z` |

---

## Entity Relationships

| From Entity | To Entity       | Relationship Type | Description                       |
| ----------- | --------------- | ----------------- | --------------------------------- |
| **User**    | **Institute**   | Many-to-One       | Users belong to institutes        |
| **User**    | **Fest**        | Many-to-Many      | Users can join multiple fests     |
| **User**    | **Event**       | Many-to-Many      | Via EventRegistration table       |
| **User**    | **Club**        | Many-to-Many      | Via Team table                    |
| **User**    | **Transaction** | One-to-Many       | Users can make multiple payments  |
| **Fest**    | **Club**        | Many-to-Many      | Fests organized by multiple clubs |
| **Club**    | **Event**       | One-to-Many       | Clubs organize multiple events    |
| **Event**   | **User**        | Many-to-Many      | Via EventRegistration table       |

---

## Status Enums Reference

| Entity          | Field           | Possible Values                                                              | Default   |
| --------------- | --------------- | ---------------------------------------------------------------------------- | --------- |
| **User**        | `gender`        | `MALE`, `FEMALE`, `OTHERS`                                                   | -         |
| **Fest**        | `status`        | `ACTIVE`, `DRAFT`, `EXPIRED`                                                 | `ACTIVE`  |
| **Fest**        | `collegeStatus` | `BLACKLISTED`, `ALLOWED`, `OTHER`                                            | `ALLOWED` |
| **Club**        | `subType`       | `TECHNICAL`, `CULTURAL`, `SPORTS`, `HACKATHON`, `LITERARY`, `FMS`            | -         |
| **Event**       | `status`        | `ACTIVE`, `DRAFT`, `EXPIRED`                                                 | `DRAFT`   |
| **Event**       | `repeatDay`     | `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY` | -         |
| **Institute**   | `collegeStatus` | `BLACKLISTED`, `ALLOWED`, `OTHER`                                            | -         |
| **Transaction** | `type`          | `REGISTRATION`, `MERCH`, `EVENT`                                             | -         |

---

## Common Query Patterns

| Query Need                   | Tables Involved                    | Example                                    |
| ---------------------------- | ---------------------------------- | ------------------------------------------ |
| Get user's registered events | `User → EventRegistration → Event` | Find all events user_123 is registered for |
| List all events in a fest    | `Fest → Club → Event`              | Show all events in TechFest 2024           |
| Find club members            | `Club → Team → User`               | Get all members of Robotics Club           |
| Check payment status         | `User → Transaction`               | Verify if user has paid fest fee           |
| Get event participants       | `Event → EventRegistration → User` | List all users registered for Robo War     |
| Find user's transactions     | `User → Transaction`               | Show payment history for user_123          |

---
