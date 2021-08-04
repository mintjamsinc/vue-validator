# vue-validator
A reusable validator directive for Vue.js 2.x.

## Installation

```sh
npm install --save-dev @mintjamsinc/vue-validator
```

## Usage

```js
import VueValidator from '@mintjamsinc/vue-validator';
Vue.use(VueValidator);
```

```vue
<input type="text" :class="{'invalid': ($validator.errors('form1', 'propertyKey').length > 0)}" name="propertyKey" v-model="propertyKey" v-validator>
<div v-for="message in $validator.errors('form1', 'propertyKey')" :key="message">{{message}}</div>
```

```js
export default {
  data() {
    let vm = this;
    return {
      'propertyKey': '',
      'numLines': 5,
      'items': [],
      'validator': {
        'forms': {
          'form1': {
            'propertyKey': {
              'rules': 'required,contains',
              'contains': vm.validateContains
            },
            'numLines': {
              'rules': 'number',
              'number': {
                'min': 1,
                'max': 9,
              },
            },
          },
        },
      },
    };
  },
  methods: {
    clear() {
      // Configure programmatically
      vm.validator.forms['form1'] = {
        'minLength': {
          'rules': 'number,equalsOrLess',
          'number': {'min': 1},
          'equalsOrLess': vm.validateLengthEqualsOrLess
        },
        'maxLength': {
          'rules': 'number,equalsOrMore',
          'references': 'minLength',
          'number': {'min': 1},
          'equalsOrMore': vm.validateLengthEqualsOrMore
        },
      };
    },

    /*
     * Custom validators
     */
    validateContains(ev) {
      let vm = ev.validator.vm;
      let result = {
        'valid': true,
        'errors': []
      };

      let value = ev.value;
      if (ev.cond.trim === undefined || ev.cond.trim === true) {
        try {
          value = value.trim();
        } catch (e) {
          value = "";
        }
      }

      if (!value) {
        return result;
      }

      for (let item of vm.items) {
        if (item.key == value) {
          result.valid = false;
          result.errors.push('A property with the same name already exists.');
          break;
        }
      }

      return result;
    },
    validateLengthEqualsOrLess(ev) {
      // validation
    },
    validateLengthEqualsOrMore(ev) {
      // validation
    },
  },
}
```

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2021 MintJams Inc.