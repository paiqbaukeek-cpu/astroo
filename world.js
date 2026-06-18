// ===== Ultra Super Kick Off - World Data =====
// Countries, leagues, clubs (typo-style fictional names), and per-nationality name pools.
// All names are fictional/typo variants. No real licensed data is stored.

// Per-nationality first/last name pools (small but flavorful).
const NAME_POOLS = {
  ENG: { first:['Harry','Jack','Mason','Phil','Declan','Bukky','Marcus','Jude','Cole','Reece','Ollie','Kyle'],
         last:['Kaine','Sterlong','Mountt','Fodenn','Ricee','Sakaa','Rashfird','Bellinghem','Palmar','Jamez','Wattkins','Trippir'] },
  ESP: { first:['Sergio','Pedri','Gavi','Alvaro','Dani','Marco','Mikel','Ferran','Rodri','Iago','Nico','Pablo'],
         last:['Ramoss','Gonzalaz','Torrez','Moratta','Olmoo','Asensiio','Merinno','Garcaa','Williiams','Fabin','Pinno','Sarabbia'] },
  ITA: { first:['Marco','Federico','Nicolo','Sandro','Gianluca','Lorenzo','Matteo','Alessandro','Giacomo','Bryan'],
         last:['Verattti','Chiesaa','Baarella','Tonalii','Scammacca','Insignne','Politanno','Bastonni','Raspadorii','Cristantte'] },
  GER: { first:['Joshua','Kai','Leroy','Jamal','Florian','Thomas','Serge','Niklas','Leon','Toni'],
         last:['Kimmichh','Haverz','Sannee','Musialla','Wirzt','Mullar','Gnabrry','Sulee','Goretzkka','Kroozz'] },
  FRA: { first:['Kylian','Antoine','Ousmane','Aurelien','Eduardo','Randal','Marcus','William','Theo','Jules'],
         last:['Mbappee','Griezmenn','Dembelle','Tchouameni','Camavingaa','Kolo-Muani','Thurram','Salibaa','Hernandes','Koundee'] },
  BRA: { first:['Vinicius','Rodrygo','Neymarr','Raphinha','Gabriel','Bruno','Endrick','Casemiro','Antony','Richarlison'],
         last:['Junio','Goess','Silvaa','Jesuz','Martinellii','Guimaraess','Magalhaess','Paqueta','Barbozza','Souzaa'] },
  IDN: { first:['Egy','Witan','Marselino','Rizky','Asnawi','Pratama','Rafael','Jordi','Sandy','Ramadhan','Marc','Ivar'],
         last:['Maulanaa','Sulaemann','Ferdinann','Ridho','Bahar','Walshh','Struickk','Amattt','Klokk','Hubnerr','Jenner','Idris'] },
  ARG: { first:['Lionel','Julian','Lautaro','Enzo','Alexis','Angel','Rodrigo','Nicolas','Giovani','Paulo'],
         last:['Messii','Alvarezz','Martinezz','Fernandezz','MacAllistr','DiMariaa','DePaull','Otamendii','LoCelsso','Dybalaa'] },
  POR: { first:['Cristiano','Bruno','Bernardo','Rafael','Joao','Ruben','Diogo','Vitinha','Goncalo','Pedro'],
         last:['Ronaldu','Fernandess','Silvaa','Leaoo','Felixx','Diass','Jotaa','Vitinhaa','Ramoss','Netoo'] },
  NED: { first:['Virgil','Frenkie','Cody','Memphis','Xavi','Denzel','Nathan','Tijjani','Donyell','Wout'],
         last:['vanDjik','deJonng','Gakpoo','Depayy','Simonss','Dumfriess','Akee','Reijndrs','Malenn','Weghorzt'] },
  MEX: { first:['Hirving','Edson','Raul','Santiago','Cesar','Luis','Orbelin','Alexis','Diego','Carlos'],
         last:['Lozanno','Alvarezz','Jimenezz','Gimenezz','Montess','Romoo','Pinedaa','Vegaa','Lainezz','Rodriguezz'] },
  NGA: { first:['Victor','Samuel','Ademola','Kelechi','Wilfred','Alex','Joe','Calvin','Moses','Frank'],
         last:['Osimhenn','Chukwuezz','Lookmann','Iheanachoo','Ndidii','Iwobii','Arobaa','Bassey','Simonn','Onyekaa'] },
  EGY: { first:['Mohamed','Omar','Mostafa','Ahmed','Trezeguet','Ramadan','Mahmoud','Amr','Sayed','Karim'],
         last:['Salahh','Marmoushh','Mohamadd','Hegazii','Trezeget','Sobhii','Hassann','Warddaa','Elneny','Fattouhh'] }
};

