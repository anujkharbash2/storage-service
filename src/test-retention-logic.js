// Unit-test the date-filtering logic in isolation, without touching real storage
const RETENTION_DAYS = 60;

function isExpired(createdAtISO) {
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return new Date(createdAtISO).getTime() < cutoff;
}

const testCases = [
  { label: '90 days old', date: new Date(Date.now() - 90 * 86400000).toISOString(), expected: true },
  { label: '30 days old', date: new Date(Date.now() - 30 * 86400000).toISOString(), expected: false },
  { label: '61 days old', date: new Date(Date.now() - 61 * 86400000).toISOString(), expected: true },
  { label: '59 days old', date: new Date(Date.now() - 59 * 86400000).toISOString(), expected: false },
];

for (const tc of testCases) {
  const result = isExpired(tc.date);
  console.log(`${tc.label}: expired=${result}, expected=${tc.expected}, ${result === tc.expected ? 'PASS' : 'FAIL'}`);
}