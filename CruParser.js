// CruParser

var CruParser = function(sTokenize, sParsedSymb){
	this.symb = ["+UVUV", "+SC00", "+SC00T1", "+SC04", "+SC06", "+SD11", "+SE01", "+SG11", "+SG12", "+SG21", "+SG22"];
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
}

// Parser procedure

// tokenize : transforme les données d'entrée en une liste
// <eol> = CRLF
CruParser.prototype.tokenize = function(data){
	var separator = /(\r\n|: )/;
	data = data.split(separator);
	data = data.filter((val, idx) => !val.match(separator)); 					
	return data;
}

// parse : analyse des données en appelant la première règle non terminale de la grammaire
CruParser.prototype.parse = function(data){
	var tData = this.tokenize(data);
	this.cru(tData);
}

// Parser operand

CruParser.prototype.errMsg = function(msg, input){
	this.errorCount++;
	console.log("Parsing Error ! on " + input + " -- msg : " + msg);
}

// Read and return a symbol from input
CruParser.prototype.next = function(input){
	var curS = input.shift();
	if (this.showParsedSymbols){
		console.log(curS);
	}
	return curS;
}

// accept : vérifie si l'argument s fait partie des symboles du langage.
CruParser.prototype.accept = function(s){
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if (idx === -1){
		this.errMsg("symbol " + s + " unknown", [" "]);
		return false;
	}

	return idx;
}

// check : vérifie si l'élément arg est en tête de la liste
CruParser.prototype.check = function(s, input){
	if (this.accept(input[0]) == this.accept(s)){
		return true;	
	}
	return false;
}

// expect : attend que le prochain symbole soit s.
CruParser.prototype.expect = function(s, input){
	if (s == this.next(input)){
		return true;
	} else {
		this.errMsg("symbol " + s + " doesn't match", input);
	}
	return false;
}

// Parser rules

// <cru> = 1*Cours
CruParser.prototype.cru = function(input){
	while (this.check("+", input)){
		this.cours(input);
	}
}

// <Cours> = ‘+’ UE CRLF 1* Séance
CruParser.prototype.cours = function(input){
	this.expect("+", input);
	var ue = this.ue(input);
	this.next(input); // Ignore whitespace
	this.seance(input);
}

// <UE> = 2*7 ALPHA *2 DIGIT *1 ALPHA *1 Supplément
CruParser.prototype.ue = function(input){
	var ue = this.next(input);
	if (matched = ue.match(/[A-Za-z]{2}\d{7}\d{2}[A-Za-z]\d{1}/)){
		return matched[0];
	} else {
		this.errMsg("Invalid UE", [ue]);
	}
}

// <Supplément> = ‘A’/’T1’/’F’/’R’
CruParser.prototype.supplement = function(input){
	var supplement = this.next(input);
	if (supplement.match(/A|T1|F|R/)){
		return supplement;
	} else {
		this.errMsg("Invalid Supplement", [supplement]);
	}
}

// <Séance> = ‘1,’ Type ‘,P=’ 1*3 DIGIT ‘,’ Caractéristique ‘/’ CRLF
CruParser.prototype.seance = function(input){
	this.expect("1,", input);
	var type = this.type(input);
	this.expect(",P=", input);
	var duree = this.next(input);
	this.expect(",H=", input);
	var caract = this.caracteristique(input);
	this.expect("/CRLF", input);
}

// <Type> = (‘C’/’D’/’T’) (‘1’/’2’/’3’/’4’/’5’/’6’/’7’/’8’/’9’/’10’/’11’/’12’/’13’/’14’/’15’)
CruParser.prototype.type = function(input){
	var type = this.next(input);
	if (type.match(/C|D|T[1-9]|T10|T11|T12|T13|T14|T15/)){
		return type;
	} else {
		this.errMsg("Invalid Type", [type]);
	}
}

// <Caractéristique> = ‘H=’ <Jour> WSP <Horaire> ‘,F=’ (‘ ‘/’1’/’2’/’A’/’B’) ‘,S=’ <Salle>
CruParser.prototype.caracteristique = function(input){
	this.expect("H=", input);
	var jour = this.jour(input);
	this.next(input); // Ignore whitespace
	var horaire = this.horaire(input);
	this.expect(",F=", input);
	var frequency = this.next(input);
	this.expect(",S=", input);
	var salle = this.salle(input);

	return { jour: jour, horaire: horaire, frequency: frequency, salle: salle };
}

// <Jour> = ‘L’/’MA’/’ME’/’J’/’V’/’S’
CruParser.prototype.jour = function(input){
	var jour = this.next(input);
	if (jour.match(/L|MA|ME|J|V|S/)){
		return jour;
	} else {
		this.errMsg("Invalid Jour", [jour]);
	}
}

// <Horaire> = *1 Heure ‘:’ Minute ‘-‘ Heure ‘:’ Minute
CruParser.prototype.horaire = function(input){
	var hours = this.heure(input);
	this.expect(":", input);
	var minutes = this.minute(input);
	this.expect("-", input);
	var hoursEnd = this.heure(input);
	this.expect(":", input);
	var minutesEnd = this.minute(input);

	return {
		start: hours + ":" + minutes,
		end: hoursEnd + ":" + minutesEnd
	};
}

// <Heure> = 1*2 DIGIT
CruParser.prototype.heure = function(input){
	var hours = this.next(input);
	if (hours && (matched = hours.match(/\d{1,2}/))){
		return matched[0];
	} else {
		this.errMsg("Invalid Heure", [hours]);
	}
}

// <Minute> = ‘00’/’30’
CruParser.prototype.minute = function(input){
	var minutes = this.next(input);
	if (minutes.match(/00|30/)){
		return minutes;
	} else {
		this.errMsg("Invalid Minute", [minutes]);
	}
}

// <Salle> = *1 (1 ALPHA 3 DIGIT / ‘SPOR’/’EXT1’/’IUT1’)
CruParser.prototype.salle = function(input) {
    var salle = this.next(input);
    if (salle && (matched = salle.match(/[A-Za-z]\d{3}|SPOR|EXT1|IUT1/))) {
        return matched[0];
    } else {
        this.errMsg("Invalid Salle", [salle]);
    }
}
module.exports = CruParser;