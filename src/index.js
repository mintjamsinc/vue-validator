// Copyright (c) 2021 MintJams Inc. Licensed under MIT License.

import Vue from 'vue';

const version = '1.2.0';

const compatible = (/^2\./).test(Vue.version);
if (!compatible) {
	Vue.util.warn('VueValidator ' + version + ' only supports Vue 2.x, and does not support Vue ' + Vue.version);
}

const VueValidator = {
	install(Vue/* , options */) {
		const getModel = function(vnode) {
			for (let i in vnode.data.directives) {
				let d = vnode.data.directives[i];
				if (d.name == 'model') {
					return d;
				}
			}
			return undefined;
		}

		const replaceVariables = function(text, variables) {
			return text.replace(/\$\{(.*?)\}/g, function(all, key) {
				return Object.prototype.hasOwnProperty.call(variables, key) ? variables[key] : "";
			});
		}

		const getRules = function(cond) {
			let ruleArray;
			if (Array.isArray(cond.rules)) {
				ruleArray = cond.rules;
			} else if (typeof cond.rules == 'string') {
				ruleArray = cond.rules.split(',');
			} else {
				ruleArray = [];
			}
			let rules = [];
			for (let rule of ruleArray) {
				try {
					rules.push(rule.trim());
				} catch (ex) {/* ignore */}
			}
			return rules;
		}

		const builtin = {
			messages: {
				"error.required": "The value is empty.",
				"error.invalid": "The value is invalid.",
				"error.string.fixedLength": "The length must be ${minLength} characters.",
				"error.string.minLength-maxLength": "The length must be between ${minLength} and ${maxLength} characters.",
				"error.string.minLength": "The length must be ${minLength} characters or more.",
				"error.string.maxLength": "The length must be ${maxLength} characters or less.",
				"error.number.fixed": "The value must be ${min}.",
				"error.number.min-max": "The value must be between ${min} and ${max}.",
				"error.number.min": "The value must be ${min} or greater.",
				"error.number.max": "The value must be ${max} or smaller.",
				"error.datetime.fixed": "The value must be ${min}.",
				"error.datetime.min-max": "The value must be between ${min} and ${max}.",
				"error.datetime.min": "The value must be ${min} or after.",
				"error.datetime.max": "The value must be ${max} or before."
			},
			validators: {
				required(ev) {
					let result = {
						valid: true,
						errors: []
					};

					let value = ev.value;

					if (ev.cond.trim === undefined || ev.cond.trim === true) {
						if (Array.isArray(value)) {
							for (let i = 0; i < value.length; i++) {
								if (typeof value[i] == 'string') {
									try {
										value[i] = value[i].trim();
									} catch (e) {
										value[i] = "";
									}
								}
							}
						} else {
							if (typeof value == 'string') {
								try {
									value = value.trim();
								} catch (e) {
									value = "";
								}
							}
						}
					}

					if (Array.isArray(value)) {
						if (value.join("").trim().length == 0) {
							result.valid = false;
							result.errors.push(ev.validator.getMessage('error.required', {}));
						}
					} else {
						if ([value].join("").trim().length == 0) {
							result.valid = false;
							result.errors.push(ev.validator.getMessage('error.required', {}));
						}
					}

					return result;
				},
				string(ev) {
					let result = {
						valid: true,
						errors: []
					};

					let options = ev.cond['string'];
					if (!options) {
						options = {};
					}

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

					if (options.minLength) {
						if (value.length < options.minLength) {
							result.valid = false;
						}
					}
					if (options.maxLength) {
						if (value.length > options.maxLength) {
							result.valid = false;
						}
					}

					if (!result.valid) {
						if (options.minLength && options.maxLength) {
							if (options.minLength == options.maxLength) {
								result.errors.push(ev.validator.getMessage('error.string.fixedLength', options));
							} else {
								result.errors.push(ev.validator.getMessage('error.string.minLength-maxLength', options));
							}
						} else if (options.minLength) {
							result.errors.push(ev.validator.getMessage('error.string.minLength', options));
						} else if (options.maxLength) {
							result.errors.push(ev.validator.getMessage('error.string.maxLength', options));
						}
					}

					return result;
				},
				number(ev) {
					let result = {
						valid: true,
						errors: []
					};

					let options = ev.cond['number'];
					if (!options) {
						options = {};
					}

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

					let valueNumber;
					try {
						valueNumber = new Number(value);
						if (isNaN(valueNumber)) {
							result.valid = false;
							result.errors.push(ev.validator.getMessage('error.invalid', options));
							return result;
						}
					} catch (e) {
						result.valid = false;
						result.errors.push(ev.validator.getMessage('error.invalid', options));
						return result;
					}

					if (options.min) {
						if (valueNumber < new Number(options.min)) {
							result.valid = false;
						}
					}
					if (options.max) {
						if (valueNumber > new Number(options.max)) {
							result.valid = false;
						}
					}

					if (!result.valid) {
						if (options.min && options.max) {
							if (new Number(options.min) == new Number(options.max)) {
								result.errors.push(ev.validator.getMessage('error.number.fixed', options));
							} else {
								result.errors.push(ev.validator.getMessage('error.number.min-max', options));
							}
						} else if (options.min) {
							result.errors.push(ev.validator.getMessage('error.number.min', options));
						} else if (options.max) {
							result.errors.push(ev.validator.getMessage('error.number.max', options));
						}
					}

					return result;
				},
				datetime(ev) {
					let result = {
						valid: true,
						errors: []
					};

					let options = ev.cond['datetime'];
					if (!options) {
						options = {};
					}

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

					let valueDate;
					try {
						valueDate = new Date(value);
						if (isNaN(valueDate.getTime())) {
							result.valid = false;
							result.errors.push(ev.validator.getMessage('error.invalid', options));
							return result;
						}
					} catch (e) {
						result.valid = false;
						result.errors.push(ev.validator.getMessage('error.invalid', options));
						return result;
					}

					if (options.min) {
						if (valueDate < new Date(options.min)) {
							result.valid = false;
						}
					}
					if (options.max) {
						if (valueDate > new Date(options.max)) {
							result.valid = false;
						}
					}

					if (!result.valid) {
						if (options.min && options.max) {
							if (new Date(options.min) == new Date(options.max)) {
								result.errors.push(ev.validator.getMessage('error.datetime.fixed', options));
							} else {
								result.errors.push(ev.validator.getMessage('error.datetime.min-max', options));
							}
						} else if (options.min) {
							result.errors.push(ev.validator.getMessage('error.datetime.min', options));
						} else if (options.max) {
							result.errors.push(ev.validator.getMessage('error.datetime.max', options));
						}
					}

					return result;
				}
			}
		};

		class Validator {
			constructor(vm) {
				this.vm = vm;
				this.eventListeners = [];
				this.elements = {};
				this.conditions = {};
			}

			getMessage(key, options) {
				let tmpl;
				try {
					tmpl = this.vm.validator.messages[key];
				} catch (ex) {/* ignore */}
				if (!tmpl) {
					tmpl = builtin.messages[key];
				}
				if (!tmpl) {
					console.warn('Unknown message key "' + key + '".');
					return '';
				}

				return replaceVariables(tmpl, options);
			}

			_validatorErrors(formName) {
				if (!formName) {
					return undefined;
				}

				try {
					let vm = this.vm;
					if (vm.validator.errors == undefined) {
						return undefined;
					}
					return vm.validator.errors[formName];
				} catch (e) {
					return undefined;
				}
			}

			_formNames() {
				return Object.keys(this.elements);
			}

			errors(formName, fieldName) {
				try {
					if (!formName) {
						let errors = [];
						for (let k of this._formNames()) {
							for (let message of this.errors(k)) {
								errors.push(message);
							}
						}
						return errors;
					}

					let form = this._validatorErrors(formName);
					if (form == undefined) {
						return [];
					}

					let keys = fieldName ? [fieldName] : Object.keys(form);
					let errors = [];
					for (let k of keys) {
						if (form[k] == undefined) {
							continue;
						}
						for (let message of form[k]) {
							errors.push(message);
						}
					}

					return errors;
				} catch (e) {
					return [];
				}
			}

			hasErrors(formName, fieldName) {
				try {
					if (!formName) {
						for (let k of this._formNames()) {
							if (this.hasErrors(k)) {
								return true;
							}
						}
						return false;
					}

					let form = this._validatorErrors(formName);
					if (form == undefined) {
						return false;
					}

					let keys = fieldName ? [fieldName] : Object.keys(form);
					for (let k of keys) {
						if (form[k] == undefined) {
							continue;
						}
						if (form[k].length > 0) {
							return true;
						}
					}

					return false;
				} catch (e) {
					console.error(e);
					return undefined;
				}
			}

			clearErrors(formName, fieldName) {
				try {
					if (!formName) {
						if (this.vm.validator.errors != undefined) {
							Vue.set(this.vm.validator, 'errors', {});
						}
						return;
					}

					let form = this._validatorErrors(formName);
					if (form == undefined) {
						return;
					}

					if (!fieldName) {
						Vue.set(this.vm.validator.errors, formName, {});
						return;
					}

					if (Array.isArray(form[fieldName]) && form[fieldName].length > 0) {
						form[fieldName].splice(0);
					}
				} catch (e) {
					console.error(e);
				}
			}

			setErrors(formName, fieldName, messages) {
				try {
					if (!formName) {
						return;
					}
					if (!fieldName) {
						return;
					}
					if (!messages) {
						return;
					}
					if (this.vm.validator.errors == undefined) {
						Vue.set(this.vm.validator, 'errors', {});
					}
					if (this.vm.validator.errors[formName] == undefined) {
						Vue.set(this.vm.validator.errors, formName, {});
					}
					Vue.set(this.vm.validator.errors[formName], fieldName, messages);
				} catch (e) {
					console.error(e);
				}
			}

			isDirty(formName) {
				try {
					if (!formName) {
						for (let k of this._formNames()) {
							if (this.isDirty(k)) {
								return true;
							}
						}
						return false;
					}

					if (this.vm.validator.dirtys == undefined) {
						return false;
					}
					return (this.vm.validator.dirtys.indexOf(formName) != -1);
				} catch (e) {
					console.error(e);
					return undefined;
				}
			}

			markDirty(formName) {
				try {
					if (!formName) {
						for (let k of this._formNames()) {
							this.markDirty(k);
						}
						return;
					}

					if (this.vm.validator.dirtys == undefined) {
						Vue.set(this.vm.validator, 'dirtys', []);
					}
					if (this.vm.validator.dirtys.indexOf(formName) == -1) {
						this.vm.validator.dirtys.push(formName);
					}
				} catch (e) {
					console.error(e);
				}
			}

			clearDirty(formName) {
				try {
					if (!formName) {
						for (let k of this._formNames()) {
							this.clearDirty(k);
						}
						return;
					}

					if (this.vm.validator.dirtys == undefined) {
						return;
					}

					if (formName) {
						let i = this.vm.validator.dirtys.indexOf(formName);
						if (i != -1) {
							this.vm.validator.dirtys.splice(i, 1);
						}
					} else {
						this.vm.validator.dirtys.splice(0);
					}
				} catch (e) {
					console.error(e);
				}
			}

			clear(formName) {
				this.clearDirty(formName);
				this.clearErrors(formName);
				if (formName) {
					delete this.conditions[formName];
				} else {
					this.conditions = {};
				}
			}

			validate(formName, fieldName, options) {
				if (!formName) {
					return;
				}
				if (!options) {
					options = {};
				}

				if (!fieldName) {
					for (let name in this.elements[formName]) {
						this.validate(formName, name, options);
					}
					return;
				}

				if (Array.isArray(options.ignoreFieldNames)) {
					if (options.ignoreFieldNames.indexOf(fieldName) != -1) {
						return;
					}
				}

				let el = this.elements[formName][fieldName].el;
				let vnode = this.elements[formName][fieldName].vnode;

				let model = getModel(vnode);
				if (!model) {
					console.warn('Cannot obtain model on element "' + formName + '.' + fieldName + '".');
					return;
				}

				if (model.value != model.oldValue) {
					this.markDirty(formName);
				}

				let cond;
				try {
					cond = this.vm.validator.forms[formName][fieldName];
				} catch (ex) {/* ignore */}
				if (!cond) {
					this.clearErrors(formName, fieldName);

					try {
						let fn = vnode.context.validator.on;
						if (typeof fn == 'function') {
							let ev = {
								"type": 'noConditionFound',
								"formName": formName,
								"fieldName": fieldName,
								"value": model.value,
								"hasErrors": false,
								"el": el,
								"vnode": vnode,
								"validator": this
							};
							fn(ev);
						}
					} catch (ex) {/* ignore */}
				}

				let force = !!options.force;
				let errors = [];
				if (cond) {
					if (cond.force) {
						force = true;
					}
					delete cond.force;

					let condStr = JSON.stringify(cond);
					if (!force) {
						if (model.value == model.oldValue) {
							return;
						}
					}
					if (this.conditions[formName] == undefined) {
						this.conditions[formName] = {};
					}
					this.conditions[formName][fieldName] = condStr;

					this.clearErrors(formName, fieldName);
					let rules = getRules(cond);
					for (let rule of rules) {
						if (!rule) {
							continue;
						}

						let options = cond[rule];
						let fn = undefined;
						if (typeof options == 'function') {
							fn = options;
						} else {
							fn = builtin.validators[rule];
						}

						if (typeof fn != 'function') {
							console.warn('Unknown validator "' + rule + '": ' + el);
							continue;
						}

						let result = fn({
							"formName": formName,
							"fieldName": fieldName,
							"value": model.value,
							"oldValue": model.oldValue,
							"cond": cond,
							"el": el,
							"vnode": vnode,
							"validator": this
						});
						if (typeof result != 'object') {
							continue;
						}

						if (!result.valid) {
							if (Array.isArray(result.errors)) {
								errors = errors.concat(result.errors);
							}
						}
					}

					if (errors.length > 0) {
						this.setErrors(formName, fieldName, errors);
					}
				}

				if (!force && model.value != model.oldValue) {
					let references = Object.keys(this.elements[formName]);
					for (let refFieldName of references) {
						if (refFieldName == el.name) {
							continue;
						}

						let refCond;
						try {
							refCond = this.vm.validator.forms[formName][refFieldName];
						} catch (ex) {/* ignore */}
						if (!refCond) {
							continue;
						}
						refCond.force = true;
						if (!Array.isArray(options.ignoreFieldNames)) {
							options.ignoreFieldNames = [];
						}
						options.ignoreFieldNames.push(fieldName);
						this.validate(formName, refFieldName, options);
					}
				}

				{
					let ev = {
						"type": 'validated',
						"formName": formName,
						"fieldName": fieldName,
						"value": model.value,
						"hasErrors": (errors.length > 0),
						"el": el,
						"vnode": vnode,
						"validator": this
					};
					if (errors.length > 0) {
						ev.errors = errors;
					}
					for (let listener of this.eventListeners) {
						try {
							listener(ev);
						} catch (ex) {/* ignore */}
					}
				}

				try {
					let fn = vnode.context.validator.on;
					if (typeof fn == 'function') {
						let ev = {
							"type": 'validated',
							"formName": formName,
							"fieldName": fieldName,
							"value": model.value,
							"hasErrors": (errors.length > 0),
							"el": el,
							"vnode": vnode,
							"validator": this
						};
						if (errors.length > 0) {
							ev.errors = errors;
						}
						fn(ev);
					}
				} catch (ex) {/* ignore */}
			}

			on(listener) {
				if (typeof listener !== 'function') {
					return;
				}
				if (this.eventListeners.indexOf(listener) == -1) {
					this.eventListeners.push(listener);
				}
			}

			off(listener) {
				if (typeof listener !== 'function') {
					return;
				}
				let index = this.eventListeners.indexOf(listener);
				if (index != -1) {
					this.eventListeners.splice(index, 1);
				}
			}
		}

		Vue.mixin({
			created() {
				let vm = this;
				vm.$validator = new Validator(vm);
			}
		});

		Vue.directive('validator', {
			inserted(el, binding, vnode) {
				if (!el.name) {
					console.warn('The name attribute is not specified: ' + el.outerHtml);
					return;
				}

				if (!el.form) {
					console.warn('FORM element not found: ' + el.outerHtml);
					return;
				}

				let formName = el.form.name;
				if (!formName) {
					console.warn('FORM name is not specified: ' + el.outerHtml);
					return;
				}

				let $validator = vnode.context.$validator;
				if ($validator.elements[formName] == undefined) {
					$validator.elements[formName] = {};
				}
				if ($validator.elements[formName][el.name] == undefined) {
					$validator.elements[formName][el.name] = {};
				}
				$validator.elements[formName][el.name] = {
					"el": el,
					"binding": binding,
					"vnode": vnode
				};

				try {
					let fn = vnode.context.validator.on;
					if (typeof fn == 'function') {
						let ev = {
							'type': 'inserted',
							'formName': formName,
							'fieldName': el.name,
							'el': el,
							"binding": binding,
							"vnode": vnode,
							"validator": $validator
						};
						fn(ev);
					}
				} catch (ex) {/* ignore */}
			},
			update(el, binding, vnode) {
				if (!el.name) {
					return;
				}

				if (!el.form) {
					return;
				}

				let formName = el.form.name;
				if (!formName) {
					return;
				}

				let $validator = vnode.context.$validator;
				if ($validator.elements[formName] == undefined) {
					$validator.elements[formName] = {};
				}
				if ($validator.elements[formName][el.name] == undefined) {
					$validator.elements[formName][el.name] = {};
				}
				$validator.elements[formName][el.name] = {
					"el": el,
					"binding": binding,
					"vnode": vnode
				};

				vnode.context.$validator.validate(formName, el.name);
			},
			unbind(el, binding, vnode) {
				try {
					let formName = el.form.name;
					if (formName == undefined) {
						return;
					}

					delete vnode.context.$validator.vnodes[formName][el.name];
					if (Object.keys(vnode.context.$validator.vnodes[formName]).length == 0) {
						delete vnode.context.$validator.vnodes[formName];
					}
				} catch (ex) {/* ignore */}
			}
		});
	}
};

export default VueValidator
