// data.js
const STORAGE = 'biowastex_data_v2';
const SESSION = 'biowastex_session';

function seedData(){
  const seed = {
    categories: ['organic','plastic','paper','glass','metal','hazard'],
    tips: [
      {id:1, title:'Compost organics', text:'Kitchen scraps and yard waste are ideal for home composting.'},
      {id:2, title:'Rinse plastics', text:'Rinse containers before recycling to avoid contamination.'},
      {id:3, title:'Keep paper dry', text:'Do not mix greasy paper with recyclables.'}
    ],
    submissions: [
      {id:101, username:'demoUser', name:'Suresh', phone:'9876543210', address:'Ward 5', waste_type:'organic', quantity:2.5, preferred_date:'2025-11-05', status:'pending', created_at:new Date().toISOString()},
    ],
    users: [
      // optional seeded admin account
      {username:'admin', password:'admin123', role:'admin'},
      {username:'demoUser', password:'user123', role:'user'}
    ]
  };
  localStorage.setItem(STORAGE, JSON.stringify(seed));
  return seed;
}

function readStore(){
  const raw = localStorage.getItem(STORAGE);
  if(!raw) return seedData();
  try { return JSON.parse(raw); } catch(e){ return seedData(); }
}
function saveStore(obj){ localStorage.setItem(STORAGE, JSON.stringify(obj)); }

function saveSession(user){ localStorage.setItem(SESSION, JSON.stringify(user)); }
function readSession(){ return JSON.parse(localStorage.getItem(SESSION) || 'null'); }
function clearSession(){ localStorage.removeItem(SESSION); }
