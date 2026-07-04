require('dotenv').config();
const { storeRawHtml, getRawHtml } = require('./rawHtmlArchive');

(async () => {
  const fakeRequestId = `test_${Date.now()}`;
  const fakeHtml = '<html><body><h1>Test page from Team 1</h1></body></html>';

  const stored = await storeRawHtml(fakeRequestId, fakeHtml);
  console.log('Store result:', stored);

  const retrieved = await getRawHtml(fakeRequestId);
  console.log('Retrieve result:', retrieved);

  console.log('Match:', retrieved.html === fakeHtml);
})();