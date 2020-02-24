var path = require('path');

module.exports = {
  "extends": "airbnb",
  "plugins": ["import"],
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true
    }
  },
  /*
  "settings": {
    "import/resolver": {
      "webpack": {
        "config": path.join(__dirname, "..", "webpack", "webpack.config.dev-client.js")
      }
    }
  },
  */
  "rules": {
    "no-underscore-dangle": 0,
    "react/prop-types": 1,
    "no-console": 0,
    "max-len": [2, 120, 2, {
      ignoreUrls: true,
      ignoreComments: false
    }],
    "import/no-unresolved": 0,
  },
  "env": {
    "browser": true,
    "es6": true,
    "mocha": true
  }
}
