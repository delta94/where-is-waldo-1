# Where is Waldo

## What is it

This project is a web version of a british series of puzzle books called "[Where is Wally?](wiki)".

## How it works

The player start with a picture of characters they need to find. Once they have found all of them on the level they are shown the time it has taken them to do so. If the player has set a record they are prompted to add their name to the leaderboard.

+ There are six levels
+ One level can contain 1 to 4 characters to find

## Try it out

[Here](https://where-is-waldo-odin.web.app/) or [here](https://osechi3.github.io/where-is-waldo/)

## What I have gotten from it

### Skills practiced

+ Working with a server (Firebase)
+ Implementing MVC pattern
+ Writing tests after the app has been finished

### Tech learned

[x] Firebase
  [x] Firestore
  [x] Storage
  [x] Hosting
[x] Webpack
  + I created a [template](webpack-template) to speed up the process of installing packages

## App Structure

The app is divided into:

+ Controller
+ Model
+ View

### Controller

It controls both Controller and View executing their methods. The other components communicate with it via PubSub events.

### Model

It communicates with firebase server and stores fetched information

### View

It displays the information passed from Model through Controller and gets input from the user

The View components is divided into View.js and Message.js where the latter is responsible for displaying message (pop-up windows) to the user.

The app is also divided into two pages:

+ Main page (index.html)
+ Leaderboard page (leaderboard.html)

Leaderboard page has its own Component that communicates with the server and displays the data from it.

[wiki]: https://en.wikipedia.org/wiki/Where%27s_Wally%3F
[webpack-template]: https://github.com/osechi3/utilities/blob/master/template.md