# Welcome to Hungrybot!

See the docs in /docs

## Development process

### v1 (current production code, soon to be legacy)

- At this point, this branch is mainly for bugfixes and small features to tweak things for user growth
- Local development branches should have origin/v1 as their upstream
- After locally doing the dev/test work, push to origin/v1
- When you are ready to deploy these changes to production, create a Pull Request to merge them into the prod branch
- Pull Requests into the prod branch require sign off from one other developer
- After getting sign off, merge your changes and then redeploy production
- After deploying production, validate that production is back up and your code is stable

### v2 (dashboard code)

- Local development branches should have origin/master as their upstream
- Once your local changes are stable, push into origin/master
- Since this branch is still in active development, feel free to immediately merge your changes to the int branch if you wish to test them on digitalocean (i.e., a real deployment)

## Setting it up for the first time
``createdb -Onice_johnbot -Eutf8 dev_johnbot_db``

``npm run sequelize db:migrate``

## Building locally (it should be done in this order since run:dev actually lints, transpiles, and bundles):
``npm run run:dev``

``npm run run:twitchbot:dev``

## Building in INT:
``npm run build:int``

``npm run forever:int``

``npm run forever:int:twitchbot``
