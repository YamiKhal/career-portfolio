---

title: "TrackGames Feature Showcase"
description: "A closer look at the main features, design choices, and technical structure behind TrackGames."
date: 2026-07-11T15:00:00+02:00
tags:
- trackgames
- full-stack
- nextjs
- development

---

TrackGames is a web application for people who want to **organize, track, and discuss the games they play**.

The main goal is simple: provide one place where a user can manage their gaming history without depending on a specific store, console, or launcher.

It combines personal tracking, custom lists, profile customization, game discovery, and social features in one system.

> TrackGames is not intended to replace Steam, PlayStation, Xbox, or other game platforms. It acts as a separate personal library that brings information from different places together.

![TrackGames main page showing several game sections](/projects/trackgames-mainpage.png)

*Suggested image: a full-width screenshot of the TrackGames home page. It should show the navigation, game cards, trending section, and general visual style.*

## Purpose and goal

Most game platforms only track games purchased or played through their own service.

A user may own games across Steam, Epic Games, consoles, subscriptions, physical copies, and older systems. This makes it difficult to maintain one complete library.

TrackGames provides a **platform-independent game collection**.

Users can manually add games, import supported libraries, organize entries, and record information that may not exist on the original platform.

The application focuses on three main uses:

* keeping a personal gaming record
* organizing games into useful collections
* sharing selected activity with other users

The tracking system is built around the user rather than around where the game was purchased.

## Accounts and personalization

Each user receives a profile that represents their activity on TrackGames.

A profile can contain a display name, biography, profile image, linked accounts, statistics, badges, and configurable sections.

The goal is to give users control over how much information they show.

Some users may only want a private game tracker. Others may want a public profile that acts as a record of the games they have completed.

[IMAGE: USER PROFILE OVERVIEW]

*Suggested image: a screenshot of a complete user profile. Include the avatar, biography, statistics, recent games, badges, and profile navigation.*

Profile widgets allow users to choose which information appears and how it is arranged.

Available widget ideas include:

* account statistics
* favorite games
* recently played games
* custom Markdown text
* selected playlists
* completion history

This makes profiles feel personal without requiring users to design the entire page themselves.

Privacy controls are also part of the account system.

Information can be public, visible only to followers, or private, depending on the type of content.

## Game tracking and logging

The central TrackGames feature is the personal game library.

A game can be assigned one of several statuses:

```ts
enum GameStatus {
	BACKLOG
	PLAYING
	FINISHED
	MASTERED
}
```

These statuses are intentionally limited.

A small number of clear states is easier to understand than a large list of similar options.

**Backlog** means the user intends to play the game.

**Playing** means the game is currently active.

**Finished** means the main experience has been completed.

**Mastered** is intended for users who have completed most or all optional content.

Each library entry can also store additional information:

```ts
type UserGameEntry = {
	status: GameStatus;
	rating?: number;
	timePlayed?: number;
	completion?: number;
	notes?: string;
	favorite: boolean;
	addedAt: Date;
	startedAt?: Date;
	finishedAt?: Date;
};
```

This allows the system to record more than a basic ownership flag.

A user can keep notes, rate the experience, mark favorites, record playtime, and track when a game was started or completed.

[IMAGE: GAME TRACKING FORM]

*Suggested image: the form or modal used to update a game. Show the status selector, rating, playtime, progress, notes, and favorite option.*

The application treats these values as optional.

A user can simply mark a game as finished, or they can maintain a detailed record.

This avoids forcing every user into the same tracking routine.

## Ratings and reviews

TrackGames separates a simple rating from a written review.

A rating gives the user a quick way to score a game. A review gives them space to explain that score.

This distinction matters because many users want to record an opinion without writing a full review.

Ratings can also be used to build personal statistics and sorted lists.

For example, a profile can show:

* highest-rated games
* lowest-rated games
* favorite games
* recently rated games
* average score by year

Reviews can be displayed on game pages and profile pages.

They can also support comments, allowing other users to respond without changing the original review.

[IMAGE: GAME REVIEW SECTION]

*Suggested image: a game page showing the user rating summary, written reviews, and a small comment thread.*

## Game lists and playlists

The main library is designed around tracking status.

Custom game lists serve a different purpose.

A list can group games by theme, recommendation, genre, platform, mood, or any other category chosen by the user.

Example lists could include:

* games with strong exploration
* short games worth finishing
* favorite cooperative games
* games completed this year
* games with unusual combat systems

