# encounter-tracker-api
API for Encounter Tracker App (also final project for UW JSCRIPT 330B)

[CLICK HERE FOR MY FINAL PROJECT SELF-ASSESSMENT](#final-project-self-evaluation)

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

## Final Project Self Evaluation

I knew going into this class that I wanted to continue my work on my Dungeons
and Dragons Encounter Tracker. While my current version doesn't persist, it has
already proven invaluable in my game.

To get started, I decided to leverage the code we had already built for orders
and items. However, I did not simply copy this code into a new repository and 
rename things. Instead, I deliberately brought in the existing code and then
built my code alongside the existing functionality. I chose this option because
that allowed me to do a few things:

1. I could make sure existing tests were running correctly. That way, if my
new code broke anything, I could better determine if something was *actually*
broken, or if it never worked to begin with.

1. I could write the tests myself, instead of simply copying and pasting. I find
this methodology a lot better for learning how tests are constructed and how
code should work.

1. I could leverage the existing middleware. It seemed to me that my middleware
was going to be pretty consistent with what we already created, and it didn't
make sense to recreate it from scratch.

As my application stabilized, I removed the older files as they were no longer
needed.

### Results

I now have a backend application that closely matches my frontend application.
In hindsight, this is maybe a little backwards--it probably would have made more
sense to create the backend first, then build the frontend on top of that. I
don't know what's more of a real-world scenario, but maybe it's a combination of
both options.

Building the backend application also made me realize that simply adding it to
the frontend would not be sufficient. I'll need to add additional UI elements so
users can name their encounters, for example. And I'll need to create ways for
users to view a list of combatants and encounters. I also have to think more
carefully about what information users can see. For example, right now there's
only one user--me. Originally I thought that I'd make it so users can only
modify their own creations, and admins can modify anything. But then I realized
that users might want to make their creations (a monster, for example) available
to anyone. Therefore, I might need to update my models to include a "isPublic"
property.

However, for the purposes of this class, and given the time we had available,
I think the application came together pretty well!

## What I learned

One thing I learned was really applying test-driven development principles
involves more than just writing a test. I had to really think about what the
test should do. More importantly, I had to think about whether the test I
created actually tested what I thought it did. To put another way, I learned
that testing is more than just getting a "pass" or "fail". It's about carefully
considering your application's behaviors.

Another thing I learned is that there's a level beyond just writing tests. I
spent a decent amount of time thinking about the overall architecture of what I
was building. What features would I like to see in the future? Does my current
application structure support that roadmap? This is one reason why I didn't
add a cloud-based database to this application yet; I still want to think about
what kind of data I want to store, and make sure the cloud-based solution I
choose supports that data at a reasonable cost.

A final thing that I learned is that I don't think coding is ever really done.
I had to really restrain myself from trying to add too many things to this
application. Scaling back is important because if I added too many things, I
wouldn't get done in time. Testing would have become increasingly challenged.
But really, most importantly, I don't have the skills yet to build large things
in one fell swoop. Now I have a roadmap that I can follow to slowly add new
features and capabilities, making sure that I can build this application
thoughtfully. I've worked with software engineers for a long time, but this was
the first time I really understood why it sometimes takes a while for features
to get developed.

### What worked well

Having an existing application to base my own work from was a huge help and
paid great dividends. Not only did it make it easier for me to make sure my
application was structured correctly, it helped me remember a lot of common
syntax that I don't have memorized yet. Also, it helped me remember what sort of
tests I needed to make sure that my application worked as intended.

Following a test-driven development process was also really helpful. There were
many times where I discovered missing functionality or unintended behavior
because I was thinking about testing. For example, when I was adding the delete
functionality, I realized that I hadn't thought about what would happen if you
deleted a combatant that was still being used in the encounter. That would
probably break the application as it is currently written. I wrote a test to
make sure that you could only delete a combatant if it was not used in an
encounter. That, in turn, meant I needed a new index so I could look up
encounters based on what combatants it contained. This experience was really
when the power of test-driven development became clear to me.

### What didn't work as well

If I could, I would have created at least a very simple UI to test the
application. Looking at just the code and my tests I feel provided a
functionally complete picture of the application, but I won't know if I'm
covering all the use cases until I connect the front end. I understand there
are some concepts around rapid prototyping--maybe that's something I can look
into for next time.

I also learned that I need to be careful with the tools I use. I installed a
Jest extension that allows me to run individual tests by clicking on an arrow
by the test. That was really helpful. But it did NOT work well initially with
Jest when you run it with the `--inBand` parameter. I had to do some research
to figure out that the extension needed an additional setting added to its
configuration. That took about an hour to discover.

### Future improvements

There's so much that I want to add to this application:

- Cloud-based database. I want to move the database to Cloud Atlas or some other
cloud-based solution.
- Auth0 or other authentication scheme. My existing authentication code is very
basic. I'd like to add more powerful authentication so users can sign in using
their Google or other accounts.
- More database fields. I'd like to add an `isPublic` value to the models so
users can choose to make their combatants and encounters visible to anyone. I'd
like to add a `duplicate` or `clone` feature to the application; although that
may be doable only on the frontend. 
- I'd like to add more user types. Perhaps an `owner` level that handles the
current `admin` role. Then `admin` might be restricted to specific encounters.
- I'd like to add more tests and more structure to make sure the code is
functional and maintainable.

I guess you never are really done with a project--you just stop working on it.

### Conclusion

This was a great project for learning how to to backend development with
JavaScript. I feel more comfortable with working with the Data Access Object
model, and with following test-driven development methodologies. I look forward
to learning about other development methodologies and continuing to learn and
apply my software engineering skills.


