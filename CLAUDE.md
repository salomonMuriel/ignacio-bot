## Ignacio Bot Description
Ignacio is a chat assistant that helps users in the construction of their project, which they are building as part of an education program.

Ignacio is accessible through both WhatsApp and a web interface.

Users can message Ignacio through any of these channels, and Ignacio will respond according to its saved information about the user, their project and any other information the system has provided Ignacio.

## Features

Normal Users: 
* Users should be able to chat with Ignacio using Whatsapp or a Web interface.
* Any images, videos or audio files sent to Ignacio should be saved in that user's folder in Supabase Storage.
* Users should be able to upload any other kind of file to Ignacio (documents, PDFs, presentations, etc). Ignacio should be able to pull these into context when it needs to.
* Ignacio should respond to the user according to their questions on the project. Prompts for these interactions should be tailored to the response at hand. Example, if the user asks about a marketing problem, Ignacio should act as a marketing expert.
* Users should login to use Ignacio from the web platform. If they use Whatsapp, their number should be stored as the number of a created user for Ignacio to respond positively.
* Users shouldn't be able to create a new account. Accounts are created by administrators manually.
* In order to login, users get a OTP code to their stored WhatsApp numbers. They login using their WhatsApp number.

Administrators:
* Some users are administrators. They have permission to see Ignacio's conversations with anyone in a special tab.
* These users can create, delete or edit other users.
* They can only be created by another admin user.


## Tech Stack

The backend is built in Python, using FastAPI.
The web frontend is built in plain React, using Typescript.
The database is in Supabase. Ignacio should save its chat memory of each user in this Supabase Database.
Any stored media (images, audio files, anything else) is saved in Supabase Storage.


## About your workflow

Always plan your steps, and keep track of your plans in PLAN.md.
After planning, keep track of your TODO list for your current task in TODO.md
Never interact with the database destructively (changing schemas, deleting rows or tables, etc.) without explicit approval.
Always commit your work after each edit.
Always 

## Code Styling

Always run a linter after modifying a file.
Always make sure every component, class, model, function, etc are properly typed, in both Python and Typescript.