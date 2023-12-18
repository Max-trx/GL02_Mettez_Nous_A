class FreeSlot{
    static freeslot;

    FreeSlot(){}

    static getInstance(){
		if(this.freeslot == null){
			this.freeslot = new FreeSlot();
		}
		return this.freeslot;
	}

    getMiddleTime2Hours(cours,occupiedSlots){
        if (cours.horaire.start.substr(0,1) === "8"){
            occupiedSlots.push("8:30","9:00","9:30");
        }
        if (cours.horaire.start.substr(0,4) === "8:30"){
            occupiedSlots.push("9:00","9:30","10:00");
        }
        if (cours.horaire.start.substr(0,1) === "9"){
            occupiedSlots.push("9:30","10:00","10:30");
        }
        if (cours.horaire.start.substr(0,4) === "9:30"){
            occupiedSlots.push("10:00","10:30","11:00");
        }
        if (cours.horaire.start.substr(0,2) === "10"){
            occupiedSlots.push("10:30","11:00","11:30");
        }
        if (cours.horaire.start.substr(0,5) === "10:30"){
            occupiedSlots.push("11:00","11:30","12:00");
        }
        if (cours.horaire.start.substr(0,1) === "11"){
            occupiedSlots.push("11:30","12:00","12:30");
        }
        if (cours.horaire.start.substr(0,5) === "11:30"){
            occupiedSlots.push("12:00","12:30","13:00");
        }
        if (cours.horaire.start.substr(0,2) === "12"){
            occupiedSlots.push("12:30","13:00","13:30");
        }
        if (cours.horaire.start.substr(0,5) === "12:30"){
            occupiedSlots.push("13:00","13:30","14:00");
        }
        if (cours.horaire.start.substr(0,2) === "13"){
            occupiedSlots.push("13:30","14:00","14:30");
        }
        if (cours.horaire.start.substr(0,5) === "13:30"){
            occupiedSlots.push("14:00","14:30","15:00");
        }
        if (cours.horaire.start.substr(0,2) === "14"){
            occupiedSlots.push("14:30","15:00","15:30");
        }
        if (cours.horaire.start.substr(0,5) === "14:30"){
            occupiedSlots.push("15:00","15:30","16:00");
        }
        if (cours.horaire.start.substr(0,2) === "15"){
            occupiedSlots.push("15:30","16:00","16:30");
        }
        if (cours.horaire.start.substr(0,5) === "15:30"){
            occupiedSlots.push("16:00","16:30","17:00");
        }
        if (cours.horaire.start.substr(0,2) === "16"){
            occupiedSlots.push("16:30","17:00","17:30");
        }
        if (cours.horaire.start.substr(0,5) === "16:30"){
            occupiedSlots.push("17:00","17:30","18:00");
        }
        if (cours.horaire.start.substr(0,2) === "17"){
            occupiedSlots.push("17:30","18:00","18:30");
        }
        if (cours.horaire.start.substr(0,5) === "17:30"){
            occupiedSlots.push("18:00","18:30","19:00");
        }
        if (cours.horaire.start.substr(0,2) === "18"){
            occupiedSlots.push("18:30","19:00","19:30");
        }
        if (cours.horaire.start.substr(0,5) === "18:30"){
            occupiedSlots.push("19:00","19:30","20:00");
        }
        if (cours.horaire.start.substr(0,2) === "19"){
            occupiedSlots.push("19:30","20:00","20:30");
        }
        if (cours.horaire.start.substr(0,5) === "19:30"){
            occupiedSlots.push("20:00","20:30","21:00");
        }
    }

    getMiddleTime4Hours(cours,occupiedSlots){
        if (cours.horaire.start.substr(0,1) === "8"){
            occupiedSlots.push("8:30","9:00","9:30","10:00","10:30","11:00","11:30");
        }
        if (cours.horaire.start.substr(0,4) === "8:30"){
            occupiedSlots.push("9:00","9:30","10:00","10:30","11:00","11:30","12:00");
        }
        if (cours.horaire.start.substr(0,1) === "9"){
            occupiedSlots.push("9:30","10:00","10:30","11:00","11:30","12:00","12:30");
        }
        if (cours.horaire.start.substr(0,4) === "9:30"){
            occupiedSlots.push("10:00","10:30","11:00","11:30","12:00","12:30","13:00");
        }
        if (cours.horaire.start.substr(0,2) === "10"){
            occupiedSlots.push("10:30","11:00","11:30","12:00","12:30","13:00","13:30");
        }
        if (cours.horaire.start.substr(0,5) === "10:30"){
            occupiedSlots.push("11:00","11:30","12:00","12:30","13:00","13:30","14:00");
        }
        if (cours.horaire.start.substr(0,1) === "11"){
            occupiedSlots.push("11:30","12:00","12:30","13:00","13:30","14:00","14:30");
        }
        if (cours.horaire.start.substr(0,5) === "11:30"){
            occupiedSlots.push("12:00","12:30","13:00","13:30","14:00","14:30","15:00");
        }
        if (cours.horaire.start.substr(0,2) === "12"){
            occupiedSlots.push("12:30","13:00","13:30","14:00","14:30","15:00","15:30");
        }
        if (cours.horaire.start.substr(0,5) === "12:30"){
            occupiedSlots.push("13:00","13:30","14:00","14:30","15:00","15:30","16:00");
        }
        if (cours.horaire.start.substr(0,2) === "13"){
            occupiedSlots.push("13:30","14:00","14:30","15:00","15:30","16:00","16:30");
        }
        if (cours.horaire.start.substr(0,5) === "13:30"){
            occupiedSlots.push("14:00","14:30","15:00","15:30","16:00","16:30","17:00");
        }
        if (cours.horaire.start.substr(0,2) === "14"){
            occupiedSlots.push("14:30","15:00","15:30","16:00","16:30","17:00","17:30");
        }
        if (cours.horaire.start.substr(0,5) === "14:30"){
            occupiedSlots.push("15:00","15:30","16:00","16:30","17:00","17:30","18:00");
        }
        if (cours.horaire.start.substr(0,2) === "15"){
            occupiedSlots.push("15:30","16:00","16:30","17:00","17:30","18:00","18:30");
        }
        if (cours.horaire.start.substr(0,5) === "15:30"){
            occupiedSlots.push("16:00","16:30","17:00","17:30","18:00","18:30","19:00");
        }
        if (cours.horaire.start.substr(0,2) === "16"){
            occupiedSlots.push("16:30","17:00","17:30","18:00","18:30","19:00","19:30");
        }
        if (cours.horaire.start.substr(0,5) === "16:30"){
            occupiedSlots.push("17:00","17:30","18:00","18:30","19:00","19:30","20:00");
        }
        if (cours.horaire.start.substr(0,2) === "17"){
            occupiedSlots.push("17:30","18:00","18:30","19:00","19:30","20:00","20:30");
        }
        if (cours.horaire.start.substr(0,5) === "17:30"){
            occupiedSlots.push("18:00","18:30","19:00","19:30","20:00","20:30","21:00");
        }
        if (cours.horaire.start.substr(0,2) === "18"){
            occupiedSlots.push("18:30","19:00","19:30","20:00","20:30","21:00","21:30");
        }
        if (cours.horaire.start.substr(0,5) === "18:30"){
            occupiedSlots.push("19:00","19:30","20:00","20:30","21:00","21:30",'22:00');
        }
        if (cours.horaire.start.substr(0,2) === "19"){
            occupiedSlots.push("19:30","20:00","20:30","21:00","21:30",'22:00',"22:30");
        }
        if (cours.horaire.start.substr(0,5) === "19:30"){
            occupiedSlots.push("20:00","20:30","21:00","21:30",'22:00',"22:30","23:00");
        }
    }

    getMiddleTime1Hours(cours,occupiedSlots){
        if (cours.horaire.start.substr(0,1) === "8"){
            occupiedSlots.push("8:30");
        }
        if (cours.horaire.start.substr(0,4) === "8:30"){
            occupiedSlots.push("9:00");
        }
        if (cours.horaire.start.substr(0,1) === "9"){
            occupiedSlots.push("9:30");
        }
        if (cours.horaire.start.substr(0,4) === "9:30"){
            occupiedSlots.push("10:00");
        }
        if (cours.horaire.start.substr(0,2) === "10"){
            occupiedSlots.push("10:30");
        }
        if (cours.horaire.start.substr(0,5) === "10:30"){
            occupiedSlots.push("11:00");
        }
        if (cours.horaire.start.substr(0,1) === "11"){
            occupiedSlots.push("11:30");
        }
        if (cours.horaire.start.substr(0,5) === "11:30"){
            occupiedSlots.push("12:00");
        }
        if (cours.horaire.start.substr(0,2) === "12"){
            occupiedSlots.push("12:30");
        }
        if (cours.horaire.start.substr(0,5) === "12:30"){
            occupiedSlots.push("13:00");
        }
        if (cours.horaire.start.substr(0,2) === "13"){
            occupiedSlots.push("13:30");
        }
        if (cours.horaire.start.substr(0,5) === "13:30"){
            occupiedSlots.push("14:00");
        }
        if (cours.horaire.start.substr(0,2) === "14"){
            occupiedSlots.push("14:30");
        }
        if (cours.horaire.start.substr(0,5) === "14:30"){
            occupiedSlots.push("15:00");
        }
        if (cours.horaire.start.substr(0,2) === "15"){
            occupiedSlots.push("15:30");
        }
        if (cours.horaire.start.substr(0,5) === "15:30"){
            occupiedSlots.push("16:00");
        }
        if (cours.horaire.start.substr(0,2) === "16"){
            occupiedSlots.push("16:30");
        }
        if (cours.horaire.start.substr(0,5) === "16:30"){
            occupiedSlots.push("17:00");
        }
        if (cours.horaire.start.substr(0,2) === "17"){
            occupiedSlots.push("17:30");
        }
        if (cours.horaire.start.substr(0,5) === "17:30"){
            occupiedSlots.push("18:00");
        }
        if (cours.horaire.start.substr(0,2) === "18"){
            occupiedSlots.push("18:30");
        }
        if (cours.horaire.start.substr(0,5) === "18:30"){
            occupiedSlots.push("19:00");
        }
        if (cours.horaire.start.substr(0,2) === "19"){
            occupiedSlots.push("19:30");
        }
        if (cours.horaire.start.substr(0,5) === "19:30"){
            occupiedSlots.push("20:00");
        }
    }

    getMiddleTime1HoursHalf(cours,occupiedSlots){
        if (cours.horaire.start.substr(0,1) === "8"){
            occupiedSlots.push("8:30","9:00");
        }
        if (cours.horaire.start.substr(0,4) === "8:30"){
            occupiedSlots.push("9:00","9:30");
        }
        if (cours.horaire.start.substr(0,1) === "9"){
            occupiedSlots.push("9:30","10:00");
        }
        if (cours.horaire.start.substr(0,4) === "9:30"){
            occupiedSlots.push("10:00","10:30");
        }
        if (cours.horaire.start.substr(0,2) === "10"){
            occupiedSlots.push("10:30","11:00");
        }
        if (cours.horaire.start.substr(0,5) === "10:30"){
            occupiedSlots.push("11:00","11:30");
        }
        if (cours.horaire.start.substr(0,1) === "11"){
            occupiedSlots.push("11:30","12:00");
        }
        if (cours.horaire.start.substr(0,5) === "11:30"){
            occupiedSlots.push("12:00","12:30");
        }
        if (cours.horaire.start.substr(0,2) === "12"){
            occupiedSlots.push("12:30","13:00");
        }
        if (cours.horaire.start.substr(0,5) === "12:30"){
            occupiedSlots.push("13:00","13:30");
        }
        if (cours.horaire.start.substr(0,2) === "13"){
            occupiedSlots.push("13:30","14:00");
        }
        if (cours.horaire.start.substr(0,5) === "13:30"){
            occupiedSlots.push("14:00","14:30");
        }
        if (cours.horaire.start.substr(0,2) === "14"){
            occupiedSlots.push("14:30","15:00");
        }
        if (cours.horaire.start.substr(0,5) === "14:30"){
            occupiedSlots.push("15:00","15:30");
        }
        if (cours.horaire.start.substr(0,2) === "15"){
            occupiedSlots.push("15:30","16:00");
        }
        if (cours.horaire.start.substr(0,5) === "15:30"){
            occupiedSlots.push("16:00","16:30");
        }
        if (cours.horaire.start.substr(0,2) === "16"){
            occupiedSlots.push("16:30","17:00");
        }
        if (cours.horaire.start.substr(0,5) === "16:30"){
            occupiedSlots.push("17:00","17:30");
        }
        if (cours.horaire.start.substr(0,2) === "17"){
            occupiedSlots.push("17:30","18:00");
        }
        if (cours.horaire.start.substr(0,5) === "17:30"){
            occupiedSlots.push("18:00","18:30");
        }
        if (cours.horaire.start.substr(0,2) === "18"){
            occupiedSlots.push("18:30","19:00");
        }
        if (cours.horaire.start.substr(0,5) === "18:30"){
            occupiedSlots.push("19:00","19:30");
        }
        if (cours.horaire.start.substr(0,2) === "19"){
            occupiedSlots.push("19:30","20:00");
        }
        if (cours.horaire.start.substr(0,5) === "19:30"){
            occupiedSlots.push("20:00","20:30");
        }
    }
}

module.exports = FreeSlot;