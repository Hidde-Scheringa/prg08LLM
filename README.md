Welcome Dungeon Master. You are making your first steps in becoming the best Dungeon Master you can be. I hope this webapplication will be helpfull in your future journeys.
But before you can begin experimenting you first need to get this webapp up and running.

First you download/clone this repo into your own editor.
When this is done you need to do a npm install in your terminal to add node package manager to your directtory.

This webapp uses a chat ai as the DnD party. Therefore you need a API key. You will need to enter the API key in a .env file wich already is in the git ignore.

your .env file should look like this:

AZURE_OPENAI_API_VERSION= your version 
AZURE_OPENAI_API_INSTANCE_NAME= Your instance name here
AZURE_OPENAI_API_KEY= your API key here
AZURE_OPENAI_API_DEPLOYMENT_NAME=deploy-gpt-35-turbo // youse your own deployment name
AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME=deploy-text-embedding-ada

When this is done you should run the server via the package.json in ther server folder, and the vite build in the directory package.json. 
And after this step you should be good to go.

Good luck with your adventures and create some great stories
