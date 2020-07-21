define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class qValueLookup {
        constructor(totalStars) {
            this.qValueLookupTable = new Map();
            this.totalStars = totalStars;
        }
        getOldNumberOfStars(state, newState) {
            let key = Key.of(state, newState);
            return this.qValueLookupTable.get(key) == undefined ? 0 : this.qValueLookupTable.get(key);
        }
        getNewNumberOfStars(state, newState, qValue, highestQValue) {
            return this.getAndUpdateNumberOfStars(state, newState, qValue, highestQValue);
        }
        getAndUpdateNumberOfStars(state, newState, qValue, highestQValue) {
            let key = Key.of(state, newState);
            let currentNumberOfStars = Math.round(qValue / highestQValue * this.totalStars);
            this.qValueLookupTable.set(key, currentNumberOfStars);
            return currentNumberOfStars;
        }
    }
    exports.qValueLookup = qValueLookup;
    class Key {
        static of(state, newState) {
            return state + '-' + newState;
        }
    }
});
