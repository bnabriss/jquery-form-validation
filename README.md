# jQuery form validation
jQuery form validation is a library that helps you to validate your html form, it's completable with booth bootstrap 3 and bootstrap 4.

### Installation 
##### via npm
``` 
npm install jquery-form-validation
```
##### direct download
```
https://raw.githubusercontent.com/bnabriss/jquery-form-validation/master/dist/jquery.form-validation.min.js
```

### How to use

#### Simple usage

##### html
```html
<form>
    <div class="form-group">
        <input class="form-control" data-validator="required|min:4|max:10">
    </div>
</form>
```
##### javascript
```javascript
$(document).on('blur', '[data-validator]', function () {
    new Validator($(this));
});
```

#### add feedback message
update your html to add element with selector `.form-control-feedback` belongs to the parent `.form-group` , you also should set the input label to bind it to the error message by adding the attribute `data-validator-label`.
```html
<form>
    <div class="form-group">
        <input class="form-control" data-validator-label="First Name" data-validator="required|min:4|max:10">
        <div class="form-control-feedback"></div>
    </div>
</form>
```

#### Customize options
You can pass your custom options as a second parameter to constructor.
```javascript
$(document).on('blur', '[data-validator]', function () {
    new Validator($(this), {/* your options here*/});
});
```
and here is a table of available options

| Tables        | default  |description  |
| ------------- | :------:|------|
| parentSelector | `'.form-group'` | you can set the parent selector for input, this used to set error/success classes and to search in it when search for feedback messages |
| feedbackSelector      |   `'.form-control-feedback'` |  this selector used to specify when the error message should appear when error occurs, this should be inside the specified parent |
| inputSuccessClass | `'is-valid'`  |   the class that should be given to the input when the input is valid |
| inputErrorClass | `'is-invalid'`  |   the class that should be given to the input when the input is invalid |
| feedbackSuccessClass | `'valid-feedback'`  |   the class that should be given to feedback element when the input is valid |
| feedbackErrorClass | `'invalid-feedback'`  |   the class that should be given to feedback element when the input is invalid |
| parentErrorClass | `'has-error'`  |   the class that should be given to the parent element when the input is invalid |
| parentWarningClass | `'has-warning'`  |   the class that should be given to the parent element when the input is invalid when the rule specified as warning rule |
| parentSuccessClass | `'has-success'`  |   the class that should be given to the parent element when the input is valid |
| rules | the `data-validator` value   |   this option will override the `data-validator` attribute value |
| validatorNameAttr |  `validator-label`    |   specify the label attribute of the input  |


#### warning errors
you can specify some rules as warning errors, this completable with bootstrap 3 (or your custom options) since it has `has-warnig` class for the parent `.form-group` 
```html
<form>
    <div class="form-group">
        <input class="form-control" data-validator="required|min:4|max:10" data-validator-warnings="min">
    </div>
</form>
```