// Clubs are grouped by league. Names are intentionally one-letter-off typos of famous clubs.
// rating: base strength used to generate squad. tier: 1 = top division.
const LEAGUES = [
  { id:'eng1', country:'ENG', name:'Liga Primer Inggriss', tier:1, clubs:[
    {name:'Manchster City',rating:88},{name:'Arsenall',rating:86},{name:'Liverpoool',rating:86},
    {name:'Manchster Untied',rating:82},{name:'Chelseaa',rating:82},{name:'Tottenhem',rating:81},
    {name:'Newcastel',rating:80},{name:'Aston Vila',rating:79},{name:'Brightonn',rating:77},
    {name:'West Hamm',rating:76},{name:'Evertonn',rating:74},{name:'Fulhamm',rating:73},
    {name:'Brentfird',rating:73},{name:'Crystal Palce',rating:74},{name:'Wolvess',rating:73},
    {name:'Nottinghem',rating:72},{name:'Bournmouth',rating:72},{name:'Leicistr',rating:71},
    {name:'Ipswhich',rating:69},{name:'Southamptn',rating:69}
  ]},
  { id:'esp1', country:'ESP', name:'La Ligaa', tier:1, clubs:[
    {name:'Reall Madird',rating:89},{name:'Barcelonna',rating:87},{name:'Atletco Madird',rating:84},
    {name:'Athletc Bilba',rating:80},{name:'Girnona',rating:79},{name:'Real Sociadad',rating:79},
    {name:'Real Betiss',rating:77},{name:'Villarrael',rating:77},{name:'Valancia',rating:75},
    {name:'Sevila',rating:76},{name:'Getafee',rating:73},{name:'Osasunna',rating:73},
    {name:'Celto Vigo',rating:73},{name:'Mallorka',rating:72},{name:'Rayoo Vallecano',rating:72},
    {name:'Las Palmass',rating:71},{name:'Espanyool',rating:71},{name:'Leganees',rating:70},
    {name:'Vallodolid',rating:69},{name:'Alavess',rating:71}
  ]},
  { id:'ita1', country:'ITA', name:'Serie Aa', tier:1, clubs:[
    {name:'Internazionalee',rating:87},{name:'Juvuntus',rating:84},{name:'AC Millan',rating:84},
    {name:'Napolii',rating:84},{name:'Atalantaa',rating:83},{name:'AS Romma',rating:80},
    {name:'Laziio',rating:80},{name:'Fiorintina',rating:78},{name:'Bolognaa',rating:78},
    {name:'Torrino',rating:75},{name:'Udinesse',rating:73},{name:'Genooa',rating:72},
    {name:'Monzaa',rating:72},{name:'Veronna',rating:71},{name:'Cagliarii',rating:71},
    {name:'Lecceee',rating:70},{name:'Empolii',rating:71},{name:'Parmma',rating:71},
    {name:'Comoo',rating:70},{name:'Venezzia',rating:69}
  ]},
  { id:'ger1', country:'GER', name:'Bundesligaa', tier:1, clubs:[
    {name:'Bayren Munchen',rating:88},{name:'Bayer Leverkussen',rating:86},{name:'RB Leibzig',rating:83},
    {name:'Borussa Dortmund',rating:83},{name:'Eintrcht Frankfurt',rating:79},{name:'Stuttgartt',rating:79},
    {name:'Freibrg',rating:76},{name:'Hoffenhaim',rating:75},{name:'Wolfsbrg',rating:75},
    {name:'Werdr Bremen',rating:74},{name:'Borussa Mgladbach',rating:74},{name:'Mainnz',rating:73},
    {name:'Augzburg',rating:73},{name:'Union Berln',rating:74},{name:'St Paulii',rating:71},
    {name:'Bochumm',rating:70},{name:'Heidnheim',rating:71},{name:'Holstain Kiel',rating:69}
  ]},
  { id:'fra1', country:'FRA', name:'Ligue Unn', tier:1, clubs:[
    {name:'Paríss SG',rating:87},{name:'Monacco',rating:81},{name:'Marsaille',rating:81},
    {name:'Lillle',rating:79},{name:'Lyonn',rating:78},{name:'Nicee',rating:77},
    {name:'Lenss',rating:77},{name:'Rennees',rating:76},{name:'Strasbrg',rating:74},
    {name:'Brestt',rating:74},{name:'Toulousse',rating:73},{name:'Nantess',rating:72},
    {name:'Montpelier',rating:72},{name:'Reimss',rating:72},{name:'Auxerree',rating:71},
    {name:'Le Havrre',rating:70},{name:'Angerss',rating:70},{name:'St Etiennne',rating:70}
  ]},
  { id:'idn1', country:'IDN', name:'Liga Satuu Indonesia', tier:1, clubs:[
    {name:'Persijaa Jakarta',rating:74},{name:'Persibb Bandung',rating:75},{name:'Persebayaa',rating:74},
    {name:'Arema FCC',rating:73},{name:'Bali Untied',rating:76},{name:'PSM Makassaar',rating:73},
    {name:'Persipuraa',rating:72},{name:'Borneoo FC',rating:74},{name:'Madura Untied',rating:72},
    {name:'PSIS Semarrang',rating:71},{name:'Bhayangkaraa',rating:71},{name:'Persikk',rating:70},
    {name:'Dewa Untied',rating:71},{name:'Persitaa',rating:70},{name:'Barito Puteraa',rating:70},
    {name:'PSS Slemann',rating:71},{name:'Malut Untied',rating:69},{name:'Semen Padangg',rating:69}
  ]},
  { id:'bra1', country:'BRA', name:'Brasileiraoo', tier:1, clubs:[
    {name:'Palmeirass',rating:82},{name:'Flamenggo',rating:83},{name:'Botafoggo',rating:80},
    {name:'Fluminensse',rating:78},{name:'Sao Pauloo',rating:78},{name:'Corinthianns',rating:77},
    {name:'Gremioo',rating:77},{name:'Internacionall',rating:77},{name:'Atletco Mineiroo',rating:78},
    {name:'Cruzeiroo',rating:75},{name:'Vasco da Gamaa',rating:74},{name:'Santoss',rating:75},
    {name:'Bahiaa',rating:74},{name:'Fortalezaa',rating:74},{name:'Bragantinoo',rating:74},
    {name:'Cuiabaa',rating:71},{name:'Juventudee',rating:70},{name:'Vitoriaa',rating:71}
  ]},
  { id:'arg1', country:'ARG', name:'Liga Profesionall', tier:1, clubs:[
    {name:'River Platte',rating:81},{name:'Boca Juniorrs',rating:80},{name:'Racingg Club',rating:78},
    {name:'Independientte',rating:76},{name:'San Lorenzoo',rating:75},{name:'Velezz Sarsfield',rating:76},
    {name:'Estudiantess',rating:75},{name:'Talleress',rating:76},{name:'Lanuss',rating:73},
    {name:'Defensa y Justicaa',rating:73},{name:'Rosario Centrall',rating:74},{name:'Newellss',rating:73},
    {name:'Argentinos Jrs',rating:73},{name:'Huracann',rating:72},{name:'Godoy Cruzz',rating:72},
    {name:'Banfieldd',rating:71},{name:'Gimnasiaa',rating:71},{name:'Platensee',rating:70}
  ]},
  { id:'mex1', country:'MEX', name:'Liga MEXX', tier:1, clubs:[
    {name:'America Clubb',rating:79},{name:'Monterreyy',rating:79},{name:'Tigres UANLL',rating:79},
    {name:'Guadalajaraa',rating:76},{name:'Cruz Azull',rating:77},{name:'Pumas UNAMM',rating:75},
    {name:'Toluccaa',rating:76},{name:'Pachucaa',rating:76},{name:'Leonn',rating:74},
    {name:'Santos Lagunaa',rating:74},{name:'Tijuanaa',rating:73},{name:'Atlass',rating:73},
    {name:'Pueblaa',rating:71},{name:'Necaxaa',rating:71},{name:'Queretaroo',rating:70},
    {name:'Mazatlann',rating:70},{name:'San Luiss',rating:71},{name:'Juarezz',rating:70}
  ]},
  { id:'caf1', country:'NGA', name:'Liga Afrikaa Elite', tier:1, clubs:[
    {name:'Al Ahlyy',rating:78},{name:'Zamalekk',rating:76},{name:'Wydad Casaa',rating:76},
    {name:'Raja Casaa',rating:75},{name:'Esperancee',rating:75},{name:'Mamelodi Sundownns',rating:78},
    {name:'Enyimbaa',rating:72},{name:'Kaizer Chiefss',rating:73},{name:'Orlando Piratess',rating:74},
    {name:'TP Mazembee',rating:75},{name:'Petro Luandaa',rating:72},{name:'Simba SCC',rating:73},
    {name:'Young Africanss',rating:73},{name:'ASEC Mimosass',rating:71},{name:'Hearts of Oakk',rating:70},
    {name:'Sundownss B',rating:70},{name:'CR Belouizdadd',rating:72},{name:'USM Algerr',rating:71}
  ]}
];

