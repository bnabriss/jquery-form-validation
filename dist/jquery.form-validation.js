/* global $, jQuery */
var Validator = function () {
    function Validator($selector, options) {
        options = options === undefined ? {} : options;
        options = $.extend({
            parentSelector: '.form-group',
            feedbackSelector: '.form-control-feedback',

            inputSuccessClass: 'is-valid',
            inputErrorClass: 'is-invalid',

            feedbackSuccessClass: 'valid-feedback',
            feedbackErrorClass: 'invalid-feedback',

            parentErrorClass: 'has-error',
            parentWarningClass: 'has-warning',
            parentSuccessClass: 'has-success',

            rules: '',

            validatorNameAttr: 'validator-label'
        }, options);
        this.language = $.extend(this.language, options.language );

        this.options = options;

        this.$input = $selector;
        this.$parent = this.$input.closest(options.parentSelector);
        this.$feedback = this.$parent.find(options.feedbackSelector);
        this.$form = this.getForm(this.$input);

        this.resetStyle();
        this.val = this.$input.val();
        this.name = this.$input.attr('name');
        this.label = this.getLabelByName(this.name) ? this.getLabelByName(this.name) : this.$input.data('validator-label');
        this.otherName = null;
        this.rules = this.first_element(options.rules, this.$input.data('validator'));

        this.rulesObject = this.first_element(this.getRules(), {});
        this.warnings = this.first_element('', this.$input.data('validator-warnings')).split('|');

        var firstError = this.getFirstError();
        if (firstError){
            this.showError(firstError);
            this.$feedback.removeClass(this.options.feedbackSuccessClass).addClass(this.options.feedbackErrorClass);
            this.$input.removeClass(this.options.inputSuccessClass).addClass(this.options.inputErrorClass);
            if (firstError && this.contains(this.warnings, firstError)) {
                // warning
                this.setStatus('warning');
            } else {
                this.setStatus('error');
            }
        }else{
            this.$parent.addClass(this.options.parentSuccessClass);

            this.$feedback.removeClass(this.options.feedbackErrorClass).addClass(this.options.feedbackSuccessClass);
            this.$input.removeClass(this.options.inputErrorClass).addClass(this.options.inputSuccessClass);
        }

    }

    Validator.prototype.getLabelByName = function (name) {
        name = name ? name : this.otherName;
        var $input = this.getInput(this.$form, '[name="' + name + '"]');
        var label = $input.data(this.options.validatorNameAttr);
        return label ? label.trim() : null;
    };

    Validator.prototype.showMessage = function (message) {
        if (this.$feedback.data('html') !== undefined) {
            this.$feedback.data('html', this.$feedback.html());
        }
        this.$feedback.html(message);
    };
    Validator.prototype.showError = function (errorKey) {
        var params = this.rulesObject[errorKey];
        if (this.label) {
            var items = { 'label': this.label };
            if (this.otherName) {
                items['otherLabel'] = this.getLabelByName();
            }
            for (var i = 0, max = params.length; i < max; i++) {
                items['param' + i] = params[i];
            }
            var message = this.getValidator(errorKey, items);
            this.showMessage(message);
        }
    };
    Validator.prototype.setStatus = function (type) {
        this.$parent.removeClass('has-warning');
        this.$parent.removeClass('has-error');
        this.$parent.removeClass('has-success');
        this.$parent.removeClass('has-loading');
        if (type) {
            this.$parent.addClass('has-' + type);
        }
    };
    Validator.prototype.resetStyle = function () {
        this.$feedback.html(this.$feedback.data('html') ? this.$feedback.data('html') : '' );
        this.setStatus();
    };

    Validator.prototype.getRules = function () {
        var rulesObject = {};
        var exploded = this.rules.split('|');
        $.each(exploded, function () {
            var fncAndParm = this;
            var funcName = fncAndParm.split(':')[0];
            var paramStr = fncAndParm.split(':')[1];
            rulesObject[funcName] = paramStr ? paramStr.split(',') : [];
        });
        return rulesObject;
    };
    Validator.prototype.getFirstError = function () {
        var that = this;

        if (!this.required() && !this.rulesObject.hasOwnProperty('required')) {
            // require failed and not needed
            if (this.rulesObject.hasOwnProperty('required_if') && !this['required_if'].apply(that, this.rulesObject['required_if'])) {
                return 'required_if';
            }
            return null;
        }
        var firstError = null;
        $.each(this.rulesObject, function (fncName, params) {
            if (!that[fncName].apply(that, params)) {
                firstError = fncName;
                return false;
            }
        });
        return firstError;
    };

    Validator.prototype.valLength = function (customVal) {
        var val = customVal ? customVal : this.val;
        if (typeof val === 'string') {
            return val.length;
        }
        return 0;
    };
    Validator.prototype.getDateTimestamp = function (date) {
        var now = new Date(date ? date : null);
        var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return startOfDay.getTime();
    };

    /****  Start rules ****/
    Validator.prototype.required = function () {
        return this.valLength() !== 0;
    };
    Validator.prototype.numeric = function () {
        return parseFloat(this.val) === this.getFloat(this.val);
    };
    Validator.prototype.integer = function () {
        console.log(this.val);
        return parseInt(this.val) === this.getFloat(this.val);
    };
    Validator.prototype.between_numeric = function (min, max) {
        var val = this.getFloat(this.val);
        min = this.getFloat(min);
        max = this.getFloat(max);
        return val >= min && val <= max;
    };
    Validator.prototype.max_numeric = function (max) {
        return this.getFloat(this.val) <= this.getFloat(max);
    };
    Validator.prototype.min_numeric = function (min) {
        return this.getFloat(this.val) >= this.getFloat(min);
    };
    Validator.prototype.size_numeric = function (siz) {
        return this.getFloat(this.val) === this.getFloat(siz);
    };

    Validator.prototype.between = function (min, max) {
        var val = this.valLength();
        min = this.getInt(min);
        max = this.getInt(max);
        return val >= min && val <= max;
    };
    Validator.prototype.max = function (max) {
        return this.valLength() <= this.getInt(max);
    };
    Validator.prototype.min = function (min) {
        return this.valLength() >= this.getInt(min);
    };
    Validator.prototype.size = function (siz) {
        return this.valLength() === this.getInt(siz);
    };
    Validator.prototype.date = function () {
        return !isNaN(new Date(this.val).getTime());
    };
    Validator.prototype.before = function (date) {
        var inpStamp = new Date(this.val).getTime();
        return inpStamp < this.getDateTimestamp(date);
    };
    Validator.prototype.before_or_equal = function (date) {
        var inpStamp = new Date(this.val).getTime();
        return inpStamp <= this.getDateTimestamp(date);
    };
    Validator.prototype.after = function (date) {
        var inpStamp = new Date(this.val).getTime();
        return inpStamp > this.getDateTimestamp(date);
    };
    Validator.prototype.after_or_equal = function (date) {
        var inpStamp = new Date(this.val).getTime();
        return inpStamp >= this.getDateTimestamp(date);
    };
    Validator.prototype.age = function (age) {
        age = this.getFloat(age);
        var now = new Date();
        var ageStamp = new Date(now.getFullYear() - age, now.getMonth(), now.getDate());
        ageStamp = ageStamp.getTime();
        var inpStamp = this.getDateTimestamp(this.val);
        return inpStamp <= ageStamp;
    };
    Validator.prototype.email = function () {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(this.val);
    };
    Validator.prototype.in = function () {
        return this.contains(arguments, this.val);
    };
    Validator.prototype.not_in = function () {
        return !this.contains(arguments, this.val);
    };
    Validator.prototype.regex = function (rex) {
        var re = new RegExp(rex);
        return re.test(this.val);
    };
    Validator.prototype.different = function (otherName) {
        this.otherName = otherName;
        this.triggerOtherName(otherName);
        var otherValue = this.serializeArrayKv(this.$form)[otherName];
        return this.val !== otherValue;
    };
    Validator.prototype.required_if = function (otherName) {
        this.otherName = otherName;
        this.triggerOtherName(otherName);
        var otherValue = this.serializeArrayKv(this.$form)[otherName];
        return otherValue ? this.required() : true;
    };
    Validator.prototype.required_if_val = function (otherName, specificValue) {
        this.otherName = otherName;
        this.triggerOtherName(otherName);
        var otherValue = this.serializeArrayKv(this.$form)[otherName];
        if (this.valLength(specificValue) && otherValue === specificValue) {
            // checked value === other value
            return this.required();
        }
        return true;
    };
    Validator.prototype.same = function (otherName) {
        this.otherName = otherName;
        this.triggerOtherName(otherName);
        return !this.different(otherName);
    };

    Validator.prototype.url = function () {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?' + // port
            '(\\/[-a-z\\d%_.~+&:]*)*' + // path
            '(\\?[;&a-z\\d%_.,~+&:=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return pattern.test(this.val);
    };
    Validator.prototype.triggerOtherName = function (otherName) {
        var that = this;

        function triggerEvent() {
            that.$input.trigger('blur');
        }

        that.getInput(this.$form, '[name="' + otherName + '"]').off('change.validator').on('change.validator', triggerEvent);
    };

    Validator.prototype.first_element = function () {
        for (var i = 0, max = arguments.length; i < max; i++) {
            var item = arguments[i];
            if (!(item instanceof jQuery && item.length === 0) && item !== null && item !== '' && typeof item !== 'undefined') return item;
        }
        return arguments[0];
    };
    Validator.prototype.getInt = function (obj) {
        var parsed = parseInt(obj);
        return isNaN(parsed) ? 0 : parsed;
    };
    Validator.prototype.getFloat = function (obj) {
        var parsed = parseFloat(obj);
        return isNaN(parsed) ? 0 : parsed;
    };
    Validator.prototype.getInput = function ($obj, selector) {
        var id = $obj.attr('id');
        return this.first_element($(selector + '[form="' + id + '"]'), $obj.find(selector));
    };

    Validator.prototype.getForm = function ($obj) {
        if ($obj.attr('form')) {
            return $('form#' + $obj.attr('form'));
        }
        return $obj.closest('form');
    };

    Validator.prototype.contains = function (array, search) {
        return array.indexOf(search) !== -1;
    };

    Validator.prototype.replaceAll = function (target, search, replacement) {
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    Validator.prototype.getValidator = function (msgKey, items) {
        msgKey = String(msgKey);
        var message = this.language[msgKey];
        return this.parseData(message, items);
    };
    Validator.prototype.parseData = function (message, data) {
        var that = this;
        $.each(data ? data : {}, function (i, v) {
            message = that.replaceAll(message, '{' + i + '}', v);
        });
        return message;
    };
    Validator.prototype.serializeArrayKv = function ($form) {
        var arr = $form.serializeArray(), obj = {};
        for (var i = 0; i < arr.length; ++i)
            obj[arr[i].name] = arr[i].value;
        return obj;
    };
    Validator.prototype.language = {
        numeric: 'The {label} must be a number.',
        integer: 'The {label} must be an integer.',
        between_numeric: 'The {label} must be between {param0} and {param1}.',
        max_numeric: 'The {label} may not be greater than {param0}.',
        min_numeric: 'The {label} must be at least {param0}.',
        size_numeric: 'The {label} must be {param0}.',
        between: 'The {label} must be between {param0} and {param1} characters.',
        max: 'The {label} may not be greater than {param0} characters.',
        min: 'The {label} must be at least {param0} characters.',
        size: 'The {label} must be {param0} characters.',
        date: 'The {label} must be a date after {param0}.',
        before: 'The {label} must be a date before {param0}.',
        before_or_equal: 'The {label} must be a date before or equal to {param0}.',
        after: 'The {label} must be a date after {param0}.',
        after_or_equal: 'The {label} must be a date after or equal to {param0}.',
        age: 'The age should be more than {param0}.',
        email: 'The  {label} must be a valid email address.',
        in: 'The selected {label} is invalid.',
        not_in: 'The selected {label} is invalid.',
        different: 'The {label} and {otherLabel} must be different.',
        required: 'The {label} field is required.',
        required_if: 'The {label} field is required when {otherLabel} is filled.',
        required_if_val: 'The {label} field is required when {otherLabel} is {param0}',
        same: 'The {label} and {otherLabel} must match.',
        url: 'The {label} format is invalid.',
        regex: 'The {label} format is invalid.'
    };

    return Validator;
}();
