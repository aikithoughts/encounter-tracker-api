# encounter-tracker-api
API for Encounter Tracker App (also final project for UW JSCRIPT 330B)

## Scenario description

I'm building a backend API that allows users to manage D&D combat encounters. The API will allow authorized users full CRUD (Create, Read, Update, and Delete) access to individual combatants, such as players or non-player characters (NPCs), as well as encounters, which represent a collection of combatants.

## Problem

Playing Dungeons and Dragons can be challenging. One of the biggest challenges occurs when dealing with combat encounters. Tracking which combatant is attacking which, what hitpoints they have, and what turn order they should use, can be particularly time consuming. 

In the previous quarter, I built Dave's DM Screen, a small application that allows a user to construct an encounter and track it. However, the application lacks any backend, so users can't store encounters or update existing ones.

For my final assignment, I'll create an API backend for tracking encounters, which my frontend application (or any frontend application, I suppose) can use to track D&D encounters.

## Components

My final project will consist of:

* Two model schemas, `combatant` and `encounter`, which define the fields for each model.
* Two main routes files: `combatant`, which will handle all CRUD operations for combatant objects, and `encounter`, which will handle all CRUD operations for encounter objects.

In addition, the project will use JSONWebTokens for authentication and authorization.

## Assignment call-outs

As stated in the Components section, my app will consist of two routes supporting CRUD operations. All routes will have at least 80% test coverage, as the assignment requires.

Users will be able to search for a particular combatant or encounter by name. In addition, I would like to be able to look up encounters that contain a specific combatant.

I do not expect to use a third-party API at present; the frontend application does access an API, but I won't need it for the backend.

Adding some basic connectivity to my frontend application is a *stretch* goal. Otherwise, I will use postman to demonstrate the functionality of the API.

## Timeline

* Tuesday, May 14th: This proposal.
* Tuesday, May 21st: Model schemas defined, authentication functionality in place, basic crud operations stubbed out, test suite defined.
* Tuesday, May 28th: All crud operations complete, all search and lookup functionality in place
* Tuesday, June 4th: Final project submitted and presented, all tests passing, final fit and finish work.


