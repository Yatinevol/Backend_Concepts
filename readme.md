1. Initialize node package manager in the folder.
cmd : npm init.

2. make repo on github and commit all setting up files on the repo.

3. always first load your .env file using dotenv 
this is the correct syntax but we can improve this.
require('dotenv').config({path:'./env'})

to enable this import syntax of dotenv in index.js we have to run a command and that command we have added in script(in package.json) of this file using experimental feature.

it is told to us in the documentation.
 You can use the --require (-r) command line option to preload dotenv. By doing this, you do not need to require and load dotenv in your application code.