Lists can be ordered manually.

This allows the owner to create rankings, recommendation lists, or a planned play order.

```ts
type GameListEntry = {
	gameId: number;
	position: number;
	addedAt: Date;
};
```

The `position` value is important because a list is not always just a collection.

For a ranked list, the order is part of the content.

[IMAGE: CUSTOM GAME LIST]

*Suggested image: a public playlist or ranked list. Show its title, description, owner, game entries, positions, likes, and comments.*

Lists use the same privacy structure as profiles.

They can be public, followers-only, or private.

Public lists can be shared and discussed. Private lists can be used as personal planning tools.

## Social features

TrackGames includes social features, but they are kept secondary to the tracking tools.

The application should remain useful even if a user never follows another account.

Users can follow profiles to see selected activity, new lists, ratings, reviews, and completed games.

Activity entries can include events such as:

* starting a game
* finishing a game
* publishing a review
* creating a list
* adding games to a public list
* following another user

The activity feed is intended to show meaningful updates rather than every small account change.

This reduces noise and keeps the feed focused on games.

[IMAGE: ACTIVITY FEED]

*Suggested image: an activity feed showing several different event types, such as a completed game, a new review, and a published playlist.*

Comments can be attached to reviews, lists, and other public content.

They provide a direct way to discuss a game without requiring a separate forum system.

Likes can be used on public lists and reviews as a lightweight way to show agreement or save interest.

## Game pages

Each game has a dedicated page combining external game information with TrackGames activity.

External data can include:

* title and cover
* release date
* platforms
* genres and themes
* screenshots
* videos
* summary and storyline
* official websites

TrackGames adds user-specific information on top of this data.

This includes the current user's tracking status, rating, notes, time played, and list membership.

The page can also display community information such as average ratings, recent reviews, and the number of users tracking the game.

[IMAGE: COMPLETE GAME PAGE]

*Suggested image: a full game page. Include the cover, title, metadata, screenshots, tracking controls, community statistics, and reviews.*

The page is designed to answer two questions:

1. What is this game?
2. What does this game mean to the current user and the TrackGames community?

## Game data and IGDB

TrackGames uses the **IGDB API** as its main source of game information.

IGDB provides structured data for games, platforms, release dates, artwork, videos, companies, genres, and related fields.

Credit for the underlying game data belongs to IGDB.

> Game information and media are retrieved from IGDB. TrackGames stores and presents that information alongside its own user-generated data.

The application does not need a permanent local copy of the entire IGDB database.

Instead, games are retrieved when needed and cached for later requests.

A simplified data flow looks like this:

```text
User request
    |
    v
TrackGames server
    |
    +--> Redis cache available?
    |        |
    |        +--> Yes: return cached game
    |        |
    |        +--> No: request game from IGDB
    |
    v
Store temporary result
    |
    v
Return game data
```

This reduces unnecessary requests while avoiding a large database filled with games that no user has opened.

Frequently used data can be refreshed through background jobs.

Less common games can remain cached until their data expires or is requested again.

## Search and discovery

Search is used for more than finding an exact game title.

Users may search by title, platform, release period, genre, or other supported metadata.

The results need to remain fast while still presenting useful information such as covers, release dates, and platforms.

Discovery sections provide another way to find games.

Examples include:

* trending games
* popular recent releases
* highly rated games from the current year
* random selections
* games related to the user's library

[IMAGE: TRENDING AND DISCOVERY SECTIONS]

*Suggested image: several home-page discovery sections, especially trending games, random picks, and yearly highlights.*

Trending results are not based on only one number.

TrackGames combines multiple IGDB popularity signals and limits the result to a relevant release period.

A simplified score can be represented like this:

```ts
const trendingScore =
	searchPopularity * 0.6 +
	visitPopularity * 0.4;
```

The exact values can change as the application is tested.

The important design choice is that the result should represent current interest rather than only total lifetime popularity.

## Sorting and filtering

A large library becomes difficult to use without strong filtering.

TrackGames allows entries to be sorted or filtered by values such as:

* tracking status
* personal rating
* date added
* date completed
* release date
* playtime
* favorite status
* platform

The filtering system should make it easy to answer practical questions.

For example:

> Which games in my backlog were released during the last two years?

Or:

> Which games did I finish this year and rate above eight?

[IMAGE: LIBRARY FILTERS]

*Suggested image: the personal library with the filter menu open. Show multiple selected filters and the resulting game grid.*

