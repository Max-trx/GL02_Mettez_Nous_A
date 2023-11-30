// CruParser

var CruParser = function(sTokenize, sParsedSymb){
	// The list of sessions parsed from the input file.
	this.parsedSessions = [];
	this.symb = ["EDT.CRU","+","P=","H=","F","S=","//","$"];
	this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
}

// Parser procedure

// tokenize : transform the data input into a list
// <eol> = CRLF
CruParser.prototype.tokenize = function(data){
	var separator = /(\r\n|,P=|,H=| |:|-|,S=|,|\/\/)/;
	data = data.split(separator);
	data = data.filter((val, idx) => !val.match(separator));
	return data;
}

// parse : analyze data by calling the first non-terminal rule of the grammar
CruParser.prototype.parse = function(data){
	var tData = this.tokenize(data);
	if(this.showTokenize){
		console.log(tData);
	}
	this.listcru(tData);
}

// Parser operand

CruParser.prototype.errMsg = function(msg, input){
	this.errorCount++;
	console.log("Parsing Error ! on "+input+" -- msg : "+msg);
}

// Read and return a symbol from input
CruParser.prototype.next = function(input){
	var curS = input.shift();
	if(this.showParsedSymbols){
		console.log(curS);
	}
	return curS;
}

// accept : verify if the arg s is part of the language symbols.
CruParser.prototype.accept = function(s){
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if(idx === -1){
		this.errMsg("symbol "+s+" unknown", [" "]);
		return false;
	}

	return idx;
}

// check : check whether the arg elt is at the head of the list
CruParser.prototype.check = function(s, input){
	if(this.accept(input[0]) == this.accept(s)){
		return true;	
	}
	return false;
}

// expect : expect the next symbol to be s.
CruParser.prototype.expect = function(s, input){
	if(s == this.next(input)){
		//console.log("Recognized! "+s)
		return true;
	}else{
		this.errMsg("symbol "+s+" doesn't match", input);
	}
	return false;
}

// Parser rules

CruParser.prototype.listcru = function(input){	
	this.cru(input);
	this.expect("Page", input);
}


// <cru> = *(<session>) "Page generee en" *
CruParser.prototype.cru = function(input){
	if(this.check("+",input)){
		this.expect("+",input);
		var args = this.body(input);
		var c = new POI(args.uv, args.type, args.place, args.jour, args.cara, args.salle);
		this.expect("//",input);
		this.parsedPOI.push(c);
		if(input.length > 0){
			this.cru(input);
		}
	}
	else{
		return false;
	}
}

// <body> = <name> <eol> <latlng> <eol> <optional>
CruParser.prototype.body = function(input){
	var uv = this.session(input);
	var ltlg = this.latlng(input);
	return { uv: uv, lt: ltlg.lat, lg: ltlg.lng };
}

// <session> = "+UVUV" <seance> *(<seance>)
CruParser.prototype.session = function(input){
	this.expect("+", input);
	var curS = this.next(input);

	if(matched = curS.match(/[A-Z]{2} + [0-9]{2}/)){
		return matched[0];
	}else{
		this.errMsg("Invalid name", input);
	}
}
//----------------//

// <seance> = "Seance" <typecours> *(<typecours>) <personne> *(<personne>) <salle> *(<salle>) <horaire> *(<horaire>) 
CruParser.prototype.seance = function(input){
	this.expect("Seance", input);
	var salle = this.salle(input);
	var horaire = this.horaire(input);
	var typecours = this.typecours(input);
	var personne = this.personne(input);
	while(this.check("1,", input)){
		this.next(input);
		typecours = this.typecours(input);
	}
	while(this.check("P=", input)){
		this.next(input);
		personne = this.personne(input);
	}
	while(this.check("H=", input)){
		this.next(input);
		horaire = this.horaire(input);
	}
	while(this.check("S=", input)){
		this.next(input);
		salle = this.salle(input);
	}
	this.parsedSessions.push({ typecours: typecours, salle: salle, horaire: horaire });
}
/*
// <salle> = "S=" <digit>
CruParser.prototype.salle = function(input){
	this.expect("S=", input);
	var curS = this.next(input);
	if(matched = curS.match(/[A-Z]|d{3}|SPORT|EXT1|IUT1/)){
		return matched[0];
	}else{
		this.errMsg("Invalid salle", input);
	}
}

// <horaire> = "H=" <time>
CruParser.prototype.horaire = function(input){
	this.expect("H=", input);
	var curS = this.next(input);
	if(matched = curS.match(/(L|MA|ME|J|V) \d{1,2}:\d{2}-\d{1,2}:\d{2}/)){
		return matched[0];
	}else{
		this.errMsg("Invalid horaire", input);
	}
}

// <type de cours> = "1," <type>
CruParser.prototype.typecours = function(input){
	this.expect("1,", input);
	var curS = this.next(input);
	if(matched = curS.match(/(T|D|C)\d{1}/)){
		return matched[0];
	}else{
		if (matched = curS.match(/F/)){
		return nothing
		}else{
		this.errMsg("Invalid type cours", input);
	}
	}
}

// <personne> = "P=" <personne>
CruParser.prototype.typecours = function(input){
	this.expect("P=", input);
	var curS = this.next(input);
	if(matched = curS.match(/d/)){
		return matched[0];
	}else{
		this.errMsg("Invalid nb personne", input);
	}
	
}

*/

module.exports = CruParser;
