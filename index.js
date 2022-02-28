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
         value(__value__) {
            blink($('.indicator__value', indicator).text(__value__));
         },
         
         lastRefresh_default: '13:12:01',
         lastRefresh(__value__) {
            blink($('.indicator__last-refresh', indicator).text(__value__));
         },
         
         refreshRate_default: parseFloat($('.indicator__refresh-rate', indicator).text()),
         refreshRate(__value__) {
            let $rate = $('.indicator__refresh-rate', indicator).text(__value__ + 's');
            
            blink($rate);

            clearInterval(interval);
            createInterval(__value__);
            
            if (name == 'HEL') {
               $(rangeHELRefreshRate).val(__value__);
            }
         },
      };
      
      let interval; 
      function createInterval(value) {
         interval = setInterval(() => {
            const indicator = state.indicators[name];
            
            indicator.value++;

            indicator.lastRefresh = (new Date()).toLocaleTimeString('ru', {
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