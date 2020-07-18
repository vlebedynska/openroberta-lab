import {qValue} from "models.ts";

export class qValueLookup implements qValue {
    newState: number;
    state: number;
    stars: number;
    totalStars: number; //scale

    private qValueLookupTable: Map<Key, number>;

    constructor(totalStars: number) {
        this.qValueLookupTable = new Map<Key, number>();
        this.totalStars = totalStars;
    }




    public getOldNumberOfStars(state: number, newState: number): number{
        let key: string = Key.of(state, newState);
        return this.qValueLookupTable.get(key) == undefined ? 0 : this.qValueLookupTable.get(key);
    }

    public getNewNumberOfStars(state: number, newState: number, qValue: number, highestQValue: number): number {
        return this.getAndUpdateNumberOfStars(state, newState, qValue, highestQValue)
    }


    public getAndUpdateNumberOfStars(state: number, newState: number, qValue: number, highestQValue: number): number {
        let key: string =  Key.of(state, newState);
        let currentNumberOfStars = Math.round(qValue/highestQValue*this.totalStars);
        this.qValueLookupTable.set(key, currentNumberOfStars);
        return currentNumberOfStars;
    }
}



class Key {

    public static of(state: number, newState: number) : string {
        return state + '-' + newState;
    }
}