jQuery(function () {
   let State = window.State;
   
   const config = {
      indicators: {},
      helloMessage(value) {
         alert('Hello, ' + value);
      }
   };

   $('.indicator').each((i, indicator) => {
      const name = indicator.querySelector('.indicator__title').textContent;

      config.indicators[name] = {
         value_default: $('.indicator__value', indicator).text(),
         value(value) {
            blink($('.indicator__value', indicator).text(value));
         },
         
         lastRefresh_default: '13:12:01',
         lastRefresh(value) {
            blink($('.indicator__last-refresh', indicator).text(value));
         },
         
         refreshRate_default: parseFloat($('.indicator__refresh-rate', indicator).text()),
         refreshRate(value) {
            let $rate = $('.indicator__refresh-rate', indicator).text(value + 's');
            
            blink($rate);

            clearInterval(interval);
            createInterval(value);
            
            if (name == 'HEL') {
               $(rangeHELRefreshRate).val(value);
            }
         },
      };
      
      let interval; 
      function createInterval(value) {
         interval = setInterval(() => {
            const indicatorState = state.indicators[name];
            
            indicatorState.value++;

            indicatorState.lastRefresh = (new Date()).toLocaleTimeString('ru', {
               hour: 'numeric',
               minute: 'numeric',
               second: 'numeric',
            });
         }, value * 1000);
      }
   });

   const state = new State(config);
   window.state = state;
   
   $(rangeHELRefreshRate).on('change mousemove', e => {
      state.indicators.HEL.refreshRate = e.target.value;
   });

   function blink($el) {
      $el.removeClass('blink');
      document.body.getBoundingClientRect();
      $el.addClass('blink');
   }
});