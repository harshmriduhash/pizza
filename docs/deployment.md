Server setup:
https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-14-04

https://www.digitalocean.com/community/tutorials/additional-recommended-steps-for-new-ubuntu-14-04-servers

http://stackoverflow.com/questions/413807/is-there-a-way-for-non-root-processes-to-bind-to-privileged-ports-1024-on-l

Deployment stategy:

1. Install nvm and pre-reqs

  sudo apt-get install build-essential checkinstall

  sudo apt-get install libssl-dev

  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash

  open/close terminal

  command -v nvm

  nvm install 6.2

  nvm use 6.2

  nvm alias default node

2. Install postgres and create a db

  sudo apt-get install postgresql postgresql-contrib

  sudo -i -u postgres

  createuser --pwprompt nice_johnbot

  createdb -Onice_johnbot -Eutf8 johnbot_db

  exit

3. Install git and clone the repository

  sudo apt-get install git

  git clone https://github.com/johnhforrest/react-stripe-checkout.git

  git clone https://github.com/johnhforrest/hungrybot.git

  use github creds

  cd hungrybot

  npm install

4. Copy SSL keys over (for both INT and PROD)

  cd ..

  mkdir resources

  (copy key, cert, and bundle from local machine)

5. Configure firewall rules

  sudo ufw allow 443/tcp

  sudo ufw allow 8080/tcp

  sudo ufw allow 8478/tcp

  TODO: add the port numbers for bot localhost communication (9000, 9001)

6. Configure nginx

  https://www.digitalocean.com/community/tutorials/how-to-redirect-www-to-non-www-with-nginx-on-ubuntu-14-04

  http://stackoverflow.com/questions/5009324/node-js-nginx-what-now

7. Build and deployment

  npm install -g forever

  npm run build_twitchbot_prod

  npm run build_server_prod

  npm run start_twitchbot_prod

  npm run start_server_prod