Filters should remain visible and understandable.

The user should not need to remember why certain games are missing from the current view.

## Imports

Manual tracking is useful, but entering a large existing library one game at a time is not practical.

TrackGames supports library imports where platform access allows it.

Steam is the main example.

The importer can retrieve owned games, match them to TrackGames entries, and add them to the user's library.

Imported games should not overwrite personal information without permission.

For example, importing a Steam game should not replace an existing TrackGames rating, status, or note.

The import process is treated as a starting point rather than the final record.

## Statistics

TrackGames can create useful statistics from ordinary tracking data.

These statistics are not separate entries created by the user. They are calculated from game statuses, ratings, timestamps, and playtime.

Examples include:

* games completed per year
* average personal rating
* total recorded playtime
* most played genres
* most used platforms
* completion rate
* backlog size
* monthly activity

[IMAGE: USER STATISTICS DASHBOARD]

*Suggested image: a profile statistics page with charts for completed games, ratings, playtime, platforms, and genres.*

Statistics should explain the user's activity rather than simply display large numbers.

A smaller chart showing completion patterns is often more useful than a single lifetime total.

## Admin dashboard

The administration area is separate from normal user features.

Its purpose is to help maintain the application, inspect problems, and understand how the service is being used.

The dashboard can include:

* user and account totals
* active users
* public content counts
* imported game counts
* database status
* cache status
* recent errors
* moderation tools
* application logs

[IMAGE: ADMIN DASHBOARD OVERVIEW]

*Suggested image: the admin dashboard home page. Show several summary cards, a small traffic chart, recent logs, and system status.*

Administrative actions should be limited by role.

Normal users should never receive access simply because an admin page is hidden from navigation.

Permissions are checked on the server before protected data is returned.

## Analytics and usage tracking

TrackGames uses Google Analytics to understand general site usage.

This includes information such as page views, navigation patterns, entry pages, and broad traffic sources.

Analytics are not used as a replacement for application data.

Google Analytics can explain which pages are visited. The TrackGames database explains which features are actually used.

For example:

```text
Google Analytics:
- page views
- traffic source
- device category
- session activity

TrackGames database:
- games added
- reviews published
- lists created
- imports completed
- accounts registered
```

These two sources can be shown together in the admin dashboard.

They should still remain clearly separated because they measure different things.

Tracking is also connected to the user's consent choices.

Optional analytics should not load before the user has allowed them.

## Application logging

User-facing activity and technical logs are different systems.

Activity records describe actions that may be shown to users, such as completing a game or publishing a review.

Technical logs describe application behaviour, warnings, failed requests, and errors.

A technical log entry may contain:

```ts
type LogEntry = {
	level: "info" | "warn" | "error";
	message: string;
	source: string;
	userId?: string;
	createdAt: Date;
};
```

Logs can be linked to a user when that connection helps diagnose a problem.

They should not store private content unless it is necessary for the error being recorded.

Older technical logs can be removed automatically after a set period, such as thirty days.

## Notifications

Notifications inform users when another person directly interacts with their content or account.

Examples include:

* a new follower
* a reply to a review
* a comment on a list
* a like on published content
* a relevant account or system message

Notifications should be selective.

Creating a notification for every small activity would make the system distracting and reduce the value of important messages.

Users should also be able to control which notification types they receive.

## Privacy

TrackGames contains both private tracking data and public social content.

The application must treat these as separate cases.

A private library entry should not appear in activity feeds, public statistics, search results, or profile widgets.

Privacy checks need to happen when data is queried, not only when components are rendered.

```ts
const canView =
	resource.visibility === "PUBLIC" ||
	resource.ownerId === viewerId ||
	(
		resource.visibility === "FOLLOWERS" &&
		viewerFollowsOwner
	);
```

This prevents hidden information from being returned to unauthorized users.

The interface then reflects the same result.

## Technical structure

TrackGames uses a full-stack TypeScript structure.

The main technologies are:

| Technology       | Role                                              |
| ---------------- | ------------------------------------------------- |
| Next.js          | Application pages, server logic, and API handling |
| TypeScript       | Shared typing across the application              |
| PostgreSQL       | Permanent user and application data               |
| Prisma           | Database schema and typed database access         |
| Redis            | Temporary game data and caching                   |
| Tailwind CSS     | Interface styling                                 |
| Docker           | Consistent application containers                 |
| Coolify          | Deployment and service management                 |
| IGDB             | External game information                         |
| Google Analytics | General traffic analytics                         |