// National teams for international tournaments (World Cup, continental).
const NATIONS = [
  { code:'ENG', name:'Inggriss', conf:'EUR', rating:86 },
  { code:'ESP', name:'Spanyoll', conf:'EUR', rating:87 },
  { code:'ITA', name:'Italiaa', conf:'EUR', rating:84 },
  { code:'GER', name:'Jermann', conf:'EUR', rating:85 },
  { code:'FRA', name:'Prancizz', conf:'EUR', rating:88 },
  { code:'POR', name:'Portugall', conf:'EUR', rating:84 },
  { code:'NED', name:'Belandaa', conf:'EUR', rating:83 },
  { code:'BRA', name:'Brasill', conf:'SAM', rating:86 },
  { code:'ARG', name:'Argentnia', conf:'SAM', rating:88 },
  { code:'IDN', name:'Indonesa', conf:'ASI', rating:68 },
  { code:'MEX', name:'Meksikoo', conf:'NAM', rating:78 },
  { code:'NGA', name:'Nigeriaa', conf:'AFR', rating:78 },
  { code:'EGY', name:'Mesirr', conf:'AFR', rating:76 },
  // filler nations so each confederation tournament has enough teams
  { code:'USA', name:'Amerikaa', conf:'NAM', rating:75 },
  { code:'CAN', name:'Kanadaa', conf:'NAM', rating:73 },
  { code:'CRC', name:'Kosta Rikaa', conf:'NAM', rating:71 },
  { code:'MAR', name:'Marokoo', conf:'AFR', rating:80 },
  { code:'SEN', name:'Senegall', conf:'AFR', rating:79 },
  { code:'URU', name:'Uruguaii', conf:'SAM', rating:82 },
  { code:'COL', name:'Kolombiaa', conf:'SAM', rating:81 },
  { code:'JPN', name:'Jepanng', conf:'ASI', rating:79 },
  { code:'KOR', name:'Korea Selatann', conf:'ASI', rating:78 },
  { code:'BEL', name:'Belgiaa', conf:'EUR', rating:84 },
  { code:'CRO', name:'Kroasiaa', conf:'EUR', rating:82 }
];

// Continental cup config: which leagues feed it and how many qualify per league.
const CONTINENTAL = {
  id:'ucl', name:'Liga Champonss Eropa',
  leagues:['eng1','esp1','ita1','ger1','fra1'], perLeague:4
};
const CONTINENTAL_ASIA = {
  id:'acl', name:'Liga Champonss Asia',
  leagues:['idn1'], perLeague:4
};
