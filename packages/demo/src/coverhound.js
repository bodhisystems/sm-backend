import 'babel-polyfill';
import fetch from 'node-fetch';

import sampleRequest from './requests/sample.json';
import sampleOneTypeRequest from './requests/sampleOneType.json';
import bareMinimumRequest from './requests/bareMinimum.json';
import bareMinimumOneCarrierRequest from './requests/bareMinimumOneCarrier.json';

const apiKey = '8ce9c639-17eb-496d-9cfa-e549a3e832b6';

const authorization = `Basic ${new Buffer('coverhound:coverhound').toString('base64')}`;

function areQuotesComplete(requestContent, quoteResponseContent) {
  const { data: { quotes } } = quoteResponseContent;
  console.log(quotes);
  return quotes && quotes.length === requestContent.carriers.length && quotes.every(q => q.status === 'success');
}

async function test(requestContent) {

  requestContent.api_key = apiKey;

  const initialResponse = await fetch('https://ps-partners.coverhound.us/api/home/v1/quotes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization,
    },
    body: JSON.stringify(requestContent),
  }).then(r => r.json());

  const url = `https://ps-partners.coverhound.us/api/home/v1/quotes/${initialResponse.data.id}?api_key=${apiKey}`;

  return new Promise((resolve, reject) => {

    const timer = setInterval(async () => {

      const quoteResponseContent = await fetch(url, {
        headers: {
          Authorization: authorization,
        },
      }).then(r => r.json());

      if (areQuotesComplete(requestContent, quoteResponseContent)) {
        clearInterval(timer);
        resolve(quoteResponseContent.data.quotes);
      }

    }, 1000);

  });
}

async function run() {
  const start = new Date().getTime();
  console.log(JSON.stringify(await test(bareMinimumOneCarrierRequest)));
  const end = new Date().getTime();
  console.log(1, end - start);
}

run();
