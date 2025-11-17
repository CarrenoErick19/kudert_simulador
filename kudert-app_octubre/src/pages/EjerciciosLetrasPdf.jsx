// Archivo de ejercicios estáticos clasificados por dificultad

// Este archivo NO modifica la lógica del simulador. Únicamente expone

// listas de ejercicios para que el simulador los consuma cuando corresponda.



const ejerciciosFacil = [

  {

    id: 1,

    sucesion: "ACEGIKM",

    opciones: ["S", "A", "P", "O"],

    respuesta: "O",

    explicacion: "+2 constante"

  },

  {

    id: 2,

    sucesion: "BDFHJLN",

    opciones: ["O", "P", "Q", "R"],

    respuesta: "P",

    explicacion: "+2 constante"

  },

  {

    id: 3,

    sucesion: "ZXVTRP",

    opciones: ["O", "N", "M", "L"],

    respuesta: "N",

    explicacion: "-2 constante"

  },

  {

    id: 4,

    sucesion: "UOIAUOIEUOI",

    opciones: ["D", "E", "A", "C", "I"],

    respuesta: "I",

    explicacion: "Patrón repetido UOI + vocales"

  },

  {

    id: 5,

    sucesion: "AEIAEIOEI",

    opciones: ["A", "E", "I", "O"],

    respuesta: "I",

    explicacion: "Patrón AEI repetido"

  },

  {

    id: 6,

    sucesion: "IOEIOEAOE",

    opciones: ["A", "E", "I", "O"],

    respuesta: "A",

    explicacion: "Patrón IOE repetido"

  },

  {

    id: 7,

    sucesion: "QNJF",

    opciones: ["S", "A", "P", "B"],

    respuesta: "B",

    explicacion: "-4 constante"

  },

  {

    id: 8,

    sucesion: "ZWTQ",

    opciones: ["N", "M", "L", "K"],

    respuesta: "N",

    explicacion: "-3 constante"

  },

  {

    id: 9,

    sucesion: "WZCFI",

    opciones: ["K", "L", "M", "J"],

    respuesta: "L",

    explicacion: "+3 constante"

  },

  {

    id: 10,

    sucesion: "XADG",

    opciones: ["J", "K", "L", "M"],

    respuesta: "J",

    explicacion: "+3 constante"

  },

  {

    id: 11,

    sucesion: "YBEH",

    opciones: ["K", "L", "M", "N"],

    respuesta: "K",

    explicacion: "+3 constante"

  },

  {

    id: 12,

    sucesion: "XTPL",

    opciones: ["F", "I", "G", "H"],

    respuesta: "H",

    explicacion: "-4 constante"

  },

  {

    id: 13,

    sucesion: "WSOK",

    opciones: ["G", "H", "I", "J"],

    respuesta: "G",

    explicacion: "-4 constante"

  },

  {

    id: 14,

    sucesion: "VRNJ",

    opciones: ["F", "G", "H", "I"],

    respuesta: "F",

    explicacion: "-4 constante"

  },

  {

    id: 15,

    sucesion: "OMAU MAAM A",

    opciones: ["D", "E", "A", "C"],

    respuesta: "E",

    explicacion: "Separar MA + vocales"

  },

  {

    id: 16,

    sucesion: "IPEOPEEPE",

    opciones: ["A", "E", "I", "O"],

    respuesta: "I",

    explicacion: "Separar PE + vocales"

  },

  {

    id: 17,

    sucesion: "ANUENUINU",

    opciones: ["O", "A", "E", "I"],

    respuesta: "O",

    explicacion: "Separar NU + vocales"

  }

];



