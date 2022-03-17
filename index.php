<?php $VER = '1.5'; ?>
<?php ob_start(); ?>

<?php require __DIR__ . '/state.php'; ?>

<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>jQuery Reactive</title>
   <link rel="stylesheet" href="index.css?v=<?= $VER ?>">
   <link rel="stylesheet" href="prism.css?v=<?= $VER ?>">
</head>
<body>
   <div class="indicators">
      <?php foreach ($state->indicators as $indicator) : ?>
         <div class="indicator">
            <div class="indicator__title"><?= $indicator->title ?></div>
            <div class="indicator__value"><?= $indicator->value ?></div>
            <div>
               <div class="indicator__last-refresh"><?= $indicator->last_refresh ?></div>
               <div class="indicator__refresh-rate"><?= $indicator->refresh_rate ?>s</div>
            </div>
         </div>
      <?php endforeach; ?>
   </div>
   <div class="ranges">
      <label>
         <input type="range" id="rangeHELRefreshRate" min="0.01" max="2" step="0.01">
         HEL refresh rate
      </label>
   </div>
   <div class="use-case">
<pre>











<h1 style="width: 100%"><center>jQuery Reactive</center></h1>

<big>Это библиотека для упрощения вывода данных средствами jQuery.</big>
<big><strong>127 строк</strong> кода без сжатия.</big>
<big>Использует последние фичи JS (старые браузеры плачут, но это поправимо)</big>

Основные понятия:
1. <strong>Конфиг</strong> - объект настроек, который задает какие поля есть в стейте.
2. <strong>Стейт</strong> - объект который отдает библиотека. Отслеживает изменения переменных.

3. <strong><em>Значение по умолчанию</em></strong> - библиотека отслеживает только изменения переменных,
   без присвоения получим undefined при первом обращении. Можно задавать и после создания стейта - 
   вручную.
4. <strong><em>Обработчик</em></strong> - функция, которая вызывается при изменении значения переменной.
   Обычно отвечает за отрисовку изменений на странице (render).

<h2>Как использовать?</h2>
<pre><code class="language-javascript">const config = {
   // начальное значение переменной
   variable_default: 10,
   variable(value) {
      // код который сработает при изменении переменной
      // обычно тут выводим значение куда надо - обновляем инфу на странице
      // для примера просто console.log
      console.log(value);
   },
};

// создаем стейт
const state = new State(config);

state.variable; // 10, т.к. начальное значение
state.variable = 666; // console.log(666) // сработал слушатель обновлений
state.variable; // 666, значение обновилось</code></pre>

<h2>Особенности:</h2>
<h3>1. Объекты в конфиге - такие же стейты как и корневой стейт:</h3>
<pre><code class="language-javascript">const state = new State({
   data: {
      var1() {...},
      var2() {...},
   },
});

state.data.var1; // OK</code></pre>  

<h3>2. Можно быстро изменять значения всего стейта:</h3>
<pre><code class="language-javascript">const state = new State({
   data: {
      var1() {...},
      var2() {...}
   },
   another: {
      prop1() {...},
      prop2() {...},
   },
});

state.data = { var1: 10, var2: 20 }; // Заменит значения двух переменных
state.data = { var1: 11 }; // Значения которые не указаны - не изменяются. var2 без изменений
// state = { data: {...}, another: {...} } - Не даст результатов. Быстрое изменение работает
//                                           только на вложенных объектах стейта.</code></pre>  
  
<h3>3. Return - модификация значения. Используй return из сеттера, чтобы изменить сохраняемое значение</h3>
<pre><code class="language-javascript">const config = {
   // начальное значение переменной
   variable_default: 10,
   variable(value) {
      // теперь значение всегда будет строкой
      return value.toString();
   },
};

// создаем стейт
const state = new State(config);

state.variable; // '10'
typeof state.variable; // 'string'</code></pre>
  
<h3>4. Методы стейта</h3>
<pre><code class="language-javascript">const config = {
   // префикс function_ превращает сеттер в метод
   function_sayHello(name) {
      // выводим приветственное сообщение
      alert('Hello, ' + name + '!');
   },
};

// создаем стейт
const state = new State(config);

state.sayHello('Albert'); // Hello, Albert!</code></pre>
  
<h3>5. Старое значение</h3>
<pre><code class="language-javascript">const config = {
   // начальное значение переменной
   variable_default: 10,
   variable(value, oldValue) {
      // вторым параметром сеттер получает значение до его изменения
      console.log(value, oldValue);
   },
};

// создаем стейт
const state = new State(config);

state.variable; // 10
state.variable++; // 11 10</code></pre>
  
<h3>6. Обращение к стейту через this</h3>
<pre><code class="language-javascript">const config = {
   variable() {
      console.log(this);
   }
  
   object: {
      variable() {
         console.log(this);
      }
   }
};

// создаем стейт
const state = new State(config);

// this указывает на стейт
state.variable++; // { variable: ..., object: ... }

// все объекты внутри стейта превращаются в State, поэтому this указывает на state.object
state.object.variable++; // { variable: ... }</code></pre>



<details><summary>Код индикаторов в верху страницы</summary>
<pre><code class="language-javascript">jQuery(function () {
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
});</code></pre>
</details>
</pre>
   </div>
   
   <script src="prism.js?v=<?= $VER ?>"></script>
   <script src="https://code.jquery.com/jquery-3.6.0.js" integrity="sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk=" crossorigin="anonymous"></script>
   <script src="state.js?v=<?= $VER ?>"></script>
   <script src="index.js?v=<?= $VER ?>"></script>
</body>
</html>

<?php $html = ob_get_clean(); ?>
<?php file_put_contents(__DIR__ . '/index.html', $html); ?>
<?php echo $html; ?>