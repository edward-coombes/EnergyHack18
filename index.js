var MAX = 100000;
var debug = 5;
class Prosumer {

	constructor(ID, _demand, supply, sellingPrice, maxBuyingPrice, demandPriority){
		this.ID = ID;
		this.demand = _demand;
		this.supply = supply;

		this.realSupply = supply - _demand;
		this.demandPriority = demandPriority;
		this.sellingPrice = sellingPrice;
		this.maxBuyingPrice = maxBuyingPrice;

		if(this.demand < this.supply) {
			this.producer = true;
		} else if(this.demand > this.supply){
			this.consumer = true;
		}
		console.log(this);
	}

	isProducer(){
		return (this.supply > this.demand);
	}

	isConsumer(){
		return (this.demand > this.supply);
	}

	setRealSupply(val){
		this.realSupply = val;
	}
		
	setDemand(val){
		this.demand = val;
	}

	getDemand(){
		return this.demand;
	}
}

class DC {
	constructor(){
		this.fee = 0.1;
		this.physicalMap = [
			[MAX,0,0,0],
			[0,MAX,0,0],
			[0,0,MAX,0],
			[0,0,0,MAX]
		];//*//*
		
		/*
		this.physicalMap = [
			[MAX,2.2,2,2.3],
			[2.2,MAX,2.2,2.5],
			[2,2.2,MAX,2.3],
			[2.3,2.5,2.3,MAX]
		];*/
	}
}

class Transaction {

	calculateFinalBuyingPrice(){
		debug = -1;
		if(this.P1.isConsumer() && this.P2.isProducer()){
			this.realDemand = this.P1.demand 
					- this.P1.supply + this.loss;
			this.realSupply = this.P2.realSupply;
			if(debug > 1){
				console.log("Real Demand: " + this.realDemand + "\nReal Supply: " + this.realSupply);
			}
			if(this.realDemand < this.realSupply){
				this.buyingPrice = this.P2.sellingPrice * this.realDemand + this.realDemand * this.fee;
				this.tradingUnits = this.realDemand;
			} else {
				this.buyingPrice = this.P2.sellingPrice * this.realSupply + this.realSupply*this.fee;
				this.tradingUnits = this.realSupply - this.loss;
			}
		} else {
			this.buyingPrice = MAX;
			this.tradingUnits = 0;
		}
		if(debug > 1){
			console.log("Trading price: " + this.buyingPrice + " and units " + this.tradingUnits);
		}
	}


//RUN FUNCTION OF TRANSCATON
	run(){
		let b;
		if(this.P2.realSupply > - this.P1.realSupply){
			console.log("seller has more than enough");
			b = new Bill(this.P1,this.P2,-this.P1.realSupply,this.unitPrice);
			this.P2.realSupply += this.realSupply;
			//this.P1.demand = 0;
			this.P1.realSupply = 0;
			
		} else if(this.P2.realSupply == -this.P1.realSupply) {
			console.log("they equal");
			b = new Bill(this.P1,this.P2,this.P1.realSupply,this.unitPrice);

			this.P2.realSupply = 0;
			this.P1.realSupply = 0;
		} else {
			console.log("seller does not have enough");
			b = new Bill(this.P1,this.P2,this.P2.realSupply,this.unitPrice);
			this.P1.realSupply += this.P2.realSupply - this.loss;
			this.P2.realSupply = 0;
		}
			console.log(b);

		return b;
	}

	constructor(P1, P2,dc){
		this.P1 = P1;
		this.P2 = P2;
		this.buyingPrice = MAX;
		this.tradingUnits = 0;
		this.realSupply = 0;
		this.realDemand = 0;
		this.loss = dc.physicalMap[this.P1.ID-1][this.P2.ID-1];
		this.fee = dc.fee;
		this.calculateFinalBuyingPrice();
		this.unitPrice = this.buyingPrice / this.tradingUnits;
		
	}

}

class Bill {

	constructor(buyer,seller,units,unitPrice){
		this.buyer = buyer;
		this.seller = seller;
		this.units = units;
		this.unitPrice = unitPrice;
	}

	returnBillString(){
		let outStr;
		outStr = "------------------";
		outStr += "\nBuyer: " + this.buyer.ID;
		outStr += "\nSeller: " + this.seller.ID;
		outStr += "\nUnits: " + this.units + " @ " + this.unitPrice; 
		outStr += "\nTotal: " + this.units*this.unitPrice;
		outStr += "\n-----------------";
		return outStr;
	}

}

function logObject(obj){
	Object.keys(obj).forEach(function(key,index){
		console.log(key + " : " + obj[key]);

	});
}


function generateVirtualMap(dc, prosumerList){
	physicalMap = dc.physicalMap;
	fee = dc.fee;
	console.log(physicalMap);
	transactions = [];
	debug = 3;
	virtualMap = [new Array(prosumers.length),
		new Array(prosumers.length),
		new Array(prosumers.length),
		new Array(prosumers.length)];
	console.log("Physical map length: " + physicalMap.length);
	for(vmi=0;vmi<physicalMap.length;vmi++){
		for(vmj=0;vmj<physicalMap.length;vmj++){
				if(debug > 2){
					console.log("-----------------");
					console.log("Prosumer " + (vmi+1) 
						+ "\nProsumer " + (vmj+1));
				}
				var t = new Transaction(prosumers[vmi],prosumers[vmj],dc);
				virtualMap[vmi][vmj] = t;
				transactions.push(t);

			
		}
	}
	for(i = 0; i < transactions.length;i++){
		virtualMap[transactions[i].P1.ID-1][transactions[i].P2.ID-1] = transactions[i];
	}
	console.log(virtualMap);/*
	for(i = 0; i < prosumers.length; i++){
		for(j=0;j < prosumers.length; j++){
			if(virtualMap[i][j] != null)
				//console.log("Transaction " + i + "," + j 
				//+ ": " + virtualMap[i][j].buyingPrice);
		}
	}*/
	return virtualMap;
}
function printSquare(arr,len,attr){
	for(i = 0; i < len; i++){
		outStr = "";
		for(j=0;j<len;j++){
			outStr += " " + arr[i][j][attr] + " ";
		}
		console.log(outStr);
	}
}


var P1 = new Prosumer(1,10,2,1.5,3.0,3);
var P2 = new Prosumer(2,8,15,1.7,3.5,3);
var P3 = new Prosumer(3,11,0,MAX,2.5,1);
var P4 = new Prosumer(4,0,12,2.0,0,2);

var dc = new DC();
var prosumers = [P1,P2,P3,P4];

var virtualMap = generateVirtualMap(dc,prosumers);
console.log(virtualMap);

//first create an indices
var prosumerIndices = [];
for(i = 0; i < prosumers.length; i++){
	prosumerIndices.push(i);
}
//sort the indices, as the relate prosumers priority
prosumerIndices.sort(function(a,b){
	pa = prosumers[a];
	pb = prosumers[b];

	return pa.demandPriority-pb.demandPriority;

});

//find the cheapest power source
var bills = [];
console.log("Preparing to find cheapest power source");
pro = -1;
console.log("Prosumers.length: " + prosumers.length);
for(buyerIndex = 0; buyerIndex < prosumers.length; buyerIndex++){
	consumerIndex = prosumerIndices[buyerIndex];
	potentialBuyer = prosumers[consumerIndex];
	console.log(potentialBuyer);
	if(!(potentialBuyer.realSupply < 0)) {
		continue;
	}

	
	console.log("Real buyer identified: ");
	console.log(potentialBuyer);
	
	//generate list of ptential transactions
	potentialTransactions = [];
	for(saleIndex = 0; saleIndex < prosumers.length; saleIndex++){
		potentialSale = virtualMap[consumerIndex][saleIndex];

		if(potentialSale.buyingPrice == MAX ||
			potentialSale.P2.realSupply <= 0){
			continue;
		}

		potentialTransactions.push(potentialSale);
	}

	//sort list of potential transactions, cheapest unit price first
	potentialTransactions.sort(function(a,b){

		return a.unitPrice - b.unitPrice;
	});
	potentialTransactions.forEach(function(t){
		logObject(t);
		console.log("\n\n");
	});
	
	//perform sequential cheapest transactions
	//while energy needs not met
	remaining = 0-potentialBuyer.realSupply;
	transactionSequence = 0;
	kkkkillMe = 10;
	while((0 - (potentialBuyer.realSupply)).toFixed(1) > 0 && transactionSequence < potentialTransactions.length){
		//buy cheapest
		console.log("Why isn't work: " + (0 - (potentialBuyer.realSupply)).toFixed(1));
		bills.push(potentialTransactions[transactionSequence].run());
		transactionSequence++;
	}
	if(kkkkillMe == 0)
		console.log("We need a break");
	else
		console.log("We didn't need to break");
	console.log(potentialBuyer.realSupply);
}

console.log(bills);
for(i=0;i<bills.length;i++)
	console.log(bills[i].returnBillString());


//STYLING AND STUFF AND SHIT DEAR GOD PLEASE KILL ME NOW
