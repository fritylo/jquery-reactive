;(function () {
   
class State {
   constructor(state) {
      Object.defineProperty(this, '_', { // locals
         value: {}, // value of property
         enumerable: false, // hidden for for-in loops and Object.entries
         writable: false, // can't be changed outside
         configurable: false, // can't be deleted
      });

      for (let prop in state) {
         // skip default values
         if (prop.endsWith('_default'))
            continue;
            
         if (state[prop] instanceof Function) { // is variable (setter)
            const self = this;
            const watcher = state[prop];

            Object.defineProperty(self, prop, {
               get() {
                  return self._[prop]; // return locals value
               },
               set(value) {
                  watcher(value); // call watch
                  return self._[prop] = value; // update locals value
               },
               enumerable: true,
            });
            
            // set default value if exist
            if (state[prop + '_default'] !== undefined)
               this[prop] = state[prop + '_default'];
         }
         else if (state[prop] instanceof Object || state[prop] instanceof Array) { // is object or array
            const self = this;

            self._[prop] = new State(state[prop]);
               
            Object.defineProperty(self, prop, {
               get() {
                  return self._[prop];
               },
               set(value) {
                  for (let innerProp in value) {
                     if (innerProp in state[prop]) {
                        self._[prop][innerProp] = value[innerProp];
                     } else {
                        console.warn(`State: Unable to set unregistered prop "state.${prop}.${innerProp}".`);
                     }
                  }
               },
            });
         }
         else { // primitive
            console.warn(`State: Can not setup property "${prop}". Use function to define variable.`);
         }
      }
   }
}

window.State = State;

})();