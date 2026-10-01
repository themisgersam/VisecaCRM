// Mock data for the card-management CRM. All data is fictional.
const ISSUERS = {
  Manor:   { color: "#1f4e9c", tint: "#e8effa", tagline: "Manor Bank Cards" },
  Valiant: { color: "#8a1c2b", tint: "#f9e9eb", tagline: "Valiant Bank Cards" },
  Viesca:  { color: "#0b7a5c", tint: "#e4f5ef", tagline: "Viesca Bank Cards" },
  Cumulus: { color: "#5b3fb5", tint: "#eee9fa", tagline: "Cumulus Bank Cards" },
};

const CUSTOMERS = [
  {
    id: "C-1001", name: "Aisha Rahman", phone: "+971501234567", email: "aisha.rahman@example.com",
    dob: "1988-04-12", city: "Dubai", segment: "Premium", since: "2016-03-02", language: "English / Arabic",
    cards: [
      { issuer: "Manor", product: "Manor Platinum Credit", network: "Visa", last4: "4821", type: "Credit", status: "Active", limit: 60000, balance: 18420.5, due: 2200, dueDate: "2026-10-18", expiry: "09/29", rewards: "24,300 pts" },
      { issuer: "Valiant", product: "Valiant Gold Credit", network: "Mastercard", last4: "7710", type: "Credit", status: "Active", limit: 25000, balance: 3150, due: 315, dueDate: "2026-10-22", expiry: "03/28", rewards: "6,120 miles" },
      { issuer: "Cumulus", product: "Cumulus Travel Card", network: "Visa", last4: "9033", type: "Prepaid", status: "Blocked", limit: 10000, balance: 1200, due: 0, dueDate: null, expiry: "11/27", rewards: "—" },
    ],
  },
  {
    id: "C-1002", name: "Omar Haddad", phone: "+971502345678", email: "omar.haddad@example.com",
    dob: "1979-11-30", city: "Abu Dhabi", segment: "Standard", since: "2019-07-19", language: "Arabic",
    cards: [
      { issuer: "Manor", product: "Manor Classic Debit", network: "Visa", last4: "1156", type: "Debit", status: "Active", limit: 15000, balance: 0, due: 0, dueDate: null, expiry: "06/28", rewards: "—" },
      { issuer: "Manor", product: "Manor Cashback Credit", network: "Mastercard", last4: "3394", type: "Credit", status: "Active", limit: 20000, balance: 8740, due: 874, dueDate: "2026-10-12", expiry: "01/29", rewards: "AED 312 cashback" },
    ],
  },
  {
    id: "C-1003", name: "Priya Nair", phone: "+971503456789", email: "priya.nair@example.com",
    dob: "1992-02-08", city: "Sharjah", segment: "Standard", since: "2021-01-15", language: "English / Hindi",
    cards: [
      { issuer: "Valiant", product: "Valiant Platinum Credit", network: "Visa", last4: "6602", type: "Credit", status: "Active", limit: 40000, balance: 27800, due: 2780, dueDate: "2026-10-09", expiry: "08/28", rewards: "15,900 pts" },
      { issuer: "Viesca", product: "Viesca Everyday Credit", network: "Mastercard", last4: "2278", type: "Credit", status: "Expired", limit: 12000, balance: 0, due: 0, dueDate: null, expiry: "08/26", rewards: "—" },
    ],
  },
  {
    id: "C-1004", name: "Liam Carter", phone: "+971504567890", email: "liam.carter@example.com",
    dob: "1985-09-21", city: "Dubai", segment: "Premium", since: "2014-05-27", language: "English",
    cards: [
      { issuer: "Viesca", product: "Viesca Signature Credit", network: "Visa", last4: "5540", type: "Credit", status: "Active", limit: 90000, balance: 41200, due: 4120, dueDate: "2026-10-15", expiry: "12/29", rewards: "58,400 pts" },
    ],
  },
  {
    id: "C-1005", name: "Fatima Al Zaabi", phone: "+971505678901", email: "fatima.alzaabi@example.com",
    dob: "1995-06-17", city: "Al Ain", segment: "Standard", since: "2022-10-04", language: "Arabic / English",
    cards: [
      { issuer: "Cumulus", product: "Cumulus Rewards Credit", network: "Mastercard", last4: "8815", type: "Credit", status: "Active", limit: 18000, balance: 2100, due: 210, dueDate: "2026-10-25", expiry: "05/28", rewards: "3,450 pts" },
    ],
  },
  {
    id: "C-1006", name: "Daniel Moreau", phone: "+971506789012", email: "daniel.moreau@example.com",
    dob: "1976-12-03", city: "Dubai", segment: "Private", since: "2011-08-09", language: "English / French",
    cards: [
      { issuer: "Manor", product: "Manor Infinite Credit", network: "Visa", last4: "0007", type: "Credit", status: "Active", limit: 250000, balance: 96500, due: 9650, dueDate: "2026-10-20", expiry: "04/30", rewards: "212,000 pts" },
      { issuer: "Valiant", product: "Valiant Black Credit", network: "Mastercard", last4: "1919", type: "Credit", status: "Active", limit: 180000, balance: 22300, due: 2230, dueDate: "2026-10-14", expiry: "10/29", rewards: "88,750 miles" },
      { issuer: "Viesca", product: "Viesca Business Debit", network: "Visa", last4: "3042", type: "Debit", status: "Active", limit: 50000, balance: 0, due: 0, dueDate: null, expiry: "02/28", rewards: "—" },
      { issuer: "Cumulus", product: "Cumulus Elite Credit", network: "Mastercard", last4: "6276", type: "Credit", status: "Pending activation", limit: 100000, balance: 0, due: 0, dueDate: null, expiry: "09/31", rewards: "—" },
    ],
  },
  {
    id: "C-1007", name: "Sara Khan", phone: "+971507890123", email: "sara.khan@example.com",
    dob: "1990-03-25", city: "Ajman", segment: "Standard", since: "2020-12-12", language: "English / Urdu",
    cards: [
      { issuer: "Manor", product: "Manor Gold Credit", network: "Visa", last4: "9284", type: "Credit", status: "Active", limit: 22000, balance: 14900, due: 1490, dueDate: "2026-10-05", expiry: "07/28", rewards: "9,800 pts" },
      { issuer: "Cumulus", product: "Cumulus Student Prepaid", network: "Visa", last4: "4467", type: "Prepaid", status: "Active", limit: 5000, balance: 640, due: 0, dueDate: null, expiry: "03/27", rewards: "—" },
    ],
  },
  {
    id: "C-1008", name: "Yusuf Ibrahim", phone: "+971508901234", email: "yusuf.ibrahim@example.com",
    dob: "1983-07-14", city: "Ras Al Khaimah", segment: "Standard", since: "2018-02-20", language: "Arabic",
    cards: [
      { issuer: "Valiant", product: "Valiant Classic Credit", network: "Visa", last4: "3381", type: "Credit", status: "Active", limit: 15000, balance: 15400, due: 2400, dueDate: "2026-09-28", expiry: "11/28", rewards: "1,200 pts" },
    ],
  },
];

// Seed interactions. `daysAgo` / `hour` are converted to real timestamps at load time.
const SEED_INTERACTIONS = [
  { phone: "+971501234567", issuer: "Manor",   channel: "Voice",    reason: "Statement query",       outcome: "Resolved",  agent: "Nadia S.",  daysAgo: 3,  hour: 11, notes: "Customer asked about a duplicate charge of AED 189 at a restaurant. Raised dispute DSP-20931." },
  { phone: "+971501234567", issuer: "Manor",   channel: "Chat",     reason: "Credit limit increase", outcome: "Escalated", agent: "Karim A.",  daysAgo: 12, hour: 15, notes: "Requested limit increase to AED 80,000. Escalated to credit team." },
  { phone: "+971501234567", issuer: "Valiant", channel: "Voice",    reason: "Payment arrangement",   outcome: "Resolved",  agent: "Rami T.",   daysAgo: 6,  hour: 9,  notes: "Set up standing instruction for minimum due." },
  { phone: "+971501234567", issuer: "Cumulus", channel: "Voice",    reason: "Block card",            outcome: "Resolved",  agent: "Lina M.",   daysAgo: 20, hour: 18, notes: "Card reported lost while travelling. Blocked; replacement not requested yet." },
  { phone: "+971502345678", issuer: "Manor",   channel: "Voice",    reason: "PIN reset",             outcome: "Resolved",  agent: "Nadia S.",  daysAgo: 1,  hour: 10, notes: "Debit card PIN reset via IVR hand-off." },
  { phone: "+971502345678", issuer: "Manor",   channel: "Email",    reason: "Cashback query",        outcome: "Resolved",  agent: "Karim A.",  daysAgo: 25, hour: 13, notes: "Explained cashback cap of AED 500/month." },
  { phone: "+971503456789", issuer: "Valiant", channel: "Voice",    reason: "Late fee waiver",       outcome: "Pending",   agent: "Rami T.",   daysAgo: 4,  hour: 16, notes: "Requested waiver of AED 250 late fee. Awaiting supervisor approval." },
  { phone: "+971503456789", issuer: "Viesca",  channel: "WhatsApp", reason: "Card renewal",          outcome: "Pending",   agent: "Hind B.",   daysAgo: 9,  hour: 12, notes: "Card expired Aug 2026. Customer unsure if renewal is wanted." },
  { phone: "+971504567890", issuer: "Viesca",  channel: "Chat",     reason: "Travel notice",         outcome: "Resolved",  agent: "Hind B.",   daysAgo: 2,  hour: 8,  notes: "Travelling to UK 10-20 Oct. Travel flag added." },
  { phone: "+971505678901", issuer: "Cumulus", channel: "Voice",    reason: "Activate card",         outcome: "Resolved",  agent: "Lina M.",   daysAgo: 30, hour: 14, notes: "New card activated after identity verification." },
  { phone: "+971506789012", issuer: "Manor",   channel: "Voice",    reason: "Reward redemption",     outcome: "Resolved",  agent: "Nadia S.",  daysAgo: 5,  hour: 17, notes: "Redeemed 40,000 pts for statement credit." },
  { phone: "+971506789012", issuer: "Cumulus", channel: "Voice",    reason: "Activate card",         outcome: "Follow-up", agent: "Lina M.",   daysAgo: 1,  hour: 19, notes: "Failed OTP twice. Customer to call back from registered mobile." },
  { phone: "+971506789012", issuer: "Valiant", channel: "Email",    reason: "Fee dispute",           outcome: "Resolved",  agent: "Rami T.",   daysAgo: 14, hour: 10, notes: "Annual fee reversed as a goodwill gesture." },
  { phone: "+971507890123", issuer: "Manor",   channel: "Voice",    reason: "Payment due date",      outcome: "Resolved",  agent: "Karim A.",  daysAgo: 2,  hour: 12, notes: "Customer wants due date moved to the 20th. Requested; effective next cycle." },
  { phone: "+971508901234", issuer: "Valiant", channel: "Voice",    reason: "Over-limit",            outcome: "Follow-up", agent: "Rami T.",   daysAgo: 1,  hour: 14, notes: "Account over limit and payment overdue. Promised payment by Friday." },
];
