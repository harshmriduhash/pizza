const isProduction = process.env.NODE_ENV === 'production';
const isIntegration = process.env.NODE_ENV === 'integration';

let botUrl;
if (isProduction) {
  botUrl = 'http://localhost:9000';
} else if (isIntegration) {
  botUrl = 'http://localhost:9001';
} else {
  botUrl = 'http://localhost:9002';
}

module.exports = {
  botUrl,
};
