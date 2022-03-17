/*
 * Author:     Nikonov Fedor Andreevich
* Email:      NikonovFA@rncb.ru
* Created At: 28.02.2022 11:43:38
*/

 

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
 *   
 * 3. Return - модификация значения. Используй return из сеттера, чтобы изменить сохраняемое значение
 *
 *    const config = {
 *       // начальное значение переменной
 *       variable_default: 10,
 *       variable(value) {
 *          // теперь значение всегда будет строкой
 *          return value.toString();
 *       },
 *    };
 *   
 *    // создаем стейт
 *    const state = new State(config);
 *
 *    state.variable; // '10'
 *    typeof state.variable; // 'string'
 *   
 * 4. Методы стейта
 *
 *    const config = {
 *       // префикс function_ превращает сеттер в метод
 *       function_sayHello(name) {
 *          // выводим приветственное сообщение
 *          alert('Hello, ' + name + '!');
 *       },
 *    };
 *   
 *    // создаем стейт
 *    const state = new State(config);
 *
 *    state.sayHello('Albert'); // Hello, Albert!
 *   
 * 5. Старое значение
 *
 *    const config = {
 *       // начальное значение переменной
 *       variable_default: 10,
 *       variable(value, oldValue) {
 *          // вторым параметром сеттер получает значение до его изменения
 *          console.log(value, oldValue);
 *       },
 *    };
 *   
 *    // создаем стейт
 *    const state = new State(config);
 *
 *    state.variable; // 10
 *    state.variable++; // 11 10
 *   
 * 6. Обращение к стейту через this
 * 
 *    const config = {
 *       variable() {
 *          console.log(this);
 *       }
 *      
 *       object: {
 *          variable() {
 *             console.log(this);
 *          }
 *       }
 *    };
 *   
 *    // создаем стейт
 *    const state = new State(config);
 *   
 *    // this указывает на стейт
 *    state.variable++; // { variable: ..., object: ... }
 *   
 *    // все объекты внутри стейта превращаются в State, поэтому this указывает на state.object
 *    state.object.variable++; // { variable: ... }
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
 
      const self = this;
      this[Symbol.iterator] = function () {
         return {
            next: function () {
               return self[this._i] ? {
                  value: self[this._i++],
                  done: false,
               } : {
                  done: true,
               }
            },
            _i: 0,
         };
      }
 
      // for each prop in given config
      for (let prop in state) {
         // skip default values
         if (prop.endsWith('_default'))
            continue;
         if (prop === '_') {
            console.warn(`State: _ prop is reserved and can't be assigned`);
            continue;
         }
 
         if (prop.startsWith('function_')) {
            prop = prop.replace(/^function_/, '');
            const self = this;
            const method = state['function_'+prop];
 
            self._[prop] = method;
 
            // define state variable, working with local variable
            Object.defineProperty(self, prop, {
               get() {
                  return self._[prop]; // return locals value
               },
               set(value) {
                  return self._[prop] = value; // update locals value
               },
               enumerable: true, // visible in for in loop and other places
            });
 
            continue;
         }
           
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
                  const res = watcher.call(self, value, self._[prop] !== undefined ? self._[prop] : value, self); // call watcher on change
                  return self._[prop] = res !== undefined ? res : value; // update locals value
               },
               enumerable: true, // visible in for in loop and other places
            });
           
            // set default value if given
            if (state[prop + '_default'] !== undefined)
               this[prop] = state[prop + '_default'];
         }
         // if variable is Object or Array or State, then it has nested variables
         else if (state[prop] instanceof Object || state[prop] instanceof Array || state[prop] instanceof State) {
            const self = this;
 
            // So create state for this object
            if (state[prop] instanceof State)
               self._[prop] = state[prop];
            else
               self._[prop] = new State(state[prop]);
              
            // And define property for this nested state
            Object.defineProperty(self, prop, {
               get() { // taking nested state simply return target
                  return self._[prop];
               },
               set(value) { // setting nested state expects value to be Object (with rewrite data)
                  if (value instanceof State) {
                     self._[prop] = value;
                     return value;
                  }
                 
                  // else if given not state, then expected Plain Object to be given (fast assign)
                  if (!(value instanceof Object)) { // check if Plain Object given
                     console.warn(`State: On state.${prop} assign - Expected plain object to be assigned. Plain objects used to rewrite some variables in target state object.`);
                     return value;
                  }
                  // if Plain Object assigned
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