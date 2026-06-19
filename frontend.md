HackOS Frontend Architecture

Global Structure

Landing Page
│
├── Authentication
│
├── Organizer Portal
│
├── Participant Portal
│
└── Reviewer Portal

⸻

ORGANIZER PORTAL

Organizer Home Dashboard

Purpose:
Multi-hackathon overview

Cards:

* Total Hackathons
* Active Hackathons
* Registrations
* Teams
* Reviewers
* Evaluations
* Bias Alerts
* Engagement Rate

Charts:

* Registrations Over Time
* Submission Rate
* Evaluation Progress
* Skill Distribution

Actions:

* Create Hackathon
* View Hackathons

⸻

Create Hackathon Wizard

Step 1
Basic Information

Step 2
Problem Statements

Step 3
Skill Requirements

For each problem statement:

Backend
Frontend
AI/ML
Cloud
Security
Design
Mobile
DevOps

Step 4
Evaluation Rubric

Step 5
Reviewer Invitations

Step 6
Preview

Step 7
Publish

⸻

View Hackathons

Shows all hackathons.

Each card:

Hackathon Name
Status
Registrations
Teams
Submissions
Review Progress

Actions:

View Details

⸻

Individual Hackathon Dashboard

Tabs:

Overview

Registrations

Teams

Submissions

Reviewers

Evaluations

Analytics

Audit Trail

⸻

Registrations

Table

Name
College
Status
Duplicate Risk
Face Validation

Actions

Approve
Reject
View Analysis

Clicking Analysis opens

Duplicate Breakdown Modal

Resume Similarity

GitHub Similarity

Skills Similarity

Device Similarity

Risk Score

Reasoning

⸻

Teams

Table

Team Name

Coverage Score

Problem Statement

Members

Status

Actions

View Team

Download CSV

⸻

Team Detail Page

Team Members

Skill Matrix

Coverage Score

Problem Statement

Submission Status

Reviewer Assigned

AI Recommendation Explanation

Why team is strong

Missing skills

Potential weaknesses

⸻

Reviewers

Table

Reviewer

Expertise

Assignments

Workload

Consistency

Bias Risk

Actions

Reassign

View Assignment Logic

⸻

Reviewer Assignment Screen

Visualization

Reviewer ←→ Team

Show

Expertise Match %

Workload %

Conflict Check

Assignment Score

AI Explanation

Why reviewer was chosen

⸻

Evaluations

Overview

Assigned

Completed

Pending

Generate Results

Publish Results

⸻

Analytics

Registration Funnel

Skill Heatmap

Submission Funnel

Reviewer Performance

Bias Alerts

Predictions

Teams likely not to submit

Reviewer overload prediction

⸻

PARTICIPANT PORTAL

Participant Dashboard

Cards

Registered Hackathons

Teams

Pending Invites

Notifications

Recommendations

⸻

Browse Hackathons

Cards

Hackathon Name

Theme

Open Spots

Registration Deadline

AI Match %

Action

Register

⸻

Register For Hackathon

Step 1

Profile

Name

College

GitHub

LinkedIn

Resume

Step 2

Resume Upload

Resume Parsing

Skill Extraction

Preview Extracted Skills

Edit Skills

Step 3

Face Validation

Consent

Validate

Skip

Step 4

Registration Pipeline

Live Progress

Resume Parsed

Skills Extracted

Duplicate Check

Validation

Approval

WebSocket Updates

⸻

Post Registration Dashboard

Shows

Registered Hackathons

Registration Status

Suggested Problem Statements

Suggested Teams

Suggested Teammates

⸻

Hackathon Workspace

This becomes participant’s main screen.

Tabs

Overview

Team

Recruitment

Submission

Results

⸻

Team Formation

Options

Create Team

Join Team

⸻

Create Team

Team Name

Problem Statement

Recruiting Status

Required Roles

Backend

Frontend

AI/ML

Design

Cloud

⸻

Recruitment Marketplace

Critical Missing Feature

Shows recommended participants.

Card

Name

Skills

Match %

Role

Coverage Improvement

Actions

Invite

AI Reason

“This participant fills backend gap.”

⸻

Join Team Marketplace

Shows all teams.

Sorted by compatibility.

Card

Team Name

Problem Statement

Coverage Score

Missing Skills

Current Members

Compatibility %

AI Explanation

“Joining this team increases team coverage from 68% to 92%.”

Actions

Request Join

⸻

Team Workspace

Members

Invitations

Coverage Radar

Chat

Tasks

Submission Status

Problem Statement

⸻

Submission

Project Name

Description

GitHub

Demo

PPT

Video

Save Draft

Submit

⸻

Results

Rank

Final Score

Confidence Score

Reviewer Comments

AI Feedback

Leaderboard

⸻

REVIEWER PORTAL

Reviewer Dashboard

Cards

Assigned Hackathons

Assigned Teams

Pending Reviews

Completed Reviews

Consistency Score

⸻

Profile Setup

Domains

Experience

Organization

Availability

Conflict Declarations

⸻

Assigned Hackathons

Card

Hackathon

Teams Assigned

Pending Reviews

Progress

⸻

Team Queue

Table

Team

Problem Statement

Submission Status

Expertise Match %

Priority

Action

Evaluate

⸻

Evaluation Page

Submission

GitHub

Demo

PPT

Problem Statement

Rubric

Innovation

Technical Depth

Scalability

Impact

Presentation

Scores

Comments

Submit

⸻

Evaluation History

Previous Reviews

Average Scores

Consistency Score

Reliability Score

⸻

Reviewer Insights

Visible Only To Reviewer

Average Score

Peer Average

Consistency Trend

Completion Rate

⸻

GLOBAL STATE TRANSITIONS

Participant

DISCOVER
→ REGISTER
→ VALIDATION
→ APPROVED
→ TEAM FORMATION
→ TEAM LOCKED
→ SUBMISSION
→ EVALUATION
→ RESULTS

Reviewer

INVITED
→ ACCEPTED
→ ASSIGNED
→ REVIEWING
→ COMPLETED

Organizer

CREATE
→ PUBLISH
→ REGISTRATION
→ TEAM FORMATION
→ SUBMISSION
→ REVIEW
→ RESULTS
→ CLOSED

⸻