const ejerciciosMedio = [

  {

    id: 18,

    sucesion: "DKQ",

    opciones: ["S", "A", "P", "X"],

    respuesta: "X",

    explicacion: "+7 constante"

  },

  {

    id: 19,

    sucesion: "FMT",

    opciones: ["A", "B", "C", "D"],

    respuesta: "A",

    explicacion: "+7 con reinicio"

  },

  {

    id: 20,

    sucesion: "ELS",

    opciones: ["X", "Y", "Z", "A"],

    respuesta: "Z",

    explicacion: "+7 constante"

  },

  {

    id: 21,

    sucesion: "EFGPQRHIJ",

    opciones: ["S", "A", "P", "STU"],

    respuesta: "STU",

    explicacion: "Tríos consecutivos"

  },

  {

    id: 22,

    sucesion: "BCDHIJKLMN",

    opciones: ["O", "P", "Q", "R"],

    respuesta: "R",

    explicacion: "Tríos consecutivos"

  },

  {

    id: 23,

    sucesion: "XYZDEFGHI",

    opciones: ["J", "K", "L", "M"],

    respuesta: "J",

    explicacion: "Tríos consecutivos"

  },

  {

    id: 24,

    sucesion: "AOERIU",

    opciones: ["MV", "AD", "NJ", "MX"],

    respuesta: "MX",

    explicacion: "Doble serie alternada"

  },

  {

    id: 25,

    sucesion: "BNFJJN",

    opciones: ["MR", "NS", "MT", "NU"],

    respuesta: "NS",

    explicacion: "Variación +4"

  },

  {

    id: 26,

    sucesion: "CPGOKS",

    opciones: ["OW", "PW", "OX", "PX"],

    respuesta: "OW",

    explicacion: "+4 con quiebre"

  },

  {

    id: 27,

    sucesion: "BEGJLOQ",

    opciones: ["S", "A", "P", "T"],

    respuesta: "T",

    explicacion: "+3 +2 alternado"

  },

  {

    id: 28,

    sucesion: "CFHKMP",

    opciones: ["R", "S", "T", "U"],

    respuesta: "R",

    explicacion: "+3 +2 alternado"

  },

  {

    id: 29,

    sucesion: "DGILNQ",

    opciones: ["S", "T", "U", "V"],

    respuesta: "S",

    explicacion: "+3 +2 alternado"

  },

  {

    id: 30,

    sucesion: "ehjmo",

    opciones: ["L", "S", "F", "R"],

    respuesta: "R",

    explicacion: "+3 +2 alternado"

  },

  {

    id: 31,

    sucesion: "fiknp",

    opciones: ["s", "r", "q", "t"],

    respuesta: "s",

    explicacion: "+3 +2 alternado"

  },

  {

    id: 32,

    sucesion: "gjloq",

    opciones: ["t", "s", "r", "u"],

    respuesta: "t",

    explicacion: "+3 +2 alternado"

  },

  {

    id: 33,

    sucesion: "ACFHK",

    opciones: ["N", "J", "M", "K"],

    respuesta: "M",

    explicacion: "+2 +3 alternado"

  },

  {

    id: 34,

    sucesion: "BDGIL",

    opciones: ["N", "O", "P", "Q"],

    respuesta: "N",

    explicacion: "+2 +3 alternado"

  },

  {

    id: 35,

    sucesion: "DFIKN",

    opciones: ["P", "Q", "R", "S"],

    respuesta: "P",

    explicacion: "+2 +3 alternado"

  },

  {

    id: 36,

    sucesion: "bdhjnp",

    opciones: ["N", "J", "M", "T"],

    respuesta: "T",

    explicacion: "+2 +4 alternado"

  },

  {

    id: 37,

    sucesion: "ceikoq",

    opciones: ["s", "t", "u", "v"],

    respuesta: "u",

    explicacion: "+2 +4 alternado"

  },

  {

    id: 38,

    sucesion: "dfjlpr",

    opciones: ["t", "u", "v", "w"],

    respuesta: "v",

    explicacion: "+2 +4 alternado"

  },

  {

    id: 39,

    sucesion: "MNPSW",

    opciones: ["Z", "H", "B", "O"],

    respuesta: "B",

    explicacion: "+1 +2 +3 +4"

  },

  {

    id: 40,

    sucesion: "OPRUY",

    opciones: ["C", "D", "E", "F"],

    respuesta: "D",

    explicacion: "+1 +2 +3 +4"

  },

  {

    id: 41,

    sucesion: "KLNQU",

    opciones: ["A", "B", "Z", "Y"],

    respuesta: "Z",

    explicacion: "+1 +2 +3 +4"

  }

];



const ejerciciosDificil = [

  {

    id: 42,

    sucesion: "SROÑKIEDX",

    opciones: ["S", "A", "P", "W"],

    respuesta: "W",

    explicacion: "Pares descendentes"

  },

  {

    id: 43,

    sucesion: "DCBAZY",

    opciones: ["X", "W", "V", "U"],

    respuesta: "X",

    explicacion: "Regresión alfabética"

  },

  {

    id: 44,

    sucesion: "HGFEDC",

    opciones: ["B", "A", "Z", "Y"],

    respuesta: "B",

    explicacion: "-1 constante"

  },

  {

    id: 45,

    sucesion: "ijljmkn",

    opciones: ["l", "L", "J", "M"],

    respuesta: "L",

    explicacion: "Quitar j intercalada"

  },

  {

    id: 46,

    sucesion: "oprppsqp",

    opciones: ["u", "r", "s", "v"],

    respuesta: "r",

    explicacion: "Quitar p intercalada"

  },

  {

    id: 47,

    sucesion: "abdbecbf",

    opciones: ["g", "d", "e", "h"],

    respuesta: "d",

    explicacion: "Quitar b intercalada"

  },

  {

    id: 48,

    sucesion: "ADEEFGIH",

    opciones: ["I", "J", "E", "K"],

    respuesta: "I",

    explicacion: "Ordenar vocales y pares"

  },

  {

    id: 49,

    sucesion: "BEFFGHJI",

    opciones: ["K", "J", "L", "M"],

    respuesta: "K",

    explicacion: "Ordenar +4"

  },

  {

    id: 50,

    sucesion: "CFG G HIKJ",

    opciones: ["L", "M", "N", "O"],

    respuesta: "L",

    explicacion: "Ordenar +4"

  },

  {

    id: 51,

    sucesion: "GHAJ KEMN",

    opciones: ["Q", "P", "N", "O"],

    respuesta: "O",

    explicacion: "Grupos + vocales"

  },

  {

    id: 52,

    sucesion: "BCUDEOFG",

    opciones: ["I", "J", "K", "L"],

    respuesta: "I",

    explicacion: "Grupos + vocales"

  },

  {

    id: 53,

    sucesion: "LMAÑ EOP",

    opciones: ["I", "U", "O", "A"],

    respuesta: "I",

    explicacion: "Grupos + vocales"

  },

  {

    id: 54,

    sucesion: "WTPM",

    opciones: ["J", "I", "H", "G"],

    respuesta: "I",

    explicacion: "-3 -4 -3"

  }

];



export { ejerciciosFacil, ejerciciosMedio, ejerciciosDificil };