Each technology has a specific role.

The stack is not intended to include as many tools as possible. It is intended to cover the needs of the application without adding unnecessary layers.

## Why Next.js

TrackGames contains both public pages and authenticated application features.

Some pages benefit from server rendering, while others require interactive client-side controls.

Next.js supports both patterns in one project.

Server components can retrieve data without sending unnecessary JavaScript to the browser.

Client components are used only where interaction is needed, such as filters, forms, dialogs, and sortable lists.

This makes it possible to keep static sections simple while still supporting a responsive application interface.

## Why PostgreSQL and Prisma

TrackGames data contains many relationships.

Users have library entries, lists, followers, comments, ratings, notifications, profile widgets, and activity records.

PostgreSQL is suited to this structure because it supports clear relational constraints and complex queries.

Prisma is used to define the schema and access the database through generated TypeScript types.

A simplified relationship may look like this:

```prisma
model UserGameEntry {
	id       String     @id @default(cuid())
	userId   String
	gameId   Int
	status   GameStatus
	rating   Float?
	favorite Boolean    @default(false)

	user User @relation(fields: [userId], references: [id])

	@@unique([userId, gameId])
}
```

The unique constraint ensures that one user cannot accidentally create several separate tracking entries for the same game.

## Why Redis

IGDB data does not need to be requested again every time a user opens a page.

Redis stores temporary results that can be reused across requests.

It is suited to this task because cached data can expire automatically.

```ts
const cachedGame = await redis.get(`game:${gameId}`);

if (cachedGame) {
	return JSON.parse(cachedGame);
}

const game = await fetchGameFromIgdb(gameId);

await redis.set(`game:${gameId}`, JSON.stringify(game), {
	EX: 60 * 60 * 24,
});

return game;
```

The permanent database remains focused on TrackGames-specific information.

Redis handles external data that can be retrieved again if necessary.

## Interface design

The interface is designed around game covers, clear statuses, and repeatable card layouts.

Game information should be recognizable quickly.

A user should be able to identify the title, cover, platform, status, and rating without opening every page.

Repeated components also help maintain consistency across the home page, search results, profiles, lists, and libraries.

[IMAGE: COMPARISON OF GAME CARDS]

*Suggested image: several GameCard variants shown beside each other. Include one from search, one from a library, and one from a custom list.*

Actions are placed close to the content they affect.

Tracking controls belong on the game page or game card.

List controls belong inside the list.

Profile customization belongs on the profile editor.

The interface avoids placing every possible action in the main navigation.

## Responsive design

TrackGames is intended to remain usable on desktop and mobile devices.

Desktop layouts can show multiple columns, side panels, larger media sections, and persistent filters.

Mobile layouts need simpler navigation and controls that do not depend on hovering.

Game cards resize or reduce their information based on available width.

Tables and wide statistics sections can scroll horizontally or switch to stacked layouts.

[IMAGE: MOBILE AND DESKTOP COMPARISON]

*Suggested image: a desktop screenshot and mobile screenshot of the same page placed side by side.*

The mobile version is not treated as a reduced copy of the desktop version.

Controls may move or collapse, but the same core features should remain available.

## Accessibility

Interactive elements use real buttons, links, inputs, labels, and headings.

Visual cards should not replace proper HTML structure.

Keyboard users need to be able to navigate dialogs, filters, menus, forms, and profile sections.

Text should remain readable when images fail to load or when a user increases the browser font size.

Status information should not rely only on color.

For example, a finished game should display a visible label in addition to its color treatment.

## The main design rule

The most important TrackGames design rule is that **personal tracking comes first**.

Social features, discovery sections, statistics, and reviews all build on the same library data.

A user should still receive a complete and useful experience without publishing anything.

At the same time, users who choose to make their activity public can use TrackGames as a profile, review space, recommendation list, and gaming record.

That balance defines the purpose of the application.

## Final overview

TrackGames combines several connected systems:

* a personal game library
* game statuses and progress tracking
* ratings and reviews
* custom ordered lists
* customizable profiles
* followers and activity feeds
* comments and notifications
* game discovery
* IGDB data retrieval
* caching and background updates
* personal statistics
* administration and application logging

Each feature supports the same central goal.

TrackGames gives users one place to keep a clear record of the games they play, how they felt about them, and which parts of that experience they want to share.
