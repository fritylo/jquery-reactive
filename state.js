;(function () {
/*
 * Created:     Mon Feb 28 2022 10:35:54 AM
 * Author:      fritylo (https://github.com/fritylo)
 * Repository:  https://github.com/fritylo/jquery-reactive
 * Docs:        https://fritylo.github.io/jquery-reactive/
 * Copyright (c) 2022 frity corp.
 */
 
/**
 * ЧТО ЭТО?
 * Это библиотека для упрощения вывода данных средствами jQuery.
 * 
 * Как использовать?
 * 
 *    const config = {
 *       // начальное значение переменной
 *       variable_default: 10,
 *       variable(value) {
 *          // код который сработает при изменении переменной
 *          // обычно тут выводим значение куда надо - обновляем инфу на странице
 *          // для примера просто console.log
 *          console.log(value);
 *       },
 *    };
 *    
 *    // создаем стейт
 *    const state = new State(config);
 * 
 *    state.variable; // 10, т.к. начальное значение
 *    state.variable = 666; // console.log(666) // сработал слушатель обновлений
 *    state.variable; // 666, значение обновилось
 *    
 * Особенности:
 * 1. Объекты в конфиге - такие же стейты как и корневой стейт:
 *    
 *    const state = new State({
 *       data: {
 *          var1() {...},
 *          var2() {...},
 *       },
 *    });
 * 
 *    state.data.var1; // OK
 * 
 * 2. Можно быстро изменять значения всего стейта:
 *    
 *    const state = new State({
 *       data: {
 *          var1() {...},
 *          var2() {...}
 *       },
 *       another: {
 *          prop1() {...},
 *          prop2() {...},
 *       },
 *    });
 * 
 *    state.data = { var1: 10, var2: 20 }; // Заменит значения двух переменных
 *    state.data = { var1: 11 }; // Значения которые не указаны - не изменяются. var2 без изменений
 *    // state = { data: {...}, another: {...} } - Не даст результатов. Быстрое изменение работает
 *    //                                           только на вложенных объектах стейта.
 */   

class State { // class have only constructor
   constructor(state) {
      // register state._ property (used for local variable values)
      Object.defineProperty(this, '_', { // locals
         value: {}, // value of property
         enumerable: false, // hidden for for-in loops and Object.entries
         writable: false, // can't be changed outside
         configurable: false, // can't be deleted
      });

      // for each prop in given config
      for (let prop in state) {
         // skip default values
         if (prop.endsWith('_default'))
            continue;
            
         // if given function (means variable setter)
         if (state[prop] instanceof Function) { // is variable (setter)
            const self = this;
            const watcher = state[prop];

            // define state variable, working with local variable 
            Object.defineProperty(self, prop, {
               get() {
                  return self._[prop]; // return locals value
               },
               set(value) {
                  watcher(value); // call watcher on change
                  return self._[prop] = value; // update locals value
               },
               enumerable: true, // visible in for in loop and other places
            });
            
            // set default value if given
            if (state[prop + '_default'] !== undefined)
               this[prop] = state[prop + '_default'];
         }
         // if variable is Object or Array, then it has nested variables
         else if (state[prop] instanceof Object || state[prop] instanceof Array) { // is object or array
            const self = this;

            // So create state for this object
            self._[prop] = new State(state[prop]);
               
            // And define property for this nested state
            Object.defineProperty(self, prop, {
               get() { // taking nested state simply return target
                  return self._[prop];
               },
               set(value) { // setting nested state expects value to be Object (with rewrite data)
                  if (!(value instanceof Object)) {
                     console.warn(`State: On state.${prop} assign - Expected plain object to be assigned. Plain objects used to rewrite some variables in target state object.`);
                     return value;
                  }
                  // if plain object assigned
                  for (let innerProp in value) { // for each prop of it
                     if (innerProp in state[prop]) { // check if property exists in state
                        self._[prop][innerProp] = value[innerProp]; // replace value
                        // if target prop is also object|array, then go deeper in set statements
                     } else { // if prop not registered simply log warning
                        console.warn(`State: Unable to set unregistered prop "state.${prop}.${innerProp}".`);
                     }
                  }
                  return value;
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