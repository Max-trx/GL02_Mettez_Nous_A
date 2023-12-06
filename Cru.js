var CRU = function(ue, type, place, jour, horaire, frequency, salle){

	this.ue = ue;
    this.type = type;
    this.place = place;
    this.horaire = horaire;
    this.jour = jour;
    this.salle = salle;
    this.frequency = frequency;
}
module.exports = CRU